import type {
  DiscussionSession,
  DiscussionState,
  DiscussionSummary,
  GenerateDiscussionOutput,
  Insight,
  MessageType,
  Participant,
  ParticipantStatus
} from "@/lib/types";

export type CreateDiscussionSessionInput = {
  topic: string;
  expertCount?: number;
  participants?: Participant[];
};

export type AddMessageInput = {
  speakerId: string;
  content: string;
  type: MessageType;
};

export type AddInsightInput = {
  type: "consensus" | "disagreement";
  content: string;
  sourceMessageIds?: string[];
};

export type CreateSummaryInput = {
  content: string;
  keyPoints: string[];
  consensus: string[];
  disagreements: string[];
  openQuestions: string[];
};

export type ParticipantStatusInput = {
  participantId: string;
  status: ParticipantStatus;
};

const DEFAULT_EXPERT_COUNT = 4;
const MIN_EXPERT_COUNT = 2;
const MAX_EXPERT_COUNT = 6;

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

function normalizeExpertCount(expertCount: number | undefined): number {
  const count = expertCount ?? DEFAULT_EXPERT_COUNT;

  if (!Number.isInteger(count)) {
    throw new Error("expertCount must be an integer");
  }

  if (count < MIN_EXPERT_COUNT || count > MAX_EXPERT_COUNT) {
    throw new Error(`expertCount must be between ${MIN_EXPERT_COUNT} and ${MAX_EXPERT_COUNT}`);
  }

  return count;
}

function createDefaultParticipants(expertCount: number): Participant[] {
  const host: Participant = {
    id: "host-1",
    role: "host",
    name: "林知远",
    title: "圆桌主持人",
    profession: "科技评论人",
    stance: "保持中立并推动讨论深入。",
    focus: "议题边界、追问、串场、总结",
    color: "#1769aa",
    status: "waiting"
  };

  const expertSeeds = [
    {
      name: "周砚",
      title: "AI 产品负责人",
      profession: "产品管理",
      stance: "关注 AI 如何重塑真实业务流程。",
      focus: "用户痛点、产品落地、组织协作",
      color: "#c77831"
    },
    {
      name: "许棠",
      title: "认知科学研究员",
      profession: "研究",
      stance: "关注人的判断、学习迁移和认知负荷。",
      focus: "学习机制、专家判断、能力迁移",
      color: "#237a57"
    },
    {
      name: "陈澈",
      title: "企业战略顾问",
      profession: "战略咨询",
      stance: "关注组织结构、岗位变化和长期竞争力。",
      focus: "战略取舍、组织能力、风险控制",
      color: "#7a4fb3"
    },
    {
      name: "沈葭",
      title: "数据伦理研究者",
      profession: "数据治理",
      stance: "关注 AI 决策中的透明度、公平性和责任边界。",
      focus: "伦理风险、治理机制、透明度",
      color: "#b54708"
    },
    {
      name: "顾明",
      title: "一线教育实践者",
      profession: "教育",
      stance: "关注技术如何改变学习评价和课堂实践。",
      focus: "教学场景、评价方式、学生体验",
      color: "#0f766e"
    },
    {
      name: "韩越",
      title: "产业投资分析师",
      profession: "投资分析",
      stance: "关注技术扩散速度、商业模式和产业格局。",
      focus: "市场结构、商业模式、投资风险",
      color: "#4f46e5"
    }
  ];

  const experts = expertSeeds.slice(0, expertCount).map<Participant>((seed, index) => ({
    id: `expert-${index + 1}`,
    role: "expert",
    status: "waiting",
    ...seed
  }));

  return [host, ...experts];
}

function normalizeParticipants(participants: Participant[] | undefined, expertCount: number): Participant[] {
  if (!participants || participants.length === 0) {
    return createDefaultParticipants(expertCount);
  }

  const hostCount = participants.filter((participant) => participant.role === "host").length;

  if (hostCount !== 1) {
    throw new Error("discussion must have exactly one host");
  }

  return participants.map((participant) => ({
    ...participant,
    status: participant.status ?? "waiting"
  }));
}

