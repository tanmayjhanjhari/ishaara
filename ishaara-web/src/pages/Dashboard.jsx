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
    profile,
    streak,
    weak_signs = [],
    recent_attempts = [],
    lesson_progress = [],
    recent_badges = [],
    daily_challenge,
  } = data

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        {/* Streak reminder banner if not active today */}
        {!streak.is_active_today && streak.current > 0 && (
          <StreakReminderBanner
            currentStreak={streak.current}
            onStartPractice={() => navigate('/lessons')}
          />
        )}

        {/* Greeting */}
        <DashboardGreeting
          displayName={profile.display_name}
          currentStreak={streak.current}
          attemptsToday={profile.attempts_today}
        />

        {/* XP Bar — full width */}
        <div className="mb-8">
          <XPBar
            xp={profile.xp_total}
            level={profile.level}
            nextLevelXP={profile.next_level_xp}
            prevLevelXP={profile.prev_level_xp}
            animated={true}
          />
        </div>

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
