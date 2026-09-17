import { useDashboard } from '../api/auth'
import { useStreakStore } from '../store/streakStore'
import { useNavigate } from 'react-router-dom'
import DashboardGreeting from '../components/ui/DashboardGreeting'
import XPBar from '../components/game/XPBar'
import StreakCard from '../components/game/StreakCard'
import WeakSignsWidget from '../components/lesson/WeakSignsWidget'
import RecentActivityFeed from '../components/lesson/RecentActivityFeed'
import DailyGoalCard from '../components/game/DailyGoalCard'
import ContinueLearningCard from '../components/lesson/ContinueLearningCard'
import PageWrapper from '../components/layout/PageWrapper'
import { SkeletonLoader, Card, Button } from '../components/ui'
import LeaderboardPreview from '../components/game/LeaderboardPreview'
import BadgeSummaryWidget from '../components/game/BadgeSummaryWidget'
import StreakReminderBanner from '../components/game/StreakReminderBanner'
import { Sparkles } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useDashboard()

  if (isLoading) return <DashboardSkeleton />
  if (isError) return <DashboardError />

  const {
    profile = {},
    streak = {},
    weak_signs = [],
    recent_attempts = [],
    lesson_progress = [],
    recent_badges = [],
    daily_challenge,
  } = data || {}

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        {/* Streak reminder banner if not active today */}
        {!streak?.is_active_today && (streak?.current || 0) > 0 && (
          <StreakReminderBanner
            currentStreak={streak.current}
            onStartPractice={() => navigate('/lessons')}
          />
        )}

        {/* Greeting */}
        <DashboardGreeting
          displayName={profile?.display_name || 'Learner'}
          currentStreak={streak?.current || 0}
          attemptsToday={profile?.attempts_today || 0}
        />

        {/* XP Bar — full width */}
        <div className="mb-8">
          <XPBar
            xp={profile?.xp_total || 0}
            level={profile?.level || 1}
            nextLevelXP={profile?.next_level_xp}
            prevLevelXP={profile?.prev_level_xp || 0}
            animated={true}
          />
        </div>

        {/* Welcome Quest for new learners */}
        {profile.xp_total === 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-cyan-950/40 border border-indigo-500/30 shadow-xl shadow-indigo-950/30 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 mb-3">
                  <Sparkles size={13} className="text-indigo-400" />
                  <span>Beginner Launchpad · Quest 0/3</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black font-outfit text-white mb-2">
                  Ready to Start Signing?
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  ISHAARA evaluates your sign language in real time directly inside your browser. No video is ever sent to a server.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-300 font-black flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span className="text-gray-200 font-medium">Turn on webcam</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 font-black flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span className="text-gray-200 font-medium">Form Letter 'A'</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span className="text-gray-200 font-medium">Score 55%+ to advance</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-8 font-black shadow-lg shadow-indigo-500/30"
                  onClick={() => navigate('/lessons')}
                >
                  Start Letter A Now →
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/leaderboard')}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors text-center"
                >
                  Check League Race Standings →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Optional Daily Challenge Banner */}
        {daily_challenge && (
          <Card className="mb-8 p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/40 border border-indigo-500/20 relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Daily Challenge
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      +{daily_challenge.xp_reward} XP
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {daily_challenge.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {daily_challenge.description}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto font-bold shrink-0"
                onClick={() => navigate('/lessons')}
              >
                Accept Challenge
              </Button>
            </div>
          </Card>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Row 1 */}
          {/* Streak card — col 1-4 */}
          <div className="md:col-span-4">
            <StreakCard
              currentStreak={streak.current}
              longestStreak={streak.longest}
              lastActiveDate={streak.last_active}
            />
          </div>

          {/* Daily goal — col 5-8 */}
          <div className="md:col-span-4">
            <DailyGoalCard
              attemptsToday={profile.attempts_today}
              goalCount={10}
            />
          </div>

          {/* Continue learning — col 9-12 */}
          <div className="md:col-span-4">
            <ContinueLearningCard lessonProgress={lesson_progress} />
          </div>

          {/* Row 2 */}
          {/* Weak signs — col 1-5 */}
          <div className="md:col-span-5">
            <WeakSignsWidget signs={weak_signs} />
          </div>

          {/* Recent activity — col 6-12 */}
          <div className="md:col-span-7">
            <RecentActivityFeed attempts={recent_attempts} />
          </div>

          {/* Row 3 */}
          {/* Leaderboard preview — col 1-6 */}
          <div className="md:col-span-6">
            <LeaderboardPreview />
          </div>

          {/* Badges summary — col 7-12 */}
          <div className="md:col-span-6">
            <BadgeSummaryWidget />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function DashboardSkeleton() {
  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonLoader variant="line" width="w-64" height="h-8" className="mb-2" />
        <SkeletonLoader variant="line" width="w-40" height="h-4" className="mb-8" />
        <SkeletonLoader variant="rectangle" height="h-6" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SkeletonLoader variant="rectangle" height="h-32" />
          <SkeletonLoader variant="rectangle" height="h-32" />
          <SkeletonLoader variant="rectangle" height="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader variant="rectangle" height="h-48" />
          <SkeletonLoader variant="rectangle" height="h-48" />
        </div>
      </div>
    </PageWrapper>
  )
}

function DashboardError() {
  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-400">Could not load dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-indigo-400 text-sm underline hover:text-indigo-300"
          >
            Retry
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
