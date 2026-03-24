type TStoryRevealProps = {
  bottom: string
}

export function StoryReveal({ bottom }: TStoryRevealProps) {
  return (
    <section className="rounded-lg border border-amber-400/40 bg-slate-800/80 p-5 shadow-lg">
      <h2 className="text-xl font-semibold text-amber-400">汤底真相</h2>
      <p className="mt-3 leading-7 text-slate-200">{bottom}</p>
    </section>
  )
}
