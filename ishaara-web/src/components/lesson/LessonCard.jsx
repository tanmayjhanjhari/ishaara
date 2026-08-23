import { memo } from 'react'
import { Card, Badge, ProgressBar } from '../ui'
import DifficultyBadge from './DifficultyBadge'
import { CheckCircle2, Clock } from 'lucide-react'

const CATEGORY_VARIANT = {
  alphabet: 'primary',
  word:     'neutral',
  phrase:   'success',
}

const PROGRESS_VALUE = {
  not_started: 0,
  in_progress: 50,
  completed:   100,
}

const LessonCard = memo(function LessonCard({ lesson, onClick }) {
  const status        = lesson.user_progress_status || 'not_started'
  const progressValue = PROGRESS_VALUE[status] ?? 0
  const progressColor = status === 'completed' ? 'success' : 'primary'
  const catVariant    = CATEGORY_VARIANT[lesson.category] || 'neutral'

  return (
    <Card hover onClick={onClick} className="flex flex-col h-full">
      {/* Top row — category left, difficulty + status right (no overlaps) */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <Badge variant={catVariant} size="sm" className="capitalize shrink-0">
          {lesson.category}
        </Badge>

        <div className="flex items-center gap-2 shrink-0">
          {status === 'completed' && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-success-light bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
              <CheckCircle2 size={11} />
              Done
            </div>
          )}
          {status === 'in_progress' && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-warning-light bg-warning/10 border border-warning/20 rounded-full px-2 py-0.5">
              <Clock size={11} />
              Active
            </div>
          )}
          <DifficultyBadge difficulty={lesson.difficulty} />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-text-primary font-semibold mb-1"
        style={{ fontSize: '1.05rem', lineHeight: 1.35 }}
      >
        {lesson.title}
      </h3>

      {/* Description */}
      {lesson.description && (
        <p
          className="text-sm text-text-muted mb-4"
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {lesson.description}
        </p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats row */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-text-muted">{lesson.sign_count} signs</span>
        {lesson.sign_count != null && (
          <span className="text-sm font-medium text-primary-light font-mono">
            {lesson.sign_count * 10} XP
          </span>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar value={progressValue} size="sm" color={progressColor} />
    </Card>
  )
})

export default LessonCard
