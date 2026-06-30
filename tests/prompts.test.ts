import { describe, expect, it } from "vitest";
import { createDiscussionSession } from "@/lib/discussionEngine";
import { generateRolesPrompt, generateSummaryPrompt, generateTurnPrompt } from "@/lib/prompts";

describe("prompts", () => {
  it("asks DeepSeek V4 Pro to generate one host and four experts by default", () => {
    const prompt = generateRolesPrompt("AI 如何影响教育评价？", 4);

    expect(prompt).toContain("DeepSeek V4 Pro");
    expect(prompt).toContain("议题：AI 如何影响教育评价？");
    expect(prompt).toContain("专家人数：4");
    expect(prompt).toContain("只生成 1 位 role 为 host");
    expect(prompt).toContain("expertCount 位 role 为 expert");
    expect(prompt).toContain("合法 JSON");
  });

  it("keeps discussion turns visible, Chinese, and free of internal process output", () => {
    const session = createDiscussionSession({
      topic: "生成式 AI 是否会改变知识工作者的核心竞争力？"
    });
    const prompt = generateTurnPrompt(session);

    expect(prompt).toContain("DeepSeek V4 Pro");
    expect(prompt).toContain("不要机械轮流");
    expect(prompt).toContain("不要暴露举手");
    expect(prompt).toContain("不要输出内部系统流程");
    expect(prompt).toContain("content 必须是自然、可直接显示在 transcript 中的中文发言");
    expect(prompt).toContain("consensusDelta");
    expect(prompt).toContain("disagreementDelta");
  });

  it("includes user questions in the turn prompt context", () => {
    const session = createDiscussionSession({
      topic: "AI 产品是否应该默认解释推荐理由？"
    });
    const prompt = generateTurnPrompt(session, "这会不会增加用户的认知负担？");

    expect(prompt).toContain("这会不会增加用户的认知负担？");
    expect(prompt).toContain('"userQuestion": "这会不会增加用户的认知负担？"');
  });

  it("requires a final summary JSON structure with natural language content", () => {
    const session = createDiscussionSession({
      topic: "AI 是否会改变团队协作方式？"
    });
    const prompt = generateSummaryPrompt(session);

    expect(prompt).toContain("DeepSeek V4 Pro");
    expect(prompt).toContain("自然语言总结");
    expect(prompt).toContain("禁止把 JSON 原文显示给用户");
    expect(prompt).toContain("keyPoints");
    expect(prompt).toContain("consensus");
    expect(prompt).toContain("disagreements");
    expect(prompt).toContain("openQuestions");
  });
});
