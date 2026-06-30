import type { Message, TranscriptMessage } from "@/lib/types";

type MessageBubbleProps = {
  message: Message | TranscriptMessage;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isHost = message.speakerTitle.includes("主持");

  return (
    <article
      className={
        isHost
          ? "rounded-lg border border-sky-100 bg-sky-50 p-4"
          : "rounded-lg border border-slate-200 bg-white p-4"
      }
    >
      <header className="flex flex-wrap items-baseline gap-2">
        <strong className="text-sm font-bold text-slate-950">{message.speakerName}</strong>
        <span className="text-xs font-medium text-slate-500">{message.speakerTitle}</span>
      </header>
      <p className="mt-2 text-sm leading-7 text-slate-800">{message.content}</p>
    </article>
  );
}