export function createDiscussionSession(input: CreateDiscussionSessionInput): DiscussionSession {
  assertNonEmpty(input.topic, "topic");

  const timestamp = nowIso();
  const expertCount = normalizeExpertCount(input.expertCount);
  const participants = normalizeParticipants(input.participants, expertCount);

  return {
    id: createId("session"),
    topic: input.topic,
    status: "ready",
    expertCount,
    participants,
    messages: [],
    consensus: [],
    disagreements: [],
    questions: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function addMessageToSession(session: DiscussionSession, input: AddMessageInput): DiscussionSession {
  assertNonEmpty(input.content, "message content");

  const speaker = session.participants.find((participant) => participant.id === input.speakerId);

  if (!speaker) {
    throw new Error(`Participant not found: ${input.speakerId}`);
  }

  const timestamp = nowIso();

  return {
    ...session,
    messages: [
      ...session.messages,
      {
        id: createId("message"),
        sessionId: session.id,
        speakerId: speaker.id,
        speakerName: speaker.name,
        speakerTitle: speaker.title,
        content: input.content,
        type: input.type,
        createdAt: timestamp
      }
    ],
    updatedAt: timestamp
  };
}

export function addUserQuestionToSession(session: DiscussionSession, content: string): DiscussionSession {
  assertNonEmpty(content, "question");

  const timestamp = nowIso();

  return {
    ...session,
    questions: [
      ...session.questions,
      {
        id: createId("question"),
        sessionId: session.id,
        content,
        status: "queued",
        createdAt: timestamp
      }
    ],
    updatedAt: timestamp
  };
}

export function createFinalSummary(session: DiscussionSession, input: CreateSummaryInput): DiscussionSummary {
  assertNonEmpty(input.content, "summary content");

  return {
    id: createId("summary"),
    sessionId: session.id,
    content: input.content,
    keyPoints: input.keyPoints,
    consensus: input.consensus,
    disagreements: input.disagreements,
    openQuestions: input.openQuestions,
    createdAt: nowIso()
  };
}

export function updateParticipantStatus(
  session: DiscussionSession,
  updates: ParticipantStatusInput[]
): DiscussionSession {
  const updateMap = new Map(updates.map((update) => [update.participantId, update.status]));
  const unknownIds = updates
    .map((update) => update.participantId)
    .filter((participantId) => !session.participants.some((participant) => participant.id === participantId));

  if (unknownIds.length > 0) {
    throw new Error(`Participant not found: ${unknownIds.join(", ")}`);
  }

  return {
    ...session,
    participants: session.participants.map((participant) => ({
      ...participant,
      status: updateMap.get(participant.id) ?? participant.status
    })),
    updatedAt: nowIso()
  };
}

export function addInsightToSession(session: DiscussionSession, input: AddInsightInput): DiscussionSession {
  assertNonEmpty(input.content, "insight content");

  const timestamp = nowIso();
  const insight: Insight = {
    id: createId(input.type),
    sessionId: session.id,
    type: input.type,
    content: input.content,
    sourceMessageIds: input.sourceMessageIds ?? [],
    createdAt: timestamp
  };

  return {
    ...session,
    consensus: input.type === "consensus" ? [...session.consensus, insight] : session.consensus,
    disagreements: input.type === "disagreement" ? [...session.disagreements, insight] : session.disagreements,
    updatedAt: timestamp
  };
}

export function attachSummaryToSession(session: DiscussionSession, summary: DiscussionSummary): DiscussionSession {
  if (summary.sessionId !== session.id) {
    throw new Error("summary does not belong to this session");
  }

  return {
    ...session,
    status: "finished",
    summary,
    updatedAt: nowIso()
  };
}

export function applyGeneratedDiscussionTurn(
  session: DiscussionSession,
  output: GenerateDiscussionOutput
): DiscussionSession {
  if (!session.participants.some((participant) => participant.id === output.message.speakerId)) {
    throw new Error(`Participant not found: ${output.message.speakerId}`);
  }

  const timestamp = nowIso();

  return {
    ...session,
    status: output.shouldFinish ? "finished" : "running",
    participants: session.participants.map((participant) => {
      const update = output.participantUpdates.find((item) => item.participantId === participant.id);
      return update ? { ...participant, status: update.status } : participant;
    }),
    messages: [...session.messages, output.message],
    consensus: [...session.consensus, ...output.consensusDelta],
    disagreements: [...session.disagreements, ...output.disagreementDelta],
    updatedAt: timestamp
  };
}

export function createDemoDiscussion(): DiscussionState {
  return {
    id: "demo-discussion",
    topic: "生成式 AI 是否会改变知识工作者的核心竞争力？",
    participants: [
      {
        id: "host",
        role: "host",
        name: "林知远",
        title: "圆桌主持人",
        profession: "科技评论人",
        stance: "保持开放追问，推动观点交锋并提炼阶段性结论。",
        color: "#1769aa",
        status: "speaking",
        focus: "议题边界、讨论节奏、共识沉淀"
      },
      {
        id: "expert-product",
        role: "expert",
        name: "周砚",
        title: "AI 产品负责人",
        profession: "产品管理",
        stance: "AI 会重塑工作流，但不会替代问题定义能力。",
        color: "#c77831",
        status: "waiting",
        focus: "产品流程、组织协作、落地风险"
      },
      {
        id: "expert-research",
        role: "expert",
        name: "许棠",
        title: "认知科学研究员",
        profession: "研究",
        stance: "核心竞争力会从记忆和检索转向判断、抽象与验证。",
        color: "#237a57",
        status: "waiting",
        focus: "认知负荷、学习迁移、专家判断"
      }
    ],
    messages: [
      {
        id: "m1",
        speakerId: "host",
        speakerName: "林知远",
        speakerTitle: "圆桌主持人",
        content: "今天我们讨论生成式 AI 对知识工作者核心竞争力的影响。请大家先从工作方式和能力结构两个角度给出判断。",
        createdAt: new Date().toISOString()
      }
    ],
    consensus: ["AI 会显著改变知识工作的流程。"],
    disagreements: ["核心竞争力是被替代，还是被重新定义。"]
  };
}
