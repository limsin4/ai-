import type { Participant } from "@/lib/types";

type ParticipantCardProps = {
  participant: Participant;
};

const statusLabel = {
  waiting: "等待",
  preparing: "准备发言",
  speaking: "发言中"
};

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  const isHost = participant.role === "host";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: participant.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-950">{participant.name}</h3>
            <span
              className={
                isHost
                  ? "rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700"
                  : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
              }
            >
              {isHost ? "主持人" : "专家"}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">{participant.title}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-700">{participant.stance}</p>

      <div className="mt-3 grid gap-2 text-xs text-slate-500">
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <span className="font-semibold text-slate-700">关注：</span>
          {participant.focus}
        </div>
        <div className="flex items-center justify-between">
          <span>{participant.profession}</span>
          <span className="font-semibold text-slate-700">{statusLabel[participant.status]}</span>
        </div>
      </div>
    </article>
  );
}
