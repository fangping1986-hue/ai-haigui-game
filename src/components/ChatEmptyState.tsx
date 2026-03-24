/** 聊天区尚无消息时的引导 */
export function ChatEmptyState() {
  return (
    <div className="flex min-h-[min(42vh,16rem)] flex-col items-center justify-center gap-4 px-4 py-6 text-center motion-safe:animate-message-in">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/10 text-2xl shadow-inner"
        aria-hidden
      >
        ❓
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">向主持人提问，逼近真相</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          回答只会是「是」「否」或「无关」。尽量问
          <span className="text-amber-400/90">可判断真假</span>
          的具体陈述。
        </p>
      </div>
      <ul className="max-w-xs space-y-1.5 text-left text-xs text-slate-500">
        <li className="flex gap-2">
          <span className="text-amber-500/80">·</span>
          <span>例：「死者是自杀吗？」「现场有第二个人吗？」</span>
        </li>
        <li className="flex gap-2">
          <span className="text-amber-500/80">·</span>
          <span>准备好后可在下方输入框发送第一条问题。</span>
        </li>
      </ul>
    </div>
  )
}
