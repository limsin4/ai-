# SDD 需求规格文档：AI 圆桌讨论 Web App MVP

## 1. 项目目标

AI Panel Studio 是一款面向议题研讨、方案推演和内容创作的 AI 圆桌讨论 Web App MVP。用户输入任意讨论话题，并指定专家嘉宾人数后，系统调用大模型生成一组主持人与专家嘉宾，随后以“演播厅”的形式模拟一场 AI 驱动的圆桌讨论。

本项目的核心目标不是生成一段静态问答，而是呈现一场具备讨论节奏、角色立场、观点交锋、实时沉淀和最终总结的圆桌过程。系统应让用户感受到每位嘉宾拥有不同背景、关注点和表达风格，主持人负责开场、追问、串场、控制节奏和总结，专家则根据当前 transcript 自主判断是否发言。

MVP 需要重点验证以下能力：

- 用户能够快速创建一个有明确主题的 AI 圆桌讨论。
- 系统能够生成有差异化身份、立场和关注点的主持人与专家阵容。
- 讨论过程不是机械轮流发言，而是根据上下文推进。
- 讨论中可以实时展示 transcript、专家状态、共识和分歧。
- 讨论结束后，系统能够生成自然语言总结，而不是直接输出 JSON 原文。
- 项目结构、API、数据结构和 Prompt 设计具备继续扩展为生产系统的基础。

## 2. 用户画像

### 2.1 知识工作者与研究人员

这类用户需要快速从多个角度审视一个研究问题、行业现象或复杂议题。他们关注分析深度、观点多样性和可复用的讨论摘要。

核心需求：

- 在几分钟内获得来自不同视角的深度分析。
- 快速识别议题中的共识、争议点和待验证假设。
- 将讨论 transcript 和总结作为后续写作、研究或汇报素材。

### 2.2 产品经理与决策人员

这类用户常在方案评审、战略讨论或产品决策前，希望模拟不同角色的观点碰撞，提前发现盲点和潜在争议。

核心需求：

- 用 AI 圆桌发现方案风险、用户痛点和组织约束。
- 通过不同专家立场检验假设。
- 在讨论结束后获得可行动的总结和分歧清单。

### 2.3 教育与内容创作者

这类用户希望把复杂议题结构化呈现给观众、学生或读者，追求内容的沉浸感、条理性和可回放性。

核心需求：

- 获得一场可记录、可复盘的虚拟专家访谈。
- 将 transcript、共识、分歧和总结作为课程、文章或视频脚本素材。
- 通过角色化讨论提升内容表现力。

## 3. 核心用户流程

### 3.1 创建讨论

1. 用户进入首页。
2. 用户输入讨论主题。
3. 用户设置专家嘉宾人数，默认 4 人。
4. 用户点击生成嘉宾阵容。
5. 系统调用后端 API，由大模型生成主持人与专家列表。
6. 页面展示嘉宾姓名、职业、Title、立场、颜色标识和关注点。

### 3.2 确认阵容并进入演播厅

1. 用户查看系统生成的主持人与专家阵容。
2. 用户确认阵容。
3. 系统创建一场新的讨论会话。
4. 用户进入演播厅页面。

### 3.3 进行圆桌讨论

1. 主持人进行自然语言开场。
2. 系统根据当前 transcript、专家立场和讨论进度决定下一位发言者。
3. 专家每次发言控制在 1-2 句。
4. 发言顺序由上下文驱动，不允许机械轮流。
5. 页面实时追加 transcript。
6. 页面实时更新专家状态，包括等待、准备发言、发言中。
7. 页面实时更新共识与分歧区域。
8. 用户可以在讨论中追加追问或临时问题。

### 3.4 结束与总结

1. 用户或系统触发讨论结束。
2. 主持人基于 transcript、共识和分歧进行自然语言总结。
3. 页面展示总结内容。
4. 用户可以查看或导出结构化讨论数据。

## 4. MVP 功能范围

### 4.1 首页与讨论创建

- 提供讨论主题输入框。
- 提供专家人数设置，默认 4 人，建议范围 2-6 人。
- 支持调用角色生成 API。
- 展示生成后的主持人与专家阵容。
- 支持用户确认后进入演播厅。

### 4.2 嘉宾生成

- 根据主题生成 1 位主持人。
- 根据用户指定人数生成多位专家。
- 每位参与者包含以下信息：
  - 姓名
  - 角色类型：主持人或专家
  - 职业
  - Title
  - 立场
  - 关注点
  - 颜色标识
- 专家之间应具备明显差异化，不应全部持相同观点。

