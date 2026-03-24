import { GameCard } from '../components/GameCard'
import { useGameFlow } from '../context/GameFlowContext'
import { STORIES } from '../data/stories'

export function Home() {
  const { status, statusLabel } = useGameFlow()
  const totalStories = STORIES.length
  const easyCount = STORIES.filter((story) => story.difficulty === 'easy').length
  const mediumCount = STORIES.filter((story) => story.difficulty === 'medium').length
  const hardCount = STORIES.filter((story) => story.difficulty === 'hard').length

  return (
    <main className="min-h-[100dvh] bg-slate-900 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="motion-safe:animate-message-in rounded-lg border border-slate-700 bg-slate-800/70 p-5 shadow-lg sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-wide text-amber-400 sm:text-4xl">
              AI海龟汤
            </h1>
            {status === 'idle' && (
              <span className="rounded-lg border border-slate-600 bg-slate-900/60 px-2.5 py-0.5 text-xs text-slate-400">
                大厅 · {statusLabel}
              </span>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            欢迎来到深夜推理大厅。阅读汤面、谨慎发问，让 AI 主持人只用
            <span className="px-1 text-amber-300">是</span>、
            <span className="px-1 text-amber-300">否</span>、
            <span className="px-1 text-amber-300">无关</span>
            引导你逼近真相。
          </p>
        </header>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 shadow-lg sm:grid-cols-4">
          <div className="rounded-lg bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">故事数量</p>
            <p className="mt-1 text-xl font-semibold text-amber-400">{totalStories}</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">简单</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{easyCount}</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">中等</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{mediumCount}</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">困难</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{hardCount}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-200">选择一个故事开始</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </main>
  )
}
