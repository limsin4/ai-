import Link from "next/link";
import TopicInput from "@/components/TopicInput";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl content-center gap-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-sky-700">AI Panel Studio</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-5xl">
            创建一场 AI 圆桌讨论
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            输入中文议题和专家人数，生成主持人与专家阵容，进入演播厅查看 transcript、观众追问和 JSON 总结。
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <TopicInput />
          </section>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">MVP 范围</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>1 位主持人和默认 4 位专家</li>
              <li>中文 transcript 展示</li>
              <li>观众追问输入</li>
              <li>结束讨论并生成 JSON 总结</li>
            </ul>
            <Link
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              href="/discussion"
            >
              直接进入演播厅
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
