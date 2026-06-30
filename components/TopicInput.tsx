"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GenerateRolesOutput, Participant } from "@/lib/types";

export default function TopicInput() {
  const router = useRouter();
  const [topic, setTopic] = useState("生成式 AI 是否会改变知识工作者的核心竞争力？");
  const [expertCount, setExpertCount] = useState(4);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/generate-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic.trim(),
          expertCount
        })
      });
      const data = (await response.json()) as GenerateRolesOutput & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "生成嘉宾阵容失败");
      }

      setParticipants(data.participants);
      setStatus("ready");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "生成嘉宾阵容失败";
      setStatus("error");
      setError(message);
    }
  }

  function handleEnterStudio() {
    window.localStorage.setItem("ai-panel-topic", topic.trim());
    window.localStorage.setItem("ai-panel-expert-count", String(expertCount));
    window.localStorage.setItem("ai-panel-participants", JSON.stringify(participants));
    router.push("/discussion");
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-800">讨论议题</span>
        <textarea
          className="min-h-32 resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="例如：生成式 AI 是否会改变知识工作者的核心竞争力？"
          required
        />
      </label>

      <label className="grid gap-2 sm:max-w-48">
        <span className="text-sm font-semibold text-slate-800">专家人数</span>
        <input
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
          min={2}
          max={6}
          type="number"
          value={expertCount}
          onChange={(event) => setExpertCount(Number(event.target.value))}
        />
      </label>

      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!topic.trim() || status === "loading"}
        type="submit"
      >
        {status === "loading" ? "正在生成嘉宾阵容..." : "生成嘉宾阵容"}
      </button>

      {status === "error" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}。请确认 `.env.local` 已配置 `DEEPSEEK_API_KEY`。
        </p>
      ) : null}

      {status === "ready" ? (
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">已生成嘉宾阵容</h2>
              <p className="mt-1 text-xs text-slate-500">确认后进入演播厅。</p>
            </div>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={handleEnterStudio}
              type="button"
            >
              确认阵容并进入
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {participants.map((participant) => (
              <article key={participant.id} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <strong className="text-sm text-slate-950">{participant.name}</strong>
                  <span className="text-xs text-slate-500">{participant.role === "host" ? "主持人" : "专家"}</span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">{participant.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-700">{participant.stance}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </form>
  );
}
