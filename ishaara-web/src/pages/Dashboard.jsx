import { Link, useNavigate } from 'react-router-dom'
import { Zap, Flame, Star, ArrowRight, TrendingUp, PlayCircle, Award } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import HandConstellation from '../components/ui/HandConstellation'
import { StatTile, ProgressBar, Card, Button, Badge, Spinner } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import { getDisplayName } from '../utils/user'
import { useMyStats, useStreak, useBadges } from '../api/gamification'
import { useStreakStore } from '../store/streakStore'
import StreakCard from '../components/game/StreakCard'
import StreakReminderBanner from '../components/game/StreakReminderBanner'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const DOT_COLOR = {
  mastered: '#10B981',
  unlocked: '#A78BFA',
  'locked-soon': '#4A4A7A',
  locked: '#2A2A5A',
}
const DOT_GLOW = {
  mastered: '0 0 12px rgba(16,185,129,0.8)',
  unlocked: '0 0 12px rgba(167,139,250,0.9)',
  'locked-soon': 'none',
  locked: 'none',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const displayName = getDisplayName(user)
  const { data: stats, isLoading } = useMyStats()
  const { data: streakData } = useStreak()
  const { data: badgesData } = useBadges()
  const isStreakDay = useStreakStore(state => state.isStreakDay)

  const recentBadges = badgesData?.earned?.slice(-3) || []

  const xp = stats?.xp_total ?? 0
  const level = stats?.level ?? 1
  const streak = streakData?.current_streak ?? stats?.current_streak ?? 0
  const signsMastered = stats?.signs_mastered ?? 0
  const avgAccuracy = stats?.avg_accuracy ?? 0
  const xpProgress = stats?.xp_progress ?? 0
  const xpForNext = stats?.xp_for_next_level ?? 500
  const xpPct = stats?.xp_progress_pct ?? 0
  const badges = stats?.badges_earned ?? []

  // Build constellation status from real mastery count
  const getStatus = (letter) => {
    const idx = ALPHABET.indexOf(letter)
    if (idx < signsMastered) return 'mastered'
    if (idx === signsMastered) return 'unlocked'
    if (idx <= signsMastered + 3) return 'locked-soon'
    return 'locked'
  }

  return (
    <PageWrapper>
      {/* Streak Reminder Banner */}
      {!isStreakDay && streak > 0 && (
        <StreakReminderBanner
          currentStreak={streak}
          onStartPractice={() => navigate('/lessons')}
        />
      )}

      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.7s ease-out both' }}>
        <p className="text-sm font-semibold tracking-widest text-text-muted uppercase mb-2">
          Welcome back, {displayName}
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          Your Universe
        </h1>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-24 flex items-center justify-center">
              <Spinner size="sm" />
            </Card>
          ))
        ) : (
          <>
            <StatTile icon={Flame} value={streak || '—'} label="Day Streak" trend={streak > 0 ? 'up' : undefined} trendValue={streak > 1 ? 'Hot' : undefined} />
            <StatTile icon={Zap} value={xp.toLocaleString()} label="Total XP" />
            <StatTile icon={Star} value={signsMastered} label="Signs Mastered" />
            <StatTile icon={TrendingUp} value={avgAccuracy > 0 ? `${avgAccuracy}%` : '—'} label="Avg Accuracy" />
          </>
        )}
      </div>

      {/* Progression & Habit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {/* XP bar */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest text-text-muted uppercase">Level</span>
                  <span className="text-2xl font-black text-primary-light">{level}</span>
                </div>
                <div className="text-sm font-mono text-text-muted">
                  <span className="text-primary-light font-bold">{xpProgress.toLocaleString()}</span> / {xpForNext.toLocaleString()} XP
                </div>
              </div>
              <ProgressBar value={xpPct} color="primary" />
            </div>
            <div className="text-xs text-text-dim mt-3">
              {isLoading ? '…' : `${(xpForNext - xpProgress).toLocaleString()} XP to Level ${level + 1}`}
            </div>
          </Card>
        </div>

        {/* Streak & Badge Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <StreakCard
            currentStreak={streakData?.current_streak ?? streak}
            longestStreak={streakData?.longest_streak ?? 0}
            lastActiveDate={streakData?.last_active_date ?? null}
          />
          
          {/* Badge Summary Widget */}
          <Card className="flex flex-col justify-between p-5 relative overflow-hidden bg-gradient-to-br from-indigo-950/40 to-space-light/20">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold tracking-widest text-text-muted uppercase">Recent Badges</span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {badgesData?.total_earned || 0} Earned
                </span>
              </div>

              {recentBadges.length === 0 ? (
                <div className="text-xs text-text-dim py-2 font-medium">
                  Complete signs to earn badges
                </div>
              ) : (
                <div className="flex gap-3 py-1 items-center">
                  {recentBadges.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      title={b.name}
                      className="text-3xl select-none transform hover:scale-110 transition-transform duration-200"
                    >
                      {b.icon || b.icon_url || '🏆'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
              <Link
                to="/profile#badges"
                className="text-xs font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-1"
              >
                <span>See all {badgesData?.total_available || 14} badges</span>
                <ArrowRight size={12} className="stroke-[2.5px]" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Continue Banner ───────────────────────────────────────────── */}
      <div className="mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <Card variant="elevated" className="overflow-hidden relative p-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-cyan/10 pointer-events-none" />
          <div className="p-8 flex items-center justify-between flex-wrap gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <HandConstellation size={80} animate={false} />
              <div>
                <div className="text-xs text-primary font-semibold tracking-widest uppercase mb-1">Continue where you left off</div>
                <div className="text-2xl font-bold text-text-primary mb-1">ISL Alphabet</div>
                <div className="text-sm text-text-muted">
                  {signsMastered} of 26 signs mastered
                </div>
              </div>
            </div>
            <Link to="/lessons">
              <Button variant="primary" size="lg">
                <PlayCircle size={18} className="mr-2" />
                Continue
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Constellation Map ─────────────────────────────────────────── */}
      <div className="mb-12 animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Sign Constellation Map
          </h2>
          <Link to="/lessons" className="text-sm font-medium text-primary hover:text-primary-light flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4 items-center">
            {ALPHABET.map((letter, i) => {
              const status = getStatus(letter)
              const isActive = status === 'unlocked'
              return (
                <div key={letter} className="flex flex-col items-center gap-1.5">
                  <div style={{
                    width: isActive ? 44 : 36,
                    height: isActive ? 44 : 36,
                    borderRadius: '50%',
                    background: status === 'mastered' ? 'rgba(16,185,129,0.15)' : status === 'unlocked' ? 'rgba(124,58,237,0.2)' : 'rgba(42,42,90,0.5)',
                    border: `2px solid ${DOT_COLOR[status]}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: DOT_GLOW[status],
                    cursor: status === 'locked' ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    animation: isActive ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
                  }}>
                    <span className="font-bold font-outfit" style={{
                      fontSize: isActive ? '0.95rem' : '0.8rem',
                      color: DOT_COLOR[status],
                    }}>{letter}</span>
                  </div>
                  {status === 'mastered' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mt-6 pt-5 border-t border-white/5">
            {[
              { color: '#10B981', label: 'Mastered' },
              { color: '#A78BFA', label: 'In Progress' },
              { color: '#4A4A7A', label: 'Locked' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-xs font-medium text-text-muted">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Achievements row ──────────────────────────────────────────── */}
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Recent Achievements
          </h2>
          <Link to="/profile" className="text-sm font-medium text-primary hover:text-primary-light flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="flex-1 h-20 flex items-center justify-center">
                <Spinner size="sm" />
              </Card>
            ))}
          </div>
        ) : badges.length === 0 ? (
          <Card className="text-center py-10">
            <Award size={36} className="mx-auto text-text-dim mb-3" />
            <p className="text-text-muted text-sm">Complete your first lesson to earn badges!</p>
            <Link to="/lessons" className="inline-block mt-4">
              <Button variant="primary" size="sm">Start Learning</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.slice(0, 3).map(b => (
              <Card key={b.id} variant="elevated" className="flex items-center gap-4">
                <div className="text-3xl leading-none w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
                  style={{ background: 'rgba(124,58,237,0.1)' }}>
                  {b.icon_url ? <img src={b.icon_url} alt={b.name} className="w-8 h-8 object-contain" /> : '🏆'}
                </div>
                <div>
                  <div className="font-bold text-sm text-primary-light">{b.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">{b.description}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
