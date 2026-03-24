import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TMessage } from '../types/game'
import { ChatEmptyState } from './ChatEmptyState'
import { Message } from './Message'

type TChatBoxProps = {
  messages: TMessage[]
  onSend: (question: string) => void | Promise<void>
  /** AI 请求进行中，禁用输入避免重复提交 */
  isSending?: boolean
}

export function ChatBox({
  messages,
  onSend,
  isSending = false,
}: TChatBoxProps) {
  const [question, setQuestion] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim() || isSending) return
    void onSend(question.trim())
    setQuestion('')
  }

  return (
    <section
      className="rounded-lg border border-slate-700 bg-slate-800/70 p-3 shadow-lg sm:p-4"
      aria-label="与主持人对话"
    >
      <div
        ref={scrollRef}
        className="mb-3 min-h-[min(42vh,16rem)] max-h-[min(52vh,28rem)] space-y-3 overflow-y-auto overscroll-y-contain scroll-smooth motion-reduce:scroll-auto px-0.5 sm:mb-4 sm:max-h-[min(56vh,30rem)]"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:gap-2"
        aria-busy={isSending}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="输入你的问题…"
          disabled={isSending}
          enterKeyHint="send"
          className="min-h-11 w-full flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-base outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:text-sm"
        />
        <button
          type="submit"
          disabled={isSending}
          className="tap-target shrink-0 rounded-lg bg-amber-400 px-5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-4"
        >
          {isSending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
              发送中
            </span>
          ) : (
            '提问'
          )}
        </button>
      </form>
    </section>
  )
}
