import { NextResponse } from "next/server";
import { AskQuestionRequestSchema } from "@/lib/types";
import { apiErrorResponse, readJsonBody, validationErrorResponse } from "@/app/api/_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = AskQuestionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const queuedAt = new Date().toISOString();

    return NextResponse.json({
      accepted: true,
      question: {
        id: `question-${Date.now()}`,
        discussionId: parsed.data.discussionId,
        content: parsed.data.question,
        status: "queued",
        createdAt: queuedAt
      }
    });
  } catch (error) {
    return apiErrorResponse(error, "Failed to queue user question");
  }
}
