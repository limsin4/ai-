import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { generateTurnPrompt } from "@/lib/prompts";
import type {
  AiDiscussionTurn,
  DiscussionSession,
  DiscussionState,
  GenerateDiscussionOutput,
  Insight,
  Message,
  ParticipantStatusUpdate
} from "@/lib/types";
import { GenerateDiscussionRequestSchema } from "@/lib/types";
import { apiErrorResponse, readJsonBody, validationErrorResponse } from "@/app/api/_utils";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTurn(rawTurn: AiDiscussionTurn, discussion: DiscussionState | DiscussionSession): GenerateDiscussionOutput {
  const speaker = discussion.participants.find((participant) => participant.id === rawTurn.speakerId);

  if (!speaker) {
    throw new Error(`DeepSeek returned unknown speakerId: ${rawTurn.speakerId}`);
  }

  const timestamp = new Date().toISOString();
  const message: Message = {
    id: createId("message"),
    sessionId: discussion.id,
    speakerId: speaker.id,
    speakerName: speaker.name,
    speakerTitle: speaker.title,
    content: rawTurn.content,
    type: speaker.role === "host" ? "follow_up" : "speech",
    createdAt: timestamp
  };

  const consensusDelta: Insight[] = (rawTurn.consensusDelta ?? []).map((content) => ({
    id: createId("consensus"),
    sessionId: discussion.id,
    type: "consensus",
    content,
    sourceMessageIds: [message.id],
    createdAt: timestamp
  }));

  const disagreementDelta: Insight[] = (rawTurn.disagreementDelta ?? []).map((content) => ({
    id: createId("disagreement"),
    sessionId: discussion.id,
    type: "disagreement",
    content,
    sourceMessageIds: [message.id],
    createdAt: timestamp
  }));

  const participantUpdates: ParticipantStatusUpdate[] = discussion.participants.map((participant) => {
    if (participant.id === rawTurn.participantStatus?.speaking || participant.id === rawTurn.speakerId) {
      return { participantId: participant.id, status: "speaking" };
    }

    if (rawTurn.participantStatus?.preparing?.includes(participant.id)) {
      return { participantId: participant.id, status: "preparing" };
    }

    return { participantId: participant.id, status: "waiting" };
  });

  return {
    message,
    participantUpdates,
    consensusDelta,
    disagreementDelta,
    shouldFinish: Boolean(rawTurn.shouldFinish)
  };
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = GenerateDiscussionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const prompt = generateTurnPrompt(parsed.data.discussion, parsed.data.userQuestion);
    const rawTurn = await callDeepSeekJson<AiDiscussionTurn>(prompt);
    const nextTurn = normalizeTurn(rawTurn, parsed.data.discussion);

    return NextResponse.json(nextTurn);
  } catch (error) {
    return apiErrorResponse(error, "Failed to generate discussion turn");
  }
}
