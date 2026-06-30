# DDD 领域设计文档：AI 圆桌讨论 Web App MVP

## 1. 设计目标

本阶段基于 `docs/sdd.md` 将需求转化为 MVP 可实现的领域模型、模块职责和 API 契约。DDD 在这里不追求复杂的企业级领域分层，而是用清晰的对象边界约束后续实现，避免页面、Prompt、模型调用和讨论状态互相混杂。

核心设计原则：

- 类型简单，字段直观，适合 MVP 快速落地。
- Transcript 只保存用户可见发言，不保存内部调度事件。
- 讨论会话是核心聚合，参与者、消息、共识、分歧和总结都归属于某一场讨论。
- API 输入输出与领域类型保持一致，减少转换成本。
- 大模型相关逻辑由后端模块封装，浏览器端不接触 API Key。

## 2. 领域对象

### 2.1 Participant

`Participant` 表示一位圆桌参与者，可以是主持人，也可以是专家。

职责：

- 保存角色身份信息。
- 保存专家立场、关注点和颜色标识。
- 保存当前运行状态，便于演播厅展示。

关键字段：

- `id`: 参与者唯一标识。
- `role`: `host` 或 `expert`。
- `name`: 中文姓名。
- `title`: 展示用头衔。
- `profession`: 职业背景。
- `stance`: 对议题的基本立场。
- `focus`: 当前关注点。
- `color`: UI 颜色标识。
- `status`: `waiting`、`preparing` 或 `speaking`。

### 2.2 Message

`Message` 表示 transcript 中的一条用户可见发言。

职责：

- 保存主持人或专家的公开发言。
- 支持按时间顺序还原讨论过程。
- 为总结、共识和分歧提取提供上下文。

关键约束：

- 不记录“举手”“抢答”“内部思考”等调度事件。
- 每条专家发言应控制在 1-2 句。
- 主持人消息可用于开场、追问、串场和总结。

### 2.3 Insight

`Insight` 表示讨论过程中形成的一条共识或分歧。

职责：

- 把长 transcript 中的重要结论结构化。
- 支持演播厅实时展示共识和分歧。
- 支持最终总结引用。

MVP 中 `Insight` 保持轻量，只保存类型、内容和来源消息 ID。

### 2.4 UserQuestion

`UserQuestion` 表示用户在讨论过程中追加的追问。

职责：

- 将用户追问纳入后续讨论上下文。
- 标记追问是否已经被回应。

### 2.5 DiscussionSummary

`DiscussionSummary` 表示一场讨论结束后的自然语言总结。

职责：

- 保存面向用户展示的总结文本。
- 保存结构化的共识、分歧和后续问题。
- 避免直接展示模型原始 JSON。

### 2.6 DiscussionSession

`DiscussionSession` 是核心聚合根，表示一场完整的圆桌讨论。

职责：

- 保存讨论主题、状态和创建时间。
- 聚合参与者、消息、共识、分歧、追问和总结。
- 作为讨论推进、总结生成和数据导出的核心输入。

状态流：

```text
draft -> ready -> running -> finished
```

- `draft`: 用户刚输入主题，还未确认阵容。
- `ready`: 已生成并确认嘉宾阵容。
- `running`: 正在进行讨论。
- `finished`: 已结束并生成总结。

## 3. 模块职责

### 3.1 `lib/types.ts`

职责：

- 定义核心领域类型。
- 定义 API 输入输出类型。
- 定义 Zod 请求校验 Schema。
- 为页面、API 路由、讨论引擎和测试提供统一契约。

不负责：

- 不调用大模型。
- 不读写数据库。
- 不包含 UI 逻辑。

### 3.2 `lib/prompts.ts`

职责：

- 生成角色生成 Prompt。
- 生成下一轮发言 Prompt。
- 生成自然语言总结 Prompt。
- 明确约束模型不要输出内部调度事件。

不负责：

- 不直接发起网络请求。
- 不保存讨论状态。

### 3.3 `lib/deepseek.ts`

职责：

- 封装 DeepSeek API 调用。
- 从后端环境变量读取 API Key。
- 提供文本返回和 JSON 返回两类基础方法。

不负责：

- 不拼接业务 Prompt。
- 不决定谁发言。
- 不暴露 API Key 到浏览器端。

### 3.4 `lib/discussionEngine.ts`

职责：

- 基于 `DiscussionSession` 推进下一轮讨论。
- 将当前 session、transcript、用户追问传给 Prompt 层。
- 合并下一轮消息、共识和分歧。
- 维护 MVP 所需的讨论状态变化。

不负责：

