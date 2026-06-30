"use client";

import { useMemo, useState } from "react";
import type { DiscussionSession, DiscussionState, GenerateSummaryOutput } from "@/lib/types";

type JsonExportProps = {
  discussion: DiscussionSession | DiscussionState;
  onSummaryGenerated?: (output: GenerateSummaryOutput) => void;
};

type SummaryState = {
  status: "idle" | "loading" | "done" | "error";
  data?: unknown;
  error?: string;
};

function createLocalSummary(discussion: DiscussionSession | DiscussionState) {
  return {
    summary: {
      content: `本场讨论围绕“${discussion.topic}”展开，已形成 ${discussion.messages.length} 条公开发言。`,
      keyPoints: discussion.messages.slice(0, 3).map((message) => message.content),
      consensus: discussion.consensus.map((item) => (typeof item === "string" ? item : item.content)),
      disagreements: discussion.disagreements.map((item) => (typeof item === "string" ? item : item.content)),
      openQuestions: ["后续可继续追问不同专家对关键分歧的判断依据。"]
    }
  };
}

export default function JsonExport({ discussion, onSummaryGenerated }: JsonExportProps) {
  const [summary, setSummary] = useState<SummaryState>({ status: "idle" });
  const exportData = useMemo(() => ({ discussion, generatedSummary: summary.data ?? null }), [discussion, summary.data]);

  async function handleGenerateSummary() {
    setSummary({ status: "loading" });

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ discussion })
      });

      const data = (await response.json()) as GenerateSummaryOutput & { error?: string };

      if (!response.ok) {
        throw new Error(data?.error || "生成总结失败");
      }

      setSummary({ status: "done", data });
      onSummaryGenerated?.(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "生成总结失败";
      setSummary({
        status: "error",
        error: message,
        data: createLocalSummary(discussion)
      });
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-950">讨论 JSON</h2>
          <p className="mt-1 text-xs text-slate-500">用于验收、调试和复盘。</p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-wait disabled:bg-slate-300"
          disabled={summary.status === "loading"}
          onClick={handleGenerateSummary}
          type="button"
        >
          {summary.status === "loading" ? "生成中..." : "结束讨论并生成 JSON 总结"}
        </button>
      </div>

      {summary.status === "error" ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          DeepSeek 总结未完成：{summary.error}。下方已生成本地 JSON 摘要。
        </p>
      ) : null}

      {summary.status === "done" && "summary" in (summary.data as GenerateSummaryOutput) ? (
        <div className="mt-3 rounded-md border border-sky-100 bg-white p-3">
          <h3 className="text-sm font-bold text-slate-950">主持人自然语言总结</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {(summary.data as GenerateSummaryOutput).summary.content}
          </p>
        </div>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">查看 JSON</summary>
        <pre className="mt-3 max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">
          {JSON.stringify(exportData, null, 2)}
        </pre>
      </details>
    </section>
  );
}
