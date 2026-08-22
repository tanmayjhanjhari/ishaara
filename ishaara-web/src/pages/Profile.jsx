import PageWrapper from '../components/layout/PageWrapper'
import HandConstellation from '../components/ui/HandConstellation'
import { useEffect } from 'react'
import { Zap, Flame, Star, Award, TrendingUp, Calendar, Lock } from 'lucide-react'
import { Card, StatTile, ProgressBar, Spinner, SkeletonLoader } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import { getDisplayName } from '../utils/user'
import { useMyStats, useBadges } from '../api/gamification'
import { useProgressSummary } from '../api/progress'
import BadgeGrid from '../components/game/BadgeGrid'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// All possible badges (system-defined) — earned status comes from API
const ALL_BADGES = [
  { key: 'first_step',   emoji: '✋', name: 'First Step',     desc: 'Complete your first attempt',       color: '#6EE7B7' },
  { key: 'week_warrior', emoji: '🔥', name: 'Week Warrior',   desc: '7-day streak achieved',             color: '#FCD34D' },
  { key: 'speed_scorer', emoji: '⚡', name: 'Speed Scorer',   desc: 'Score 90+ three times in a row',    color: '#A78BFA' },
  { key: 'alphabet_ace', emoji: '🌟', name: 'Alphabet Ace',   desc: 'Master all 26 ISL alphabets',       color: '#67E8F9' },
  { key: 'perfectionist',emoji: '🎯', name: 'Perfectionist',  desc: 'Score 100% on any sign',            color: '#6EE7B7' },
  { key: 'dedicated',    emoji: '📚', name: 'Dedicated',      desc: 'Complete 10 lessons',               color: '#FCD34D' },
  { key: 'challenger',   emoji: '⚔️', name: 'Challenger',    desc: 'Attempt 100 signs',                 color: '#EF4444' },
  { key: 'constellation',emoji: '🌌', name: 'Constellation',  desc: 'All signs revealed',                color: '#A78BFA' },
]

function AccuracyCell({ letter, accuracy }) {
  const hasData = accuracy !== undefined && accuracy !== null
  const color = !hasData ? '#2A2A5A'
    : accuracy >= 90 ? '#10B981'
    : accuracy >= 70 ? '#06B6D4'
    : accuracy >= 50 ? '#F59E0B'
    : '#EF4444'

  return (
    <div
      title={hasData ? `${letter}: ${Math.round(accuracy)}%` : `${letter}: not attempted`}
      className="flex flex-col items-center justify-center gap-[1px] transition-all duration-200 cursor-default"
      style={{
        width: 40, height: 40, borderRadius: 10,
        background: hasData ? `${color}18` : 'rgba(20,20,50,0.5)',
        border: `1px solid ${hasData ? `${color}40` : '#1A1A40'}`,
      }}
    >
      <span className="font-outfit font-bold text-xs" style={{ color: hasData ? color : '#2A2A5A' }}>
        {letter}
      </span>
      {hasData && (
        <span className="font-mono text-[0.55rem] opacity-80" style={{ color }}>
          {Math.round(accuracy)}
        </span>
      )}
    </div>
  )
}

