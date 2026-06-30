import type { DiscussionSession, DiscussionState } from "@/lib/types";

const MODEL_NAME = "DeepSeek V4 Pro";

const JSON_ONLY_RULES = [
  "输出必须是合法 JSON。",
  "不要输出 Markdown。",
  "不要输出代码块。",
  "不要在 JSON 前后添加解释、寒暄或注释。",
  "所有字符串内容使用中文表达，除非输入中包含必须保留的英文术语。"
].join("\n");

const INTERNAL_PROCESS_RULES = [
  "不要输出内部系统流程。",
  "不要暴露举手、抢答、内部思考或调度过程。",
  "不要输出模型思考过程、推理链路、调度原因或隐藏计划。",
  "不要出现“举手”“抢答”“系统决定”“调度器选择”“内部分析”等内部机制描述。",
  "只输出最终可被产品使用的结构化结果。"
].join("\n");

function toPromptJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function generateRolesPrompt(topic: string, expertCount: number) {
  return [
    `你正在作为 ${MODEL_NAME} 为 AI Panel Studio 生成圆桌讨论嘉宾阵容。`,
    "任务：根据中文或中英混合议题，生成 1 位主持人和指定数量的专家嘉宾。",
    "",
    "硬性规则：",
    JSON_ONLY_RULES,
    INTERNAL_PROCESS_RULES,
    "- 必须生成且只生成 1 位 role 为 host 的主持人。",
    "- 必须生成 expertCount 位 role 为 expert 的专家。",
    "- 专家之间需要有明显不同的职业背景、立场和关注点。",
    "- 主持人应保持中立，负责开场、追问、串场和总结。",
    "- 专家立场可以有分歧，但不能极端化、标签化或空泛化。",
    "- id 使用稳定英文短横线格式，例如 host-1、expert-1。",
    "- color 使用十六进制颜色，例如 #1769aa。",
    "",
    "输入：",
    `议题：${topic}`,
    `专家人数：${expertCount}`,
    "",
    "输出 JSON Schema：",
    toPromptJson({
      participants: [
        {
          id: "host-1",
          role: "host",
          name: "中文姓名",
          title: "展示用头衔",
          profession: "职业背景",
          stance: "围绕议题的角色立场",
          focus: "本角色最关注的问题",
          color: "#1769aa",
          status: "waiting",
          publicThoughtSummary: "可展示给用户的当前关注摘要"
        }
      ]
    })
  ].join("\n");
}

type PromptDiscussion = DiscussionState | DiscussionSession;

function getConsensusText(discussion: PromptDiscussion) {
  return discussion.consensus.map((item) => (typeof item === "string" ? item : item.content));
}

function getDisagreementText(discussion: PromptDiscussion) {
  return discussion.disagreements.map((item) => (typeof item === "string" ? item : item.content));
}

export function generateTurnPrompt(discussion: PromptDiscussion, userQuestion?: string) {
  return [
    `你正在作为 ${MODEL_NAME} 驱动 AI Panel Studio 的下一轮圆桌发言。`,
    "任务：根据当前 transcript、参与者立场、已有共识分歧和可选用户追问，生成下一条用户可见发言。",
    "",
    "硬性规则：",
    JSON_ONLY_RULES,
    INTERNAL_PROCESS_RULES,
    "- 不要机械轮流发言，应根据上下文选择最自然的下一位发言者。",
    "- speakerId 必须来自 participants 中已有的 id。",
    "- 主持人负责开场、追问、串场、压缩争议和总结。",
    "- 专家只输出公开发言，不输出私下思考。",
    "- 每次发言控制在 1-2 句。",
    "- content 必须是自然、可直接显示在 transcript 中的中文发言。",
    "- consensusDelta 只放本轮新增或更清晰的共识，不能重复已有共识。",
    "- disagreementDelta 只放本轮新增或更清晰的分歧，不能重复已有分歧。",
    "- 如果讨论已经足够收束，可以将 shouldFinish 设为 true，否则为 false。",
    "",
    "当前讨论状态：",
    toPromptJson({
      id: discussion.id,
      topic: discussion.topic,
      participants: discussion.participants,
      transcript: discussion.messages,
      consensus: getConsensusText(discussion),
      disagreements: getDisagreementText(discussion),
      userQuestion: userQuestion || null
    }),
    "",
    "输出 JSON Schema：",
    toPromptJson({
      speakerId: "participant-id",
      content: "1-2 句用户可见发言",
      consensusDelta: ["本轮新增共识"],
      disagreementDelta: ["本轮新增分歧"],
      participantStatus: {
        waiting: ["participant-id"],
        preparing: ["participant-id"],
        speaking: "participant-id"
      },
      shouldFinish: false
    })
  ].join("\n");
}

export function generateSummaryPrompt(discussion: PromptDiscussion) {
  return [
    `你正在作为 ${MODEL_NAME} 为 AI Panel Studio 生成圆桌主持人的收束总结。`,
    "任务：基于完整 transcript、共识和分歧，生成可以直接展示给用户的自然语言总结。",
    "",
    "硬性规则：",
    JSON_ONLY_RULES,
    INTERNAL_PROCESS_RULES,
    "- summary 必须是自然语言总结，不能是条目堆砌。",
    "- 禁止把 JSON 原文显示给用户；JSON 只是接口传输格式。",
    "- 总结应覆盖主要观点、已经形成的共识、仍存在的分歧和后续可探索问题。",
    "- 不要编造 transcript 中完全没有出现过的结论。",
    "- 不要输出模型内部判断、隐藏标准或系统流程。",
    "",
    "当前讨论材料：",
    toPromptJson({
      id: discussion.id,
      topic: discussion.topic,
      participants: discussion.participants,
      transcript: discussion.messages,
      consensus: getConsensusText(discussion),
      disagreements: getDisagreementText(discussion)
    }),
    "",
    "输出 JSON Schema：",
    toPromptJson({
      summary: {
        content: "主持人口吻的自然语言总结",
        keyPoints: ["主要观点 1", "主要观点 2"],
        consensus: ["共识 1"],
        disagreements: ["分歧 1"],
        openQuestions: ["后续可探索问题 1"]
      }
    })
  ].join("\n");
}
