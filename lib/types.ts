import { z } from "zod";

export type ParticipantRole = "host" | "expert";
export type ParticipantStatus = "waiting" | "preparing" | "speaking";
export type DiscussionStatus = "draft" | "ready" | "running" | "finished";
export type MessageType = "opening" | "speech" | "follow_up" | "summary";
export type InsightType = "consensus" | "disagreement";
export type UserQuestionStatus = "queued" | "addressed";
export type DiscussionEventType =
  | "participant_status_changed"
  | "message_created"
  | "consensus_updated"
  | "disagreement_updated"
  | "summary_created"
  | "discussion_finished";

export type Participant = {
  id: string;
  role: ParticipantRole;
  name: string;
  title: string;
  profession: string;
  stance: string;
  focus: string;
  color: string;
  status: ParticipantStatus;
  publicThoughtSummary?: string;
  privateThoughtSummary?: string;
};

export type Message = {
  id: string;
  sessionId: string;
  speakerId: string;
  speakerName: string;
  speakerTitle: string;
  content: string;
  type: MessageType;
  createdAt: string;
};

export type Insight = {
  id: string;
  sessionId: string;
  type: InsightType;
  content: string;
  sourceMessageIds: string[];
  createdAt: string;
};

export type UserQuestion = {
  id: string;
  sessionId: string;
  content: string;
  status: UserQuestionStatus;
  createdAt: string;
};

export type DiscussionSummary = {
  id: string;
  sessionId: string;
  content: string;
  keyPoints: string[];
  consensus: string[];
  disagreements: string[];
  openQuestions: string[];
  createdAt: string;
};

export type AiDiscussionTurn = {
  speakerId: string;
  content: string;
  consensusDelta: string[];
  disagreementDelta: string[];
  participantStatus?: {
    waiting?: string[];
    preparing?: string[];
    speaking?: string;
  };
  shouldFinish: boolean;
};

export type AiSummaryResult = {
  summary: {
    content: string;
    keyPoints: string[];
    consensus: string[];
    disagreements: string[];
    openQuestions: string[];
  };
};

export type DiscussionSession = {
  id: string;
  topic: string;
  status: DiscussionStatus;
  expertCount: number;
  participants: Participant[];
  messages: Message[];
  consensus: Insight[];
  disagreements: Insight[];
  questions: UserQuestion[];
  summary?: DiscussionSummary;
  createdAt: string;
  updatedAt: string;
};

export type TranscriptMessage = {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerTitle: string;
  content: string;
  createdAt: string;
};

export type DiscussionState = {
  id: string;
  topic: string;
  participants: Participant[];
  messages: TranscriptMessage[];
  consensus: string[];
  disagreements: string[];
};

export type ParticipantStatusUpdate = {
  participantId: string;
  status: ParticipantStatus;
};

export type DiscussionEvent = {
  id: string;
  sessionId: string;
  type: DiscussionEventType;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type GenerateRolesInput = {
  topic: string;
  expertCount: number;
};

export type GenerateRolesOutput = {
  participants: Participant[];
};

export type GenerateDiscussionInput = {
  session: DiscussionSession;
  userQuestion?: string;
};

export type GenerateDiscussionOutput = {
  message: Message;
  participantUpdates: ParticipantStatusUpdate[];
  consensusDelta: Insight[];
  disagreementDelta: Insight[];
  shouldFinish: boolean;
};

export type AskQuestionInput = {
  sessionId: string;
  question: string;
};

export type AskQuestionOutput = {
  accepted: boolean;
  question: UserQuestion;
};

export type GenerateSummaryInput = {
  session: DiscussionSession;
};

export type GenerateSummaryOutput = {
  summary: DiscussionSummary;
};

export const GenerateRolesRequestSchema = z.object({
  topic: z.string().min(4),
  expertCount: z.number().int().min(2).max(6).default(4)
});

export const GenerateDiscussionRequestSchema = z.object({
  discussion: z.custom<DiscussionState | DiscussionSession>(),
  userQuestion: z.string().min(2).optional()
});

export const AskQuestionRequestSchema = z.object({
  discussionId: z.string().min(1),
  question: z.string().min(2)
});

export const GenerateSummaryRequestSchema = z.object({
  discussion: z.custom<DiscussionState | DiscussionSession>()
});

export type GenerateRolesRequest = z.infer<typeof GenerateRolesRequestSchema>;
export type GenerateDiscussionRequest = z.infer<typeof GenerateDiscussionRequestSchema>;
export type AskQuestionRequest = z.infer<typeof AskQuestionRequestSchema>;
export type GenerateSummaryRequest = z.infer<typeof GenerateSummaryRequestSchema>;

// Backward-compatible aliases for the first project skeleton.
export type AgentStatus = ParticipantStatus;