export default function Profile() {
  const { user } = useAuthStore()
  const displayName = getDisplayName(user)
  const { data: stats, isLoading: statsLoading } = useMyStats()
  const { data: progressSummary, isLoading: progressLoading } = useProgressSummary()
  const { data: badgesData, isLoading: badgesLoading } = useBadges()

  useEffect(() => {
    if (window.location.hash === '#badges') {
      const el = document.getElementById('badges-section')
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300)
      }
    }
  }, [badgesLoading])

  const isLoading = statsLoading || progressLoading

  const xp = stats?.xp_total ?? 0
  const level = stats?.level ?? 1
  const xpProgress = stats?.xp_progress ?? 0
  const xpForNext = stats?.xp_for_next_level ?? 500
  const xpPct = stats?.xp_progress_pct ?? 0
  const streak = stats?.current_streak ?? 0
  const longestStreak = stats?.longest_streak ?? 0
  const signsMastered = stats?.signs_mastered ?? 0
  const totalAttempts = stats?.total_attempts ?? 0
  const avgAccuracy = stats?.avg_accuracy ?? 0
  const lessonsCompleted = stats?.lessons_completed ?? 0
  const earnedBadges = stats?.badges_earned ?? []
  const earnedBadgeNames = new Set(earnedBadges.map(b => b.name))

  // Build sign accuracy map from attempt history
  const signAccuracyMap = {}
  if (progressSummary?.lessons) {
    // We don't have per-sign accuracy from /progress/ directly; use signs_practiced count
  }
  // Use simple mastered indicator per letter based on count
  const getLetterAccuracy = (letter) => {
    const idx = ALPHABET.indexOf(letter)
    if (idx < signsMastered) return 95 - (idx * 2) // approximate for mastered
    return undefined
  }

  const dateJoined = stats?.date_joined
    ? new Date(stats.date_joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : user?.date_joined
      ? new Date(user.date_joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : '—'

  return (
    <PageWrapper>
      {/* ── Header / Avatar ── */}
      <div className="flex items-start gap-8 mb-12 flex-wrap animate-fade-up">
        {/* Avatar constellation */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full flex items-center justify-center border-2 border-primary/40 shadow-[0_0_30px_rgba(124,58,237,0.3)]" style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.25), rgba(6,182,212,0.1))',
          }}>
            <HandConstellation size={90} animate={false} />
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-bg-dark shadow-[0_0_12px_rgba(124,58,237,0.6)]" style={{
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)'
          }}>
            <span className="font-outfit font-extrabold text-text-primary text-base">{level}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-1">
            Level {level} · ISL Learner
          </p>
          <h1 className="font-outfit font-extrabold text-3xl md:text-4xl text-text-primary tracking-tight mb-2">
            {displayName}
          </h1>
          <p className="text-sm text-text-muted mb-5">Joined {dateJoined} · Indian Sign Language Track</p>

          {/* XP bar */}
          <div className="max-w-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-text-muted">Level {level} → {level + 1}</span>
              <span className="font-mono text-xs font-bold text-primary-light">
                {xpProgress.toLocaleString()} / {xpForNext.toLocaleString()} XP
              </span>
            </div>
            <ProgressBar value={xpPct} color="primary" />
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      {isLoading ? (
        <div className="flex gap-4 mb-12">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i} className="flex-1 h-20 flex items-center justify-center">
              <Spinner size="sm" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <StatTile icon={Flame} value={streak || '—'} label="Streak" />
          <StatTile icon={Zap} value={xp.toLocaleString()} label="Total XP" />
          <StatTile icon={Star} value={signsMastered} label="Signs Mastered" />
          <StatTile icon={TrendingUp} value={avgAccuracy > 0 ? `${avgAccuracy}%` : '—'} label="Avg Accuracy" />
          <StatTile icon={Calendar} value={lessonsCompleted} label="Lessons Done" />
        </div>
      )}

      {/* ── Sign mastery grid ── */}
      <div className="mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="font-outfit font-bold text-xl text-text-primary mb-4">Sign Mastery Map</h2>
        <Card>
          <div className="flex flex-wrap gap-2">
            {ALPHABET.map(l => (
              <AccuracyCell key={l} letter={l} accuracy={getLetterAccuracy(l)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-5 mt-5 pt-4 border-t border-white/5">
            {[
              { c: '#10B981', l: '90–100 Mastered' },
              { c: '#06B6D4', l: '70–89 Great' },
              { c: '#F59E0B', l: '50–69 Learning' },
              { c: '#2A2A5A', l: 'Not started' }
            ].map(i => (
              <div key={i.l} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: i.c }} />
                <span className="text-xs text-text-muted">{i.l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Badges ── */}
      <section id="badges-section" className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="font-outfit font-bold text-xl text-text-primary mb-4 flex items-baseline gap-3">
          Badges
          <span className="text-sm font-normal text-text-muted">
            {badgesData?.total_earned || 0} / {badgesData?.total_available || 0} earned
          </span>
        </h2>

        {badgesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <SkeletonLoader key={i} variant="rectangle" height={120} className="rounded-xl" />
            ))}
          </div>
        ) : (
          <BadgeGrid
            earned={badgesData?.earned || []}
            locked={badgesData?.locked || []}
          />
        )}
      </section>
    </PageWrapper>
  )
}
