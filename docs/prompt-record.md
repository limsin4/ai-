# Prompt Record

本文档记录 AI Panel Studio MVP 中使用的核心 Prompt。所有 Prompt 均面向 DeepSeek V4 Pro 设计，默认支持中文话题，并尽量要求模型返回合法 JSON，便于后端解析和测试。

## 通用设计约束

所有业务 Prompt 共享以下约束：

- 输出必须是合法 JSON。
- 不输出 Markdown、代码块、额外解释或寒暄。
- 支持中文和中英混合话题。
- 不输出内部系统流程。
- 不输出模型思考过程、推理链路、调度原因或隐藏计划。
- 不在用户可见内容中出现“举手”“抢答”“系统决定”“调度器选择”“内部分析”等内部机制描述。

设计原因：

- 作业要求尽量使用 JSON 结构，便于 API 与测试稳定对接。
- 圆桌 transcript 应像真实节目发言，而不是暴露模型调度过程。
- DeepSeek V4 Pro 在明确 Schema 和硬性规则后，更容易稳定返回可解析内容。

## 1. `generateRolesPrompt`

用途：

根据用户输入的讨论议题和专家人数，生成 1 位主持人和多位专家嘉宾。

输入：

```ts
type GenerateRolesPromptInput = {
  topic: string;
  expertCount: number;
};
```

输出：

```json
{
  "participants": [
    {
      "id": "host-1",
      "role": "host",
      "name": "中文姓名",
      "title": "展示用头衔",
      "profession": "职业背景",
      "stance": "围绕议题的角色立场",
      "focus": "本角色最关注的问题",
      "color": "#1769aa",
      "status": "waiting",
      "publicThoughtSummary": "可展示给用户的当前关注摘要"
    }
  ]
}
```

关键约束：

- 必须生成且只生成 1 位主持人。
- 必须生成指定数量的专家。
- 专家之间需要有不同职业背景、立场和关注点。
- 主持人保持中立，负责开场、追问、串场和总结。
- `id` 使用稳定英文短横线格式。
- `color` 使用十六进制颜色。

设计原因：

嘉宾阵容是后续讨论质量的基础。如果专家背景和立场过于相似，讨论会变成单一观点复述。因此 Prompt 明确要求差异化职业、立场和关注点，并让主持人与专家角色分工清楚。

## 2. `generateTurnPrompt`

用途：

根据当前讨论状态生成下一条用户可见发言，同时返回本轮新增共识、分歧和参与者状态。

输入：

```ts
type GenerateTurnPromptInput = {
  discussion: DiscussionState;
  userQuestion?: string;
};
```

其中 `discussion` 包含：

- `id`
- `topic`
- `participants`
- `messages`
- `consensus`
- `disagreements`

输出：

```json
{
  "speakerId": "participant-id",
  "content": "1-2 句用户可见发言",
  "consensusDelta": ["本轮新增共识"],
  "disagreementDelta": ["本轮新增分歧"],
  "participantStatus": {
    "waiting": ["participant-id"],
    "preparing": ["participant-id"],
    "speaking": "participant-id"
  },
  "shouldFinish": false
}
```

关键约束：

- 不要机械轮流发言。
- `speakerId` 必须来自已有参与者。
- 每次发言控制在 1-2 句。
- `content` 必须能直接展示在 transcript 中。
- 不输出私下思考、内部调度或系统流程。
- `consensusDelta` 和 `disagreementDelta` 只返回新增内容，避免重复。
- 当讨论足够收束时，允许 `shouldFinish` 为 `true`。

设计原因：

作业要求圆桌讨论具有现场感，而不是固定顺序的机器人问答。因此该 Prompt 把 transcript、角色立场、已有共识分歧和用户追问一起放入上下文，让模型根据语义选择下一位发言者。同时通过 JSON 增量字段让前端可以实时更新共识与分歧区域。

## 3. `generateSummaryPrompt`

用途：

在讨论结束时，生成主持人口吻的自然语言总结，并结构化返回主要观点、共识、分歧和开放问题。

输入：

```ts
type GenerateSummaryPromptInput = {
  discussion: DiscussionState;
};
```

其中 `discussion` 包含：

- `id`
- `topic`
- `participants`
- `messages`
- `consensus`
- `disagreements`

输出：

```json
{
  "summary": {
    "content": "主持人口吻的自然语言总结",
    "keyPoints": ["主要观点 1", "主要观点 2"],
    "consensus": ["共识 1"],
    "disagreements": ["分歧 1"],
    "openQuestions": ["后续可探索问题 1"]
  }
}
```

关键约束：

- `summary.content` 必须是可直接展示给用户的自然语言总结。
- 禁止把 JSON 原文当成页面文案展示。
- 不编造 transcript 中没有依据的结论。
- 不输出模型内部判断、隐藏标准或系统流程。

设计原因：

总结阶段需要兼顾用户体验和工程可解析性。外层使用 JSON 方便系统保存和导出，`summary.content` 则保持主持人自然语言口吻，满足作业中“禁止 JSON 原文显示到页面上”的要求。

## 4. 阶段化开发 Prompt 记录

### SDD 阶段

Prompt：

请根据 AI 圆桌讨论 MVP 的业务需求，拆分核心实体、API 契约、数据结构和约束。

用途：

明确系统边界，避免一开始直接生成页面。

### DDD 阶段

Prompt：

请基于 SDD 文档进行领域设计，定义 Participant、Message、DiscussionSession、DiscussionSummary 等核心类型，并说明模块职责。

用途：

将业务需求转为可实现的领域模型和模块边界。

### TDD 阶段

Prompt：

请为讨论引擎、Prompt 生成函数和 API 请求参数校验编写最小测试。

用途：

先锁定关键业务规则，包括 JSON 输出约束、隐藏内部流程、发言长度和参数校验。

### E2E 阶段

Prompt：

请验证从生成角色、进入讨论、追问、生成总结到导出数据的完整用户路径。

用途：

检查 MVP 是否具备可演示闭环，并验证模型输出可以被产品流程消费。
