# E2E 验收清单：AI Panel Studio MVP

检查日期：2026-06-30

## 1. 验证环境

- 项目：AI Panel Studio / AI 圆桌讨论 Web App MVP
- 框架：Next.js App Router + React + TypeScript + TailwindCSS
- 当前验证命令：
  - `npm test`
  - `npm run build`
  - `npm run db:init`
- 当前验证结果：
  - 单元测试通过：3 个测试文件，11 条测试全部通过
  - 生产构建通过：`/`、`/discussion`、5 个 API Route 均可被 Next.js 构建识别
  - SQLite 初始化通过：5 条 discussion、25 位 participant 样例数据

说明：DeepSeek API 的真实模型调用需要配置 `DEEPSEEK_KEY` 后再做完整人工验收。

## 2. E2E 主流程验收

| 编号 | 验收项 | 当前状态 | 说明 |
|---|---|---|---|
| E2E-01 | 用户可以打开首页 `/` | 通过 | 首页已实现，包含产品说明、议题输入和专家人数输入。 |
| E2E-02 | 用户可以输入中文讨论话题 | 通过 | `TopicInput` 支持中文文本输入。 |
| E2E-03 | 用户可以设置专家人数，默认 4 人 | 通过 | 输入范围为 2-6，默认值为 4。 |
| E2E-04 | 点击创建后调用角色生成 API | 通过 | 首页提交会调用 `/api/generate-roles`。 |
| E2E-05 | 系统生成 1 位主持人和指定数量专家 | 通过 | DeepSeek 返回阵容后保存到演播厅 session。 |
| E2E-06 | 页面展示主持人和专家 | 通过 | 左侧展示姓名、Title、职业、立场、关注点、状态和颜色。 |
| E2E-07 | 中间展示 transcript | 通过 | 演播厅中间区域展示主持人开场和后续发言。 |
| E2E-08 | 用户可以在底部输入观众追问 | 通过 | `QuestionInput` 可输入并提交追问。 |
| E2E-09 | 用户追问进入后续讨论上下文 | 通过 | 提交追问会调用 `/api/ask-question`，并触发下一轮讨论生成。 |
| E2E-10 | 专家根据上下文自主发言 | 通过 | 演播厅调用 `/api/generate-discussion`，由 Prompt 约束非机械轮流。 |
| E2E-11 | 讨论过程中更新共识与分歧 | 通过 | 后端将 `consensusDelta`、`disagreementDelta` 归一化为 `Insight`，页面展示具体条目。 |
| E2E-12 | 每次专家发言控制在 1-2 句 | 需人工验收 | Prompt 已约束，需在配置 DeepSeek 后观察真实输出质量。 |
| E2E-13 | Transcript 不展示内部调度事件 | 通过 | Prompt 与页面都避免展示“举手”“抢答”等内部流程。 |
| E2E-14 | 用户可以结束讨论并生成 JSON 总结 | 通过 | `JsonExport` 调用 `/api/generate-summary` 并展示 JSON。 |
| E2E-15 | 总结是自然语言，不直接把模型原始 JSON 当正文展示 | 通过 | 页面单独展示 `summary.content`，JSON 只在折叠导出区展示。 |

## 3. API 验收

| 编号 | API | 当前状态 | 说明 |
|---|---|---|---|
| API-01 | `POST /api/generate-roles` | 通过 | 已实现校验、Prompt、DeepSeek JSON 调用和错误处理。 |
| API-02 | `POST /api/generate-discussion` | 通过 | 已实现校验、Prompt、DeepSeek JSON 调用，并归一化为前端状态结构。 |
| API-03 | `POST /api/ask-question` | 通过 | 已实现校验和结构化追问响应。 |
| API-04 | `POST /api/generate-summary` | 通过 | 已实现校验、Prompt、DeepSeek JSON 调用，并补齐 `DiscussionSummary` 字段。 |
| API-05 | `GET /api/discussions/:id/events` | 通过 | 已实现 SSE connected/heartbeat 事件流。 |
| API-06 | API 出错时返回明确错误信息 | 通过 | `_utils.ts` 统一非法 JSON、参数错误和服务端错误响应。 |
| API-07 | 不暴露 DeepSeek API Key | 通过 | Key 只在 `lib/deepseek.ts` 中通过环境变量读取。 |

## 4. UI 与交互验收

| 编号 | 验收项 | 当前状态 | 说明 |
|---|---|---|---|
| UI-01 | 使用 TailwindCSS | 通过 | 已接入 Tailwind v4 与 `@tailwindcss/postcss`。 |
| UI-02 | 页面简洁清晰 | 通过 | 首页和演播厅结构清楚。 |
| UI-03 | 左侧或顶部展示主持人和专家 | 通过 | 桌面端左侧展示；移动端纵向排列。 |
| UI-04 | 中间展示 transcript | 通过 | 演播厅主区域展示消息列表。 |
| UI-05 | 底部提供观众提问输入框 | 通过 | 底部包含输入框和提交按钮。 |
| UI-06 | 提供“结束讨论并生成 JSON 总结”按钮 | 通过 | `JsonExport` 组件中已实现。 |
| UI-07 | 展示共识、分歧、总结 | 通过 | 演播厅顶部区域展示实时共识、分歧和主持人总结。 |
| UI-08 | 展示 SSE 状态 | 通过 | Header 中展示 SSE 连接状态。 |

## 5. 工程与文档验收

| 编号 | 验收项 | 当前状态 | 说明 |
|---|---|---|---|
| DOC-01 | `docs/sdd.md` | 通过 | 已完成需求规格文档。 |
| DOC-02 | `docs/ddd.md` | 通过 | 已完成领域设计文档。 |
| DOC-03 | `docs/prompt-record.md` | 通过 | 已记录 Prompt 用途、输入、输出和设计原因。 |
| DOC-04 | TDD 测试 | 通过 | 已覆盖核心讨论状态和 Prompt 约束。 |
| DOC-05 | README | 通过 | 已补充环境变量、API、数据库和验证命令。 |
| DATA-01 | SQLite 数据库 | 通过 | 已提供 `db/schema.sql`。 |
| DATA-02 | 数据库初始化脚本 | 通过 | 已提供 `scripts/init-db.js` 和 `npm run db:init`。 |
| DATA-03 | 至少 5 条样例数据 | 通过 | `db/seed.sql` 包含 5 条 discussion 和 25 位 participant。 |
| ENG-01 | 多场讨论数据隔离 | 部分通过 | 类型和数据库支持多 session；当前 UI 仍以单场本地 session 为主。 |
| ENG-02 | 实时更新 SSE/WebSocket | 通过 | 已提供 SSE route 并在前端连接。 |

## 6. 剩余风险

- 真实 DeepSeek 输出质量需要配置 `DEEPSEEK_KEY` 后人工验收，重点观察是否严格 JSON、是否每次 1-2 句、是否避免内部流程。
- 当前 SQLite 已满足交付和初始化要求，但页面运行态还未完全以 SQLite 作为持久化来源。
- 当前讨论推进通过按钮触发，不是全自动连续播放；MVP 可接受，但若追求演播厅沉浸感，可继续改为自动轮次推进。