### 4.3 演播厅讨论

- 展示当前讨论主题。
- 展示嘉宾席与每位嘉宾状态。
- 展示用户可见 transcript。
- 支持主持人开场、追问、串场和总结。
- 支持专家根据上下文自主发言。
- 每次发言控制在 1-2 句。
- 讨论过程中持续更新共识与分歧。
- 不在 transcript 中显示内部调度事件，例如“举手”“抢答”“内部思考链路”。

### 4.4 用户追问

- 用户可以在演播厅中输入追问。
- 追问进入讨论上下文。
- 系统根据追问调整后续发言重点。

### 4.5 讨论总结

- 支持生成主持人风格的自然语言总结。
- 总结应包含主要观点、共识、分歧和后续可探索问题。
- 禁止将模型原始 JSON 直接显示给最终用户。

### 4.6 数据与状态隔离

- 支持多场讨论独立存在。
- 每场讨论拥有独立的状态、参与者、消息、事件流、共识和分歧。
- 大模型 API Key 只能由后端环境变量读取，不能暴露到浏览器端。

## 5. 不做的功能范围

MVP 阶段暂不实现以下功能：

- 用户注册、登录、权限系统。
- 多用户协同编辑或多人同时观看同一讨论。
- 复杂计费、会员、额度管理。
- 真实音频、视频、头像动画或语音合成。
- 可视化时间轴剪辑器。
- 专家角色长期记忆库。
- 用户自定义专家画像模板库。
- 完整后台管理系统。
- 复杂模型路由、多模型投票或自动评测系统。
- 生产级内容审核系统。
- 移动端原生 App。

以上功能可作为后续版本规划，但不进入本次 MVP 验收范围。

## 6. 页面列表

### 6.1 首页 `/`

用途：创建新的圆桌讨论。

主要内容：

- 产品名称与简短说明。
- 讨论主题输入区。
- 专家人数选择。
- 生成嘉宾阵容按钮。
- 嘉宾阵容预览区域。
- 进入演播厅按钮。

### 6.2 演播厅页 `/discussion`

用途：展示和推进一场圆桌讨论。

主要内容：

- 当前议题标题。
- 嘉宾席。
- 每位嘉宾的姓名、Title、职业、立场、状态、关注点。
- Transcript 发言区。
- 共识区域。
- 分歧区域。
- 用户追问输入区。
- 生成总结按钮。
- 数据导出入口。

### 6.3 可选调试页或导出区域

MVP 可以不单独创建调试页面，但需要提供结构化数据查看或导出能力，便于作业验收和后续调试。

## 7. API 列表

### 7.1 `POST /api/generate-roles`

用途：根据用户输入的主题和专家人数生成主持人与专家阵容。

请求参数草案：

```json
{
  "topic": "生成式 AI 是否会改变知识工作者的核心竞争力？",
  "expertCount": 4
}
```

响应参数草案：

```json
{
  "participants": [
    {
      "id": "host-1",
      "role": "host",
      "name": "林知远",
      "title": "圆桌主持人",
      "profession": "科技评论人",
      "stance": "保持中立并推动讨论深入",
      "focus": "议题边界、追问、总结",
      "color": "#1769aa"
    }
  ]
}
```

### 7.2 `POST /api/generate-discussion`

用途：根据当前讨论状态生成下一轮发言，并返回共识与分歧增量。

请求参数草案：

```json
{
  "discussion": {},
  "userQuestion": "是否会让初级岗位更难获得成长机会？"
}
```

响应参数草案：

```json
{
  "speakerId": "expert-1",
  "content": "AI 会降低部分执行性工作的门槛，但也会让新人更早接触复杂问题。",
  "consensusDelta": ["AI 会改变知识工作的训练路径。"],
  "disagreementDelta": ["初级岗位是被压缩还是被重新设计，仍存在分歧。"]
}
```

### 7.3 `POST /api/ask-question`

用途：接收用户在讨论过程中的追问。

请求参数草案：

```json
{
  "discussionId": "discussion-001",
  "question": "这个结论对教育行业有什么影响？"
}
```

响应参数草案：

```json
{
  "accepted": true,
  "question": "这个结论对教育行业有什么影响？",
  "queuedAt": "2026-06-30T08:00:00.000Z"
}
```

### 7.4 `POST /api/generate-summary`

用途：基于完整 transcript、共识和分歧生成自然语言总结。

请求参数草案：

```json
{
  "discussion": {}
}
```

响应参数草案：

```json
{
  "summary": "本场讨论形成了三个主要共识..."
}
```

