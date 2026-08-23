import { useLeaderboard } from '../api/gamification'
import LeaderboardRow from '../components/game/LeaderboardRow'
import UserRankCard from '../components/game/UserRankCard'
import { useCountdown, formatCountdown } from '../utils/countdown'
import PageWrapper from '../components/layout/PageWrapper'
import { Card, Button, Spinner, SkeletonLoader, EmptyState } from '../components/ui'
import { ArrowRight, RotateCw } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Leaderboard() {
  const { data, isLoading, isError, refetch } = useLeaderboard()
  const countdown = useCountdown(data?.resets_in_seconds || 0)

  // Compute week progress percent
  const totalWeekSeconds = 7 * 86400
  const elapsedSeconds = Math.max(0, totalWeekSeconds - countdown.remaining)
  const weekProgressPercent = Math.min(100, Math.round((elapsedSeconds / totalWeekSeconds) * 100))

  return (
    <PageWrapper>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 select-none animate-fade-up">
        <div>
          <h1 className="font-outfit font-extrabold text-2xl md:text-3xl text-text-primary tracking-tight">
            Weekly Leaderboard
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Top learners by XP earned this week
          </p>
        </div>

        {/* Resets card */}
        <div className="bg-gray-800/80 border border-gray-700/40 rounded-xl px-4 py-2.5 w-full sm:w-48 relative overflow-hidden shadow-md shrink-0">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
            <span>Resets in</span>
            <span className="text-indigo-400 font-bold">{weekProgressPercent}%</span>
          </div>
          <div className="text-sm font-bold text-white font-mono leading-none py-0.5">
            {formatCountdown(countdown.days, countdown.hours, countdown.minutes)}
          </div>
          {/* Thin week progress bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-indigo-500 transition-all duration-1000"
              style={{ width: `${weekProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Own rank summary card */}
      {data?.current_user && (
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <UserRankCard currentUser={data.current_user} weekStart={data.week_start} />
        </div>
      )}

      {/* Main leaderboard rankings list */}
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <Card variant="elevated" className="overflow-hidden p-0 border border-white/5 shadow-2xl">
          {/* Table Header */}
          <div className="bg-gray-800/40 border-b border-gray-800 px-4 py-3 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span className="w-8 text-center shrink-0">RANK</span>
            <span className="flex-1">LEARNER</span>
            <span className="text-right shrink-0">WEEKLY XP</span>
          </div>

          {/* Table Body States */}
          {isLoading ? (
            <div className="divide-y divide-gray-800/50 p-2 space-y-2">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <SkeletonLoader variant="circle" width={32} height={32} className="shrink-0" />
                  <SkeletonLoader variant="rectangle" height={32} className="flex-1 rounded-lg" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <p className="text-text-muted text-sm font-medium">Could not load leaderboard.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()} className="flex items-center gap-2">
                <RotateCw size={14} />
                <span>Retry</span>
              </Button>
            </div>
          ) : !data.entries || data.entries.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No activity yet this week"
                description="Be the first to practice and earn XP to claim the top spot!"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-800/30">
              {data.entries.map((entry, idx) => (
                <div
                  key={entry.user_id}
                  style={{
                    animation: 'fadeUp 0.3s ease-out both',
                    animationDelay: `${idx * 40}ms`
                  }}
                >
                  <LeaderboardRow
                    entry={entry}
                    isCurrentUser={entry.is_current_user}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mt-8 mb-4 block select-none">
        Leaderboard resets every Monday at midnight UTC
      </span>
    </PageWrapper>
  )
}
