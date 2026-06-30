import { describe, expect, it } from "vitest";
import { AskQuestionRequestSchema, GenerateRolesRequestSchema } from "@/lib/types";

describe("api schemas", () => {
  it("accepts valid role generation input", () => {
    const parsed = GenerateRolesRequestSchema.safeParse({
      topic: "AI 如何影响产品决策",
      expertCount: 4
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects empty audience questions", () => {
    const parsed = AskQuestionRequestSchema.safeParse({
      discussionId: "d1",
      question: ""
    });

    expect(parsed.success).toBe(false);
  });
});
