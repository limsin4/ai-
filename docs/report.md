# AI Panel Studio 开发过程与工作流说明

## 1. 项目目标与开发方式

本项目的目标是完成一个“AI 圆桌讨论 Web App MVP”。它不是简单的一次性问答页面，而是要模拟一场有主持人、有多位专家、有 transcript、有观众追问、有共识分歧沉淀和最终总结的 AI 圆桌讨论。因此我没有采用“一个 Prompt 直接生成整个项目”的方式，而是用 Claude Code 作为主要工程环境，结合 DeepSeek 作为业务模型能力，按照 SDD、DDD、TDD、E2E 的阶段逐步完成。

Claude Code 在这个项目中主要承担工程化协作角色：阅读需求、拆分任务、生成和修改代码、运行测试、检查构建结果、整理文档和提交记录。DeepSeek 则被设计为产品运行时的大模型服务：负责生成主持人与专家阵容、根据 transcript 生成下一轮发言、提炼共识分歧，以及生成最终主持人总结。二者分工明确，避免把开发过程和产品运行逻辑混在一起。

## 2. SDD：先明确需求和契约

第一阶段是 SDD，即 Spec / Schema Driven Development。我先根据作业截图整理 `docs/sdd.md`，把产品目标、用户画像、核心用户流程、MVP 功能范围、不做范围、页面列表、API 列表、数据结构草案和验收标准写清楚。

这个阶段的重点是先定义“系统应该是什么”，而不是马上写页面。比如作业要求中强调：主持人要负责开场、追问、串场和总结；专家不能机械轮流发言；transcript 不能暴露“举手”“内部思考”等调度事件；API Key 不能暴露到浏览器端。这些都在 SDD 中转成了可检查的约束。

SDD 的价值在于后续开发不会偏离作业重点。比如后面实现前端时，我始终围绕“主持人和专家阵容、transcript、观众追问、共识分歧、总结”这几个核心区域展开，而不是做成普通聊天机器人。

## 3. DDD：定义领域模型和模块职责

第二阶段是 DDD，即 Design Driven Development。我在 `docs/ddd.md` 和 `lib/types.ts` 中定义了核心领域对象，包括：

- `Participant`：主持人或专家，包含姓名、Title、职业、立场、关注点、颜色和状态。
- `Message`：用户可见的 transcript 发言。
- `DiscussionSession`：一场完整讨论的聚合根。
- `Insight`：共识或分歧。
- `UserQuestion`：观众追问。
- `DiscussionSummary`：最终总结。

同时我划分了模块职责：`lib/prompts.ts` 只负责 Prompt 生成，`lib/deepseek.ts` 只负责 DeepSeek API 调用，`lib/discussionEngine.ts` 只负责纯业务状态处理，`app/api/*` 只负责请求校验和服务端 API。这样可以保证 DeepSeek API Key 只存在后端，前端组件不会直接接触模型调用。

## 4. Prompt 设计：让 DeepSeek 输出可控结果

Prompt 设计记录在 `docs/prompt-record.md` 中。项目中主要有三个 Prompt：

1. `generateRolesPrompt`：根据中文议题生成 1 位主持人和多位专家。
2. `generateTurnPrompt`：根据当前 transcript、角色立场和用户追问生成下一轮发言。
3. `generateSummaryPrompt`：生成主持人口吻的自然语言总结。

这些 Prompt 都面向 DeepSeek V4 Pro 的使用习惯设计，尽量要求输出合法 JSON，并明确禁止输出 Markdown、代码块、解释性废话、内部调度流程和推理链路。这样做是因为前端和 API 需要结构化结果，例如 `speakerId`、`content`、`consensusDelta`、`disagreementDelta`、`shouldFinish` 等字段。如果模型输出混入自然解释，后端解析就容易失败。

同时，Prompt 中还约束“不要机械轮流发言”，让模型根据 transcript 判断谁更适合发言。这是为了让圆桌讨论更像真实观点推进，而不是固定顺序的机器人轮流回答。

