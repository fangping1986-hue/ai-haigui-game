import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGameFlow } from '../context/GameFlowContext'
import { askAI, InvalidHostAnswerError } from '../api'
import { ChatBox } from '../components/ChatBox'
import { STORIES } from '../data/stories'
import type { TMessage, TStory } from '../types/game'

/** 将异常转为聊天内可读的友好文案 */
function toFriendlyErrorMessage(error: unknown): string {
  if (error instanceof InvalidHostAnswerError) {
    return '主持人回答需为「是」「否」「无关」之一，本次未符合规范。请把问题说得更具体，或换一种问法后重新提问。'
  }
  if (error instanceof Error) {
    const msg = error.message
    if (msg.includes('未配置') || msg.includes('VITE_AI_API_KEY')) {
      return '暂时无法作答：尚未配置 AI 密钥，请设置环境变量 VITE_AI_API_KEY 后重试。'
    }
    if (msg.includes('网络') || msg.includes('连接') || msg.includes('fetch')) {
      return '网络异常，请检查连接后稍后再试。'
    }
    return msg.length > 120 ? `${msg.slice(0, 120)}…` : msg
  }
  return '服务暂时不可用，请稍后再试。'
}

export function Game() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { statusLabel } = useGameFlow()
  const story = useMemo(() => STORIES.find((item) => item.id === id), [id])
  const [messages, setMessages] = useState<TMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  const handleEndGame = () => {
    navigate('/')
  }

  const handleAbandon = () => {
    if (
      window.confirm(
        '确定放弃本局？返回大厅后，本局对话记录将不会保留（未揭晓汤底前可随时再开新局）。',
      )
    ) {
      navigate('/')
    }
  }

  const handleSend = async (question: string) => {
    const currentStory: TStory | undefined = story
    if (!currentStory || isSending) return

    const userMessage: TMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }
    const assistantId = crypto.randomUUID()
    const pendingMessage: TMessage = {
      id: assistantId,
      role: 'assistant',
      content: '思考中...',
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage, pendingMessage])
    setIsSending(true)

    try {
      const answer = await askAI(question, currentStory)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: answer, variant: undefined }
            : m,
        ),
      )
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: toFriendlyErrorMessage(e),
                variant: 'error',
              }
            : m,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  if (!story) {
    return (
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-md motion-safe:animate-message-in rounded-lg border border-rose-500/30 bg-slate-800/90 p-6 text-center shadow-lg"
          role="alert"
        >
          <p className="text-lg font-medium text-rose-200">未找到对应故事</p>
          <p className="mt-2 text-sm text-slate-400">
            链接可能已失效，请从大厅重新选择故事。
          </p>
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
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
          {statusLabel}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-amber-400">{story.title}</h1>
      <p className="mt-3 rounded-lg border border-slate-700 bg-slate-800/70 p-4 text-slate-200 shadow-lg">
        汤面：{story.surface}
      </p>
      <div className="mt-6">
        <ChatBox
          messages={messages}
          onSend={handleSend}
          isSending={isSending}
        />
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <Link
          to={`/result/${story.id}`}
          state={{ messages }}
          className="tap-target inline-flex items-center justify-center rounded-lg bg-amber-400 px-5 font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 active:scale-[0.98]"
        >
          查看汤底
        </Link>
        <button
          type="button"
          onClick={handleEndGame}
          className="tap-target rounded-lg border border-slate-600 px-5 text-slate-100 transition hover:border-slate-500 hover:bg-slate-800/80 active:scale-[0.98]"
        >
          结束游戏
        </button>
        <button
          type="button"
          onClick={handleAbandon}
          className="tap-target rounded-lg border border-rose-500/45 px-5 text-rose-200 transition hover:border-rose-400/60 hover:bg-rose-950/40 active:scale-[0.98]"
        >
          放弃本局
        </button>
      </div>
    </main>
  )
}
