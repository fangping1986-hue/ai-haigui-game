import { Link, useLocation, useParams } from 'react-router-dom'
import { BottomRevealCeremony } from '../components/BottomRevealCeremony'
import { useGameFlow } from '../context/GameFlowContext'
import { Message } from '../components/Message'
import { STORIES } from '../data/stories'
import type { TMessage, TResultLocationState } from '../types/game'

function readMessagesFromState(state: unknown): TMessage[] {
  if (state === null || typeof state !== 'object') return []
  const { messages } = state as TResultLocationState
  if (!Array.isArray(messages)) return []
  return messages.filter(
    (m): m is TMessage =>
      m !== null &&
      typeof m === 'object' &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string',
  )
}

export function Result() {
  const { id } = useParams()
  const location = useLocation()
  const { statusLabel } = useGameFlow()
  const story = STORIES.find((item) => item.id === id)
  const historyMessages = readMessagesFromState(location.state).filter(
    (m) => !(m.role === 'assistant' && m.content === '思考中...'),
  )

  if (!story) {
    return (
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-md motion-safe:animate-message-in rounded-lg border border-rose-500/30 bg-slate-800/90 p-6 text-center shadow-lg"
          role="alert"
        >
          <p className="text-lg font-medium text-rose-200">故事不存在</p>
          <p className="mt-2 text-sm text-slate-400">请从大厅选择有效故事后再试。</p>
          <Link
            to="/"
            className="tap-target mt-6 inline-flex items-center justify-center rounded-lg bg-amber-400 px-6 font-semibold text-slate-900 transition hover:bg-amber-300 active:scale-[0.98]"
          >
            返回大厅
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative mx-auto min-h-[100dvh] w-full max-w-3xl px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251,191,36,0.14), transparent 50%)',
        }}
      />

      <header className="text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-500/80">
            游戏结果
          </p>
          <span className="rounded-lg border border-slate-500/60 bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {statusLabel}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-amber-400 md:text-4xl">
          {story.title}
        </h1>
      </header>

      <div className="mt-10">
        <BottomRevealCeremony bottom={story.bottom} />
      </div>

      <section className="mt-12 rounded-lg border border-slate-700 bg-slate-800/50 p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-amber-400/95">本局推理记录</h2>
        {historyMessages.length === 0 ? (
          <div
            className="mt-4 motion-safe:animate-message-in rounded-lg border border-dashed border-slate-600/80 bg-slate-900/45 px-4 py-8 text-center"
            role="status"
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-xl"
              aria-hidden
            >
              📜
            </div>
            <p className="mt-3 text-sm font-medium text-slate-300">暂无对话记录</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              若从游戏页点击「查看汤底」进入，会显示本局问答；直接打开本链接则无法还原历史。
            </p>
          </div>
        ) : (
          <div className="mt-4 max-h-[min(50vh,20rem)] space-y-3 overflow-y-auto overscroll-y-contain pr-1 sm:max-h-80">
            {historyMessages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 flex justify-center md:justify-start">
        <Link
          to="/"
          className="tap-target inline-flex w-full max-w-xs items-center justify-center rounded-lg bg-amber-400 px-8 py-3 text-center text-base font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 active:scale-[0.98] sm:w-auto"
        >
          再来一局
        </Link>
      </div>
    </main>
  )
}