## 5. TDD：先写测试再补业务逻辑

第三阶段是 TDD。我先在 `tests/discussionEngine.test.ts` 和 `tests/prompts.test.ts` 中写测试，覆盖核心业务目标：

- 创建讨论 session。
- 默认生成 1 名主持人和 4 名专家。
- 添加发言记录。
- 添加用户问题。
- 生成最终总结结构。
- Prompt 中包含 JSON、DeepSeek V4 Pro、禁止内部流程、自然语言总结等约束。

这些测试一开始会暴露缺失的业务函数，例如 `createDiscussionSession`、`addMessageToSession`、`addUserQuestionToSession`、`createFinalSummary`。随后再实现最小业务逻辑让测试通过。这样能保证项目不是只靠页面堆出来，而是有稳定的核心状态模型。

最终验证命令包括：

```bash
npm test
npx tsc --noEmit
npm run build
```

## 6. 功能实现：API、前端、SQLite 和 SSE

API 层实现了四个 POST 接口：

- `/api/generate-roles`
- `/api/generate-discussion`
- `/api/ask-question`
- `/api/generate-summary`

每个接口都使用 Zod 校验输入，并通过统一工具返回明确错误信息。DeepSeek Key 从 `.env.local` 中读取，支持 `DEEPSEEK_KEY` 和 `DEEPSEEK_API_KEY` 两种变量名。

前端使用 Next.js App Router 和 TailwindCSS 实现。首页先输入议题和专家人数，调用生成嘉宾 API 后展示阵容预览，用户确认后进入演播厅。演播厅左侧展示主持人和专家，中间展示 transcript，底部提供观众追问、生成下一轮专家发言和 JSON 总结功能。

为了满足作业数据库要求，我补充了 SQLite 相关文件：`db/schema.sql`、`db/seed.sql`、`scripts/init-db.js`，并提供 `npm run db:init` 初始化命令。样例数据包含 5 场讨论和 25 位嘉宾。

另外项目提供了 SSE 事件流接口 `/api/discussions/:id/events`，前端会显示 SSE 连接状态，用于满足实时更新机制的技术要求。

## 7. 遇到的问题与解决方式

开发过程中有几个典型问题：

第一，模型输出不稳定。解决方式是在 Prompt 中明确要求合法 JSON，并在 `lib/deepseek.ts` 中增加 JSON 提取和错误处理。

第二，前端一开始只是本地假数据，没有真正调用 API。后续根据 E2E 检查清单逐项修复：首页调用 `generate-roles`，演播厅调用 `generate-discussion`，追问调用 `ask-question`，总结调用 `generate-summary`。

第三，总结后页面出现三栏卡片挤压 transcript 的布局问题。解决方式是恢复演播厅右侧为稳定的三段式布局：标题、transcript、底部操作区，把总结展示保留在 JSON 区域，避免界面重叠。

第四，GitHub 仓库已有初始提交。推送时没有强制覆盖，而是使用合并方式保留远程历史，并用中文 commit 记录体现完整工程过程。

## 8. 对工程化 AI 开发的理解

这个项目让我更明确地认识到，AI 开发不应该只是“一次生成代码”。更可靠的方式是先把需求、数据结构、Prompt、测试和验收标准拆开，再让 AI 在每个阶段完成明确任务。Claude Code 适合承担工程协作和迭代修改，DeepSeek 适合承担产品运行时的语言生成能力。两者结合时，最关键的是边界清晰：开发工具负责工程过程，大模型 API 负责业务生成，测试和文档负责保证结果可追溯、可验证、可交付。

因此，本项目最终不仅包含可运行代码，也包含 SDD、DDD、Prompt 记录、TDD 测试、SQLite 初始化、E2E 清单和中文 Git 提交历史，用来说明这是一个经过阶段化开发的 MVP，而不是单次 Prompt 生成的静态页面。
