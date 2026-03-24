/** 三圆点加载指示，用于「思考中」等场景 */
export function LoadingDots() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-amber-400/90 motion-safe:animate-loading-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  )
}
