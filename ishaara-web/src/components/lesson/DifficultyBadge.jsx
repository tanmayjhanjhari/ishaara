import { Badge } from '../ui'

const LEVELS = [
  { max: 1, label: 'Beginner',     variant: 'success' },
  { max: 3, label: 'Intermediate', variant: 'warning' },
  { max: 5, label: 'Advanced',     variant: 'error'   },
]

function getDotColor(difficulty) {
  if (difficulty === 1) return 'bg-success'
  if (difficulty <= 3)  return 'bg-warning'
  return 'bg-error'
}

export default function DifficultyBadge({ difficulty = 1 }) {
  const level = LEVELS.find(l => difficulty <= l.max) || LEVELS[LEVELS.length - 1]
  const dotColor = getDotColor(difficulty)

  return (
    <Badge variant={level.variant} size="sm" className="gap-1.5">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`inline-block w-1.5 h-1.5 rounded-full transition-all ${
              i < difficulty ? dotColor : 'bg-white/15'
            }`}
          />
        ))}
      </span>
      {level.label}
    </Badge>
  )
}
