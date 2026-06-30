import { NextResponse } from "next/server";
import { generateSummaryPrompt } from "@/lib/prompts";
import { callDeepSeekJson } from "@/lib/deepseek";
import { createFinalSummary } from "@/lib/discussionEngine";
import { GenerateSummaryRequestSchema, type AiSummaryResult, type GenerateSummaryOutput } from "@/lib/types";
import { apiErrorResponse, readJsonBody, validationErrorResponse } from "@/app/api/_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = GenerateSummaryRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const prompt = generateSummaryPrompt(parsed.data.discussion);
    const result = await callDeepSeekJson<AiSummaryResult>(prompt);
    const summary = createFinalSummary(
      {
        id: parsed.data.discussion.id,
        topic: parsed.data.discussion.topic,
        status: "running",
        expertCount: parsed.data.discussion.participants.filter((participant) => participant.role === "expert").length,
        participants: parsed.data.discussion.participants,
        messages: [],
        consensus: [],
        disagreements: [],
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      result.summary
    );
    const output: GenerateSummaryOutput = { summary };

    return NextResponse.json(output);
  } catch (error) {
    return apiErrorResponse(error, "Failed to generate discussion summary");
  }
}
