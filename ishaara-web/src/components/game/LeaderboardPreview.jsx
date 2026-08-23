import { Card, SkeletonLoader, Avatar } from '../ui'
import { useLeaderboard } from '../../api/gamification'
import { Link } from 'react-router-dom'

export default function LeaderboardPreview() {
  const { data, isLoading, isError } = useLeaderboard()

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  if (isLoading) {
    return (
      <Card className="p-5 bg-gray-900/40 border border-gray-800/80 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
            <span className="text-sm font-semibold text-gray-300">🏆 Weekly Ranking</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <SkeletonLoader variant="circle" size="sm" />
                <SkeletonLoader variant="line" width="w-24" />
                <div className="ml-auto">
                  <SkeletonLoader variant="line" width="w-12" />
                </div>
              </div>
            ))}
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
            <span className="text-sm font-semibold text-gray-300">🏆 Weekly Ranking</span>
          </div>
          <div className="text-xs text-gray-500 text-center py-6">
            Failed to load leaderboard.
          </div>
        </div>
      </Card>
    )
  }

  const { entries = [], current_user } = data
  const top3 = entries.slice(0, 3)

  return (
    <Card className="p-5 bg-gray-900/40 border border-gray-800/80 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
          <span className="text-sm font-semibold text-gray-300">🏆 Weekly Ranking</span>
        </div>

        {/* User Rank Card */}
        {current_user && (
          <div className="mb-4 p-3 rounded-lg bg-surface border border-border flex justify-between items-center select-none">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-muted font-bold">YOUR RANK</span>
              <span className="text-sm font-black text-indigo-400">
                {current_user.rank ? `#${current_user.rank}` : 'Unranked'}
              </span>
            </div>
            <div className="text-right flex flex-col gap-0.5">
              <span className="text-xs text-text-muted font-bold">WEEKLY XP</span>
              <span className="text-sm font-black text-white font-mono">
                {current_user.weekly_xp} XP
              </span>
            </div>
          </div>
        )}

        {top3.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-6">
            No activity in the league yet. Be the first!
          </div>
        ) : (
          <div className="space-y-2 select-none">
            {top3.map((entry, idx) => {
              const rank = idx + 1
              return (
                <div
                  key={entry.user_id}
                  className="flex items-center gap-3 py-1.5 border-b border-gray-800/20 last:border-0"
                >
                  {/* Medal/Rank */}
                  <span className="w-6 text-center text-sm font-bold shrink-0">
                    {getRankEmoji(rank)}
                  </span>

                  {/* Avatar */}
                  <Avatar name={entry.display_name} size="sm" />

                  {/* Name */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-300 truncate">
                      {entry.display_name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold leading-none">
                      LVL {entry.level}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="ml-auto font-mono text-xs font-bold text-gray-400">
                    {entry.weekly_xp} XP
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Link
        to="/leaderboard"
        className="block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-4 pt-2 border-t border-gray-800/50 transition-colors"
      >
        View full leaderboard →
      </Link>
    </Card>
  )
}
