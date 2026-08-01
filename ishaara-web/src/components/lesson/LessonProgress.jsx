import { ProgressBar } from '../ui'

export default function LessonProgress({ current, total, lessonTitle }) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-text-muted truncate max-w-[60%]">
          {lessonTitle}
        </span>
        <span className="text-sm text-text-dim font-mono shrink-0">
          {current} <span className="text-text-dim/50">/ {total}</span>
        </span>
      </div>
      <ProgressBar value={pct} size="sm" color="primary" />
    </div>
  )
}
