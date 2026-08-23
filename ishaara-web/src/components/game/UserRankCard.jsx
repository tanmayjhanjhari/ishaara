import { Card, ProgressBar } from '../ui'

export default function UserRankCard({ currentUser, weekStart }) {
  if (!currentUser) return null

  const hasRank = !!currentUser.rank
  const formattedWeekStart = weekStart
    ? new Date(weekStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : ''

  // Visual approximate progress: target is weekly_xp + xp_to_next_rank
  const totalTarget = (currentUser.weekly_xp || 0) + (currentUser.xp_to_next_rank || 0)
  const progressPercent = totalTarget > 0 
    ? Math.round(((currentUser.weekly_xp || 0) / totalTarget) * 100)
    : 0

  return (
    <Card className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 mb-6 select-none">
      {/* Top row */}
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-gray-400">
        <span>Your Rank This Week</span>
        {formattedWeekStart && (
          <span className="text-gray-500 font-medium normal-case font-mono">
            Week of {formattedWeekStart}
          </span>
        )}
      </div>

      {/* Main row */}
      <div className="flex items-center justify-between mt-4">
        {/* Rank display */}
        <div className="flex flex-col">
          {hasRank ? (
            <>
              <span className="text-4xl font-black text-white font-outfit">
                #{currentUser.rank}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                Of all learners
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-500 font-outfit">
                Unranked
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1">
                Complete a sign to join
              </span>
            </>
          )}
        </div>

        {/* XP display */}
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black text-indigo-400 font-mono">
            {currentUser.weekly_xp?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
            XP this week
          </span>
        </div>
      </div>

      {/* Progress to next rank */}
      {hasRank && currentUser.xp_to_next_rank > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-700/30">
          <p className="text-xs text-gray-300 font-medium mb-2.5">
            Earn <span className="text-indigo-400 font-bold font-mono">{currentUser.xp_to_next_rank} more XP</span> to reach rank #{currentUser.rank - 1}
          </p>
          <ProgressBar value={progressPercent} color="primary" className="h-1.5" />
        </div>
      )}
    </Card>
  )
}
