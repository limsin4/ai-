import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export class ApiRouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRouteError";
    this.status = status;
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiRouteError(400, "Request body must be valid JSON");
  }
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: "Invalid request parameters",
      details: error.flatten()
    },
    { status: 400 }
  );
}

function safeErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  if (error.message.includes("DEEPSEEK_KEY") || error.message.includes("DEEPSEEK_API_KEY")) {
    return "DeepSeek service is not configured";
  }

  return error.message || fallbackMessage;
}

export function apiErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiRouteError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    {
      error: safeErrorMessage(error, fallbackMessage)
    },
    { status: 500 }
  );
}
