import MessageBubble from "@/components/MessageBubble";
import type { Message, TranscriptMessage } from "@/lib/types";

type TranscriptProps = {
  messages: Array<Message | TranscriptMessage>;
};

export default function Transcript({ messages }: TranscriptProps) {
  return (
    <div className="min-h-0 overflow-y-auto bg-slate-50 p-4">
      {messages.length === 0 ? (
        <div className="grid h-full place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          讨论开始后，主持人和专家发言会显示在这里。
        </div>
      ) : (
        <div className="mx-auto grid max-w-3xl gap-3">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
