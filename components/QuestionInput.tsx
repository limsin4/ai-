"use client";

import { useState } from "react";

type QuestionInputProps = {
  onAsk?: (question: string) => void | Promise<void>;
};

export default function QuestionInput({ onAsk }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = question.trim();

    if (!value) {
      return;
    }

    await onAsk?.(value);
    setQuestion("");
  }

  return (
    <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
      <input
        aria-label="观众提问"
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
        placeholder="输入观众追问，例如：这个结论对新人培养有什么影响？"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
      />
      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!question.trim()}
        type="submit"
      >
        提问
      </button>
    </form>
  );
}
