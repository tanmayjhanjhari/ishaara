import { Card } from '../ui'

function formatTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RecentActivityFeed({ attempts = [] }) {
  const getScoreChipClass = (score) => {
    if (score >= 70) return 'bg-green-900/50 text-green-400 border border-green-700/30'
    if (score >= 50) return 'bg-amber-900/50 text-amber-400 border border-amber-700/30'
    return 'bg-red-900/50 text-red-400 border border-red-700/30'
  }

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-gray-900/40 border border-gray-800/80">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
          <span className="text-sm font-semibold text-gray-300">Recent Activity</span>
        </div>

        {attempts.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-6">
            No activity yet — start your first lesson!
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.slice(0, 5).map((attempt, idx) => (
              <div
                key={attempt.created_at + idx}
                className="flex items-center gap-3 py-2.5 border-b border-gray-800/50 last:border-0"
              >
                {/* Sign Label Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                    attempt.is_success
                      ? 'bg-green-900/40 text-green-400 border border-green-500/20'
                      : 'bg-red-900/40 text-red-400 border border-red-500/20'
                  }`}
                >
                  {attempt.sign_label}
                </div>

                {/* Middle info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-sm font-semibold text-gray-300 truncate">
                    Sign {attempt.sign_label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {formatTimeAgo(attempt.created_at)}
                  </span>
                </div>

                {/* Score Pill */}
                <div className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full shrink-0 ${getScoreChipClass(attempt.score)}`}>
                  {Math.round(attempt.score)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
