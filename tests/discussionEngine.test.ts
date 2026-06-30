import { describe, expect, it } from "vitest";
import {
  addMessageToSession,
  addUserQuestionToSession,
  createDiscussionSession,
  createFinalSummary
} from "@/lib/discussionEngine";

describe("discussionEngine", () => {
  it("creates a discussion session from a Chinese topic", () => {
    const session = createDiscussionSession({
      topic: "生成式 AI 是否会改变知识工作者的核心竞争力？"
    });

    expect(session.id).toBeTruthy();
    expect(session.topic).toBe("生成式 AI 是否会改变知识工作者的核心竞争力？");
    expect(session.status).toBe("ready");
    expect(session.createdAt).toBeTruthy();
    expect(session.updatedAt).toBeTruthy();
  });

  it("creates one host and four experts by default", () => {
    const session = createDiscussionSession({
      topic: "AI 如何影响教育评价？"
    });

    const hosts = session.participants.filter((participant) => participant.role === "host");
    const experts = session.participants.filter((participant) => participant.role === "expert");

    expect(hosts).toHaveLength(1);
    expect(experts).toHaveLength(4);
    expect(session.expertCount).toBe(4);
    expect(session.participants).toHaveLength(5);
  });

  it("adds a visible transcript message to the session", () => {
    const session = createDiscussionSession({
      topic: "AI 产品是否应该默认解释推荐理由？"
    });
    const host = session.participants.find((participant) => participant.role === "host");

    if (!host) {
      throw new Error("Expected a host participant");
    }

    const updated = addMessageToSession(session, {
      speakerId: host.id,
      content: "欢迎来到今天的圆桌，我们先从用户信任这个角度展开。",
      type: "opening"
    });

    expect(updated.messages).toHaveLength(1);
    expect(updated.messages[0]).toMatchObject({
      speakerId: host.id,
      speakerName: host.name,
      speakerTitle: host.title,
      content: "欢迎来到今天的圆桌，我们先从用户信任这个角度展开。",
      type: "opening"
    });
    expect(updated.updatedAt >= session.updatedAt).toBe(true);
  });

  it("adds a queued user question to the session", () => {
    const session = createDiscussionSession({
      topic: "AI 是否会改变团队协作方式？"
    });

    const updated = addUserQuestionToSession(session, "这对初级员工的成长路径有什么影响？");

    expect(updated.questions).toHaveLength(1);
    expect(updated.questions[0]).toMatchObject({
      sessionId: session.id,
      content: "这对初级员工的成长路径有什么影响？",
      status: "queued"
    });
  });

  it("creates the final summary structure", () => {
    const session = createDiscussionSession({
      topic: "AI 是否会改变知识工作者的核心竞争力？"
    });

    const summary = createFinalSummary(session, {
      content: "本场讨论认为，AI 会改变知识工作的流程，但人的判断力仍然关键。",
      keyPoints: ["AI 改变工作流程", "判断力仍然关键"],
      consensus: ["AI 会提高信息处理效率"],
      disagreements: ["AI 是替代人，还是增强人"],
      openQuestions: ["组织应该如何重新设计新人培养机制？"]
    });

    expect(summary).toMatchObject({
      sessionId: session.id,
      content: "本场讨论认为，AI 会改变知识工作的流程，但人的判断力仍然关键。",
      keyPoints: ["AI 改变工作流程", "判断力仍然关键"],
      consensus: ["AI 会提高信息处理效率"],
      disagreements: ["AI 是替代人，还是增强人"],
      openQuestions: ["组织应该如何重新设计新人培养机制？"]
    });
    expect(summary.id).toBeTruthy();
    expect(summary.createdAt).toBeTruthy();
  });
});
