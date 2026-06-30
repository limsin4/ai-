import { NextResponse } from "next/server";
import { generateRolesPrompt } from "@/lib/prompts";
import { callDeepSeekJson } from "@/lib/deepseek";
import { GenerateRolesRequestSchema, type GenerateRolesOutput } from "@/lib/types";
import { apiErrorResponse, readJsonBody, validationErrorResponse } from "@/app/api/_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = GenerateRolesRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const prompt = generateRolesPrompt(parsed.data.topic, parsed.data.expertCount);
    const result = await callDeepSeekJson<GenerateRolesOutput>(prompt);

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Failed to generate discussion roles");
  }
}
