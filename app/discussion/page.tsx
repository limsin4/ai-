"use client";

import { useEffect, useMemo, useState } from "react";
import JsonExport from "@/components/JsonExport";
import ParticipantCard from "@/components/ParticipantCard";
import QuestionInput from "@/components/QuestionInput";
import Transcript from "@/components/Transcript";
import {
  addMessageToSession,
  addUserQuestionToSession,
  applyGeneratedDiscussionTurn,
  attachSummaryToSession,
  createDiscussionSession
} from "@/lib/discussionEngine";
import type { DiscussionSession, GenerateDiscussionOutput, GenerateSummaryOutput, Participant } from "@/lib/types";

function readStoredParticipants(): Participant[] | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const saved = window.localStorage.getItem("ai-panel-participants");

  if (!saved) {
    return undefined;
  }

  try {
    return JSON.parse(saved) as Participant[];
  } catch {
    return undefined;
  }
}

function createInitialSession(
  topic = "生成式 AI 是否会改变知识工作者的核心竞争力？",
  expertCount = 4,
  participants?: Participant[]
) {
  const session = createDiscussionSession({ topic, expertCount, participants });
  const host = session.participants.find((participant) => participant.role === "host");

  if (!host) {
    return session;
  }

  return addMessageToSession(session, {
    speakerId: host.id,
    type: "opening",
    content: `欢迎来到今天的 AI 圆桌。我们的议题是“${topic}”，接下来请各位专家从不同角度展开讨论。`
  });
}

export default function DiscussionPage() {
  const [session, setSession] = useState<DiscussionSession>(() => createInitialSession());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [eventStatus, setEventStatus] = useState<"connecting" | "connected" | "closed">("connecting");

  useEffect(() => {
    const savedTopic = window.localStorage.getItem("ai-panel-topic");
    const savedExpertCount = Number(window.localStorage.getItem("ai-panel-expert-count") || 4);
    const savedParticipants = readStoredParticipants();

    if (savedTopic) {
      setSession(createInitialSession(savedTopic, savedExpertCount, savedParticipants));
    }
  }, []);

  useEffect(() => {
    const source = new EventSource(`/api/discussions/${session.id}/events`);

    source.addEventListener("connected", () => setEventStatus("connected"));
    source.onerror = () => setEventStatus("closed");

    return () => {
      source.close();
      setEventStatus("closed");
    };
  }, [session.id]);

  const host = useMemo(() => session.participants.find((participant) => participant.role === "host"), [session]);
  const experts = useMemo(() => session.participants.filter((participant) => participant.role === "expert"), [session]);

  async function generateNextTurn(question?: string, baseSession: DiscussionSession = session) {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-discussion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          discussion: baseSession,
          userQuestion: question
        })
      });
      const data = (await response.json()) as GenerateDiscussionOutput & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "生成下一轮讨论失败");
      }

      setSession((current) => applyGeneratedDiscussionTurn(current, data));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "生成下一轮讨论失败";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleQuestion(question: string) {
    let nextSession = session;

    try {
      await fetch("/api/ask-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          discussionId: session.id,
          question
        })
      });
    } catch {
      // The local session still records the question, so the user can keep discussing.
    }

    setSession((current) => {
      const withQuestion = addUserQuestionToSession(current, question);
      const speaker = host ?? current.participants[0];

      nextSession = addMessageToSession(withQuestion, {
        speakerId: speaker.id,
        type: "follow_up",
        content: `观众提出了一个追问：“${question}”。请专家们结合刚才的观点继续回应。`
      });

      return nextSession;
    });

    await generateNextTurn(question, nextSession);
  }

  function handleSummaryGenerated(output: GenerateSummaryOutput) {
    setSession((current) => attachSummaryToSession(current, output.summary));
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 text-slate-950 sm:p-5">
      <div className="mx-auto grid h-[calc(100vh-1.5rem)] max-w-7xl gap-4 lg:h-[calc(100vh-2.5rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Panel</p>
              <h2 className="text-lg font-bold text-slate-950">主持人与专家</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {session.participants.length} 人
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {host ? <ParticipantCard participant={host} /> : null}
            {experts.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Live Discussion</p>
                <h1 className="mt-1 text-xl font-bold text-slate-950">{session.topic}</h1>
              </div>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  SSE {eventStatus === "connected" ? "已连接" : eventStatus === "connecting" ? "连接中" : "已断开"}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  共识 {session.consensus.length}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                  分歧 {session.disagreements.length}
                </span>
              </div>
            </div>
          </header>

          <Transcript messages={session.messages} />

          <footer className="border-t border-slate-200 p-4">
            <QuestionInput onAsk={handleQuestion} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-300"
                disabled={isGenerating}
                onClick={() => generateNextTurn()}
                type="button"
              >
                {isGenerating ? "AI 正在发言..." : "生成下一轮专家发言"}
              </button>
              {error ? <span className="text-sm text-red-600">{error}</span> : null}
            </div>
            <div className="mt-3">
              <JsonExport discussion={session} onSummaryGenerated={handleSummaryGenerated} />
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