- 不渲染页面。
- 不直接管理数据库连接。

### 3.5 `app/api/*`

职责：

- 接收前端请求。
- 使用 Zod Schema 校验输入。
- 调用领域服务或大模型封装。
- 返回稳定的 JSON 结构。

不负责：

- 不包含页面展示逻辑。
- 不在响应中返回 API Key 或内部推理链路。

### 3.6 `components/*`

职责：

- 展示输入、嘉宾、transcript、追问、总结和导出数据。
- 根据领域类型渲染 UI。

不负责：

- 不直接调用 DeepSeek。
- 不持有后端密钥。
- 不实现复杂讨论调度。

## 4. API 输入输出结构

### 4.1 生成嘉宾阵容

Endpoint:

```text
POST /api/generate-roles
```

输入：

```ts
type GenerateRolesInput = {
  topic: string;
  expertCount: number;
};
```

输出：

```ts
type GenerateRolesOutput = {
  participants: Participant[];
};
```

约束：

- `topic` 最少 4 个字符。
- `expertCount` MVP 范围为 2-6。
- 返回结果必须包含 1 位主持人和指定数量专家。

### 4.2 生成下一轮讨论

Endpoint:

```text
POST /api/generate-discussion
```

输入：

```ts
type GenerateDiscussionInput = {
  session: DiscussionSession;
  userQuestion?: string;
};
```

输出：

```ts
type GenerateDiscussionOutput = {
  message: Message;
  participantUpdates: ParticipantStatusUpdate[];
  consensusDelta: Insight[];
  disagreementDelta: Insight[];
  shouldFinish: boolean;
};
```

约束：

- 下一轮发言者必须存在于 `session.participants`。
- 专家发言应控制在 1-2 句。
- 输出的 `message` 必须是用户可见内容。
- 内部调度事件只允许作为状态更新，不进入 transcript。

### 4.3 提交用户追问

Endpoint:

```text
POST /api/ask-question
```

输入：

```ts
type AskQuestionInput = {
  sessionId: string;
  question: string;
};
```

输出：

```ts
type AskQuestionOutput = {
  accepted: boolean;
  question: UserQuestion;
};
```

约束：

- `question` 不能为空。
- 追问应进入后续讨论上下文。

### 4.4 生成讨论总结

Endpoint:

```text
POST /api/generate-summary
```

输入：

```ts
type GenerateSummaryInput = {
  session: DiscussionSession;
};
```

输出：

```ts
type GenerateSummaryOutput = {
  summary: DiscussionSummary;
};
```

约束：

- 总结必须是自然语言文本。
- 不允许向用户展示模型原始 JSON。
- 总结应覆盖主要观点、共识、分歧和后续可探索问题。

### 4.5 讨论事件流

Endpoint:

```text
GET /api/discussions/:id/events
```

输出事件：

```ts
type DiscussionEvent = {
  id: string;
  sessionId: string;
  type: DiscussionEventType;
  payload: Record<string, unknown>;
  createdAt: string;
};
```

MVP 可以先不实现完整 SSE，但事件类型应预留，便于后续扩展实时更新。

## 5. 数据流设计

### 5.1 创建阵容

```text
用户输入 topic/expertCount
  -> /api/generate-roles
  -> lib/prompts.ts 生成角色 Prompt
  -> lib/deepseek.ts 调用模型
  -> 返回 Participant[]
  -> 前端展示并等待用户确认
```

### 5.2 推进讨论

```text
DiscussionSession + 可选用户追问
  -> /api/generate-discussion
  -> discussionEngine 根据 session 构造上下文
  -> prompts 生成下一轮调度 Prompt
  -> deepseek 返回下一轮发言与洞察增量
  -> 追加 Message，更新 Insight 和 Participant 状态
```

### 5.3 生成总结

```text
完整 DiscussionSession
  -> /api/generate-summary
  -> prompts 生成总结 Prompt
  -> deepseek 返回自然语言总结
  -> 保存 DiscussionSummary
  -> 页面展示总结文本
```

## 6. MVP 类型边界

MVP 阶段保持类型简单：

- 使用字符串 ID，不引入复杂实体类。
- 时间统一使用 ISO string。
- `Insight` 统一表达共识和分歧，通过 `type` 区分。
- `Message` 只表达公开发言，不表达内部事件。
- `DiscussionSession` 直接聚合数组，后续接 SQLite 时再映射为多张表。

后续可以扩展但 MVP 暂不实现：

- 多用户权限。
- 长期专家模板库。
- 复杂调度事件回放。
- 模型调用成本统计。
- 多模型评审与自动评分。
