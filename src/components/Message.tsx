import type { TMessage } from '../types/game'
import { LoadingDots } from './LoadingDots'

type TMessageProps = {
  message: TMessage
}

function ErrorGlyph() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function Message({ message }: TMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.variant === 'error'
  const isLoading = !isUser && message.content === '思考中...'

  return (
    <div
      className={`flex motion-safe:animate-message-in ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        role={isError ? 'alert' : undefined}
        className={`max-w-[min(100%,20rem)] rounded-lg px-4 py-2.5 shadow-lg transition-transform duration-200 sm:max-w-[80%] ${
          isUser
            ? 'bg-amber-400 text-slate-900 active:scale-[0.99]'
            : isError
              ? 'motion-safe:animate-shake-error border border-rose-500/45 bg-slate-900/85 text-rose-100'
              : 'bg-slate-700 text-slate-100'
        } ${isLoading ? 'border border-amber-400/25 bg-slate-800/90' : ''}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2.5" aria-live="polite" aria-busy="true">
            <LoadingDots />
            <span className="text-sm text-amber-100/95">思考中…</span>
          </div>
        ) : isError ? (
          <div className="flex gap-2">
            <ErrorGlyph />
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  )
}
