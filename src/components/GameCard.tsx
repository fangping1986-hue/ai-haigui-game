import { Link } from 'react-router-dom'
import type { TStory } from '../types/game'

type TGameCardProps = {
  story: TStory
}

const DIFFICULTY_LABEL_MAP: Record<TStory['difficulty'], string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

export function GameCard({ story }: TGameCardProps) {
  return (
    <Link
      to={`/game/${story.id}`}
      className="group block rounded-lg border border-slate-700 bg-slate-800/80 p-5 shadow-lg transition duration-300 hover:border-amber-400 hover:bg-slate-800 active:scale-[0.99] motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-400 transition group-hover:text-amber-300">
          {story.title}
        </h3>
        <span className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-300">
          {DIFFICULTY_LABEL_MAP[story.difficulty]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{story.surface}</p>
    </Link>
  )
}