### 7.5 `GET /api/discussions/:id/events`

用途：通过 SSE 或类似机制向前端实时推送讨论状态。

MVP 可以先采用轮询或手动触发方式实现，但最终技术目标应支持实时事件流。

事件类型草案：

- `participant_status_changed`
- `message_created`
- `consensus_updated`
- `disagreement_updated`
- `summary_created`
- `discussion_finished`

## 8. 数据结构草案

### 8.1 Discussion

```ts
type Discussion = {
  id: string;
  topic: string;
  status: "draft" | "ready" | "running" | "finished";
  expertCount: number;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: TranscriptMessage[];
  consensus: InsightItem[];
  disagreements: InsightItem[];
  summary?: string;
};
```

### 8.2 Participant

```ts
type Participant = {
  id: string;
  discussionId: string;
  role: "host" | "expert";
  name: string;
  title: string;
  profession: string;
  stance: string;
  focus: string;
  color: string;
  status: "waiting" | "preparing" | "speaking";
  publicThoughtSummary?: string;
  privateThoughtSummary?: string;
};
```

说明：

- `publicThoughtSummary` 可用于展示专家当前关注点。
- `privateThoughtSummary` 只能作为内部状态摘要，不应暴露完整推理过程。

### 8.3 TranscriptMessage

```ts
type TranscriptMessage = {
  id: string;
  discussionId: string;
  speakerId: string;
  speakerName: string;
  speakerTitle: string;
  content: string;
  messageType: "opening" | "speech" | "follow_up" | "summary";
  createdAt: string;
};
```

说明：

- Transcript 只保存用户可见内容。
- 不保存或展示“举手”“抢答”“内部调度”等事件为 transcript 消息。

### 8.4 InsightItem

```ts
type InsightItem = {
  id: string;
  discussionId: string;
  type: "consensus" | "disagreement";
  content: string;
  sourceMessageIds: string[];
  createdAt: string;
};
```

### 8.5 UserQuestion

```ts
type UserQuestion = {
  id: string;
  discussionId: string;
  content: string;
  status: "queued" | "addressed";
  createdAt: string;
};
```

### 8.6 DiscussionEvent

```ts
type DiscussionEvent = {
  id: string;
  discussionId: string;
  type:
    | "participant_status_changed"
    | "message_created"
    | "consensus_updated"
    | "disagreement_updated"
    | "summary_created"
    | "discussion_finished";
  payload: Record<string, unknown>;
  createdAt: string;
};
```

## 9. 验收标准

### 9.1 功能验收

- 用户可以输入主题并设置专家人数。
- 系统可以生成 1 位主持人与指定数量专家。
- 每位参与者具备姓名、职业、Title、立场、关注点和颜色标识。
- 用户可以确认阵容并进入演播厅。
- 演播厅可以展示嘉宾席、transcript、共识、分歧和追问入口。
- 主持人可以进行开场、串场、追问和总结。
- 专家发言基于上下文推进，不是固定机械轮流。
- 每次专家发言长度控制在 1-2 句。
- 用户追问可以进入后续讨论上下文。
- 讨论结束后展示自然语言总结。

### 9.2 数据与安全验收

- 大模型 API Key 只从后端环境变量读取。
- 浏览器端代码和网络响应中不得暴露 API Key。
- 多场讨论的数据相互隔离。
- Transcript 中不出现内部调度事件。
- 总结结果不直接展示模型原始 JSON。

### 9.3 UI 验收

- 页面为中文 UI。
- 首页和演播厅页面具备清晰的信息结构。
- 演播厅各区域支持独立滚动，避免整个页面无控制滚动。
- 普通桌面和移动端宽度下内容不应严重重叠或溢出。
- 嘉宾状态、当前发言、共识和分歧能够被用户快速识别。

### 9.4 工程验收

- 项目可以本地安装依赖并启动。
- README 中包含运行方式、环境变量说明和测试方式。
- 至少包含 SDD、DDD、Prompt 记录、开发日志和报告文档。
- 至少包含针对讨论引擎、Prompt 和 API 参数校验的测试。
- 后续接入 SQLite 时，应提供初始化脚本和不少于 5 条样例数据。

### 9.5 作业验收

- 能体现 SDD + DDD + TDD 的工程化拆解过程。
- Prompt 记录文档至少包含 SDD、DDD、TDD、E2E 四个阶段。
- 项目不是单 Prompt 一次性生成，而是有清晰的阶段拆解和迭代记录。
- 最终交付物包含源码、文档、运行说明和必要的测试说明。
