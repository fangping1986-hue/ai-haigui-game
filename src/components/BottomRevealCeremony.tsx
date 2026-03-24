import { useEffect, useState } from 'react'

type TBottomRevealCeremonyProps = {
  bottom: string
}

type TPhase = 'ritual' | 'show'

/** 揭晓汤底的仪式感：帷幕文案 + 短暂停顿 + 金色光晕与上浮显现 */
export function BottomRevealCeremony({ bottom }: TBottomRevealCeremonyProps) {
  const [phase, setPhase] = useState<TPhase>('ritual')

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('show'), 1500)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section className="relative" aria-live="polite">
      {phase === 'ritual' && (
        <div className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-lg border border-amber-400/35 bg-slate-950/90 px-6 py-14 shadow-lg">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.12) 0%, transparent 55%)',
            }}
          />
          <p className="relative z-10 animate-pulse text-lg font-medium tracking-[0.35em] text-amber-400">
            谜底
          </p>
          <p className="relative z-10 mt-3 text-sm text-slate-500">
            尘封已久的真相，即将浮现……
          </p>
          <div className="relative z-10 mt-10 h-1 w-48 overflow-hidden rounded-full bg-slate-800/90">
            <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-transparent via-amber-400/75 to-transparent animate-ritual-shimmer" />
          </div>
        </div>
      )}

      {phase === 'show' && (
        <div className="relative animate-fade-rise">
          <span
            className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-ping"
            aria-hidden
          />
          <div className="animate-reveal-glow rounded-lg border-2 border-amber-400/55 bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-slate-950/95 p-6 shadow-lg md:p-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500/90">
              汤底真相
            </h2>
            <p className="mt-6 text-lg font-medium leading-[1.75] text-amber-50 md:text-2xl md:leading-relaxed">
              {bottom}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
