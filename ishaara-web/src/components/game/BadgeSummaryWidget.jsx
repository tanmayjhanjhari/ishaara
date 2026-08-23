import { Card, SkeletonLoader, ProgressBar } from '../ui'
import { useBadges } from '../../api/gamification'
import { Link } from 'react-router-dom'

export default function BadgeSummaryWidget() {
  const { data, isLoading, isError } = useBadges()

  if (isLoading) {
    return (
      <Card className="p-5 bg-gray-900/40 border border-gray-800/80 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
            <span className="text-sm font-semibold text-gray-300">Badges Earned</span>
          </div>
          <div className="flex flex-col gap-4">
            <SkeletonLoader variant="line" width="w-16" height="h-8" />
            <SkeletonLoader variant="line" width="w-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonLoader key={i} variant="circle" size="sm" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="p-5 bg-gray-900/40 border border-gray-800/80 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
            <span className="text-sm font-semibold text-gray-300">Badges Earned</span>
          </div>
          <div className="text-xs text-gray-500 text-center py-6">
            Failed to load badges.
          </div>
        </div>
      </Card>
    )
  }

  const { earned = [], total_earned = 0, total_available = 0 } = data
  const progressPercent = total_available > 0 ? (total_earned / total_available) * 100 : 0
  const recentEarned = earned.slice(0, 4)

  return (
    <Card className="p-5 bg-gray-900/40 border border-gray-800/80 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
          <span className="text-sm font-semibold text-gray-300">Badges Earned</span>
        </div>

        <div className="flex items-baseline gap-2 select-none mb-3">
          <span className="text-3xl font-black text-white font-mono leading-none">
            {total_earned}
          </span>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-mono">
            of {total_available}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 select-none">
          <ProgressBar progress={progressPercent} className="h-2 bg-gray-800" />
        </div>

        {/* Recent Badge Icons */}
        {recentEarned.length === 0 ? (
          <div className="text-xs text-gray-500 py-2 italic select-none">
            No badges earned yet. Keep learning to unlock achievements!
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2 select-none">
            {recentEarned.map((badge) => (
              <div
                key={badge.id}
                title={badge.name}
                className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-2xl hover:scale-105 transition-transform duration-200"
              >
                {badge.icon || '🏅'}
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        to="/profile"
        className="block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-4 pt-2 border-t border-gray-800/50 transition-colors"
      >
        View all badges →
      </Link>
    </Card>
  )
}
