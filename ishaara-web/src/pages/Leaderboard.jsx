import PageWrapper from '../components/layout/PageWrapper'
import { Zap, Flame, Crown, TrendingUp, Trophy } from 'lucide-react'
import { Card, ProgressBar, Spinner } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import { getDisplayName } from '../utils/user'
import { useLeaderboard } from '../api/gamification'

const TIERS = [
  { name: 'Platinum', color: '#67E8F9', bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.25)',  glow: 'rgba(6,182,212,0.4)', minXp: 5000 },
  { name: 'Gold',     color: '#FCD34D', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', glow: 'rgba(245,158,11,0.4)', minXp: 2000 },
  { name: 'Silver',   color: '#A78BFA', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)', glow: 'rgba(124,58,237,0.35)', minXp: 800 },
  { name: 'Bronze',   color: '#6EE7B7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)',  glow: 'rgba(16,185,129,0.3)', minXp: 0 },
]

const AVATARS = ['🌸', '⚡', '🌙', '🔥', '✨', '🎯', '🌌', '💫', '🛸', '🌺', '🦋', '🌊', '🎆', '🌟', '🎇', '🏔️', '🌈', '🎭', '🦚', '🌻', '🎋', '🔮', '🌠', '🎐', '🧿', '🎑']

function getTier(xp) {
  return TIERS.find(t => xp >= t.minXp) || TIERS[TIERS.length - 1]
}

function getAvatar(userId) {
  // deterministic avatar from user id hash
  const hash = userId ? userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0
  return AVATARS[hash % AVATARS.length]
}

function RankBadge({ rank }) {
  if (rank === 1) return <Crown size={18} color="#FCD34D" />
  if (rank === 2) return <span className="font-mono font-bold text-sm text-cyan">#2</span>
  if (rank === 3) return <span className="font-mono font-bold text-sm text-primary-light">#3</span>
  return <span className="font-mono font-semibold text-xs text-text-muted">#{rank}</span>
}

export default function Leaderboard() {
  const { user } = useAuthStore()
  const displayName = getDisplayName(user)
  const { data, isLoading, isError } = useLeaderboard()

  const leaderboard = data?.leaderboard ?? []
  const myRank = data?.my_rank ?? null
  const myEntry = data?.my_entry ?? null
  const maxXP = leaderboard[0]?.xp || 1

  const myTier = myEntry ? getTier(myEntry.xp) : TIERS[TIERS.length - 1]
  const nextTier = TIERS.find(t => t.minXp > (myEntry?.xp ?? 0))
  const xpToNextTier = nextTier ? nextTier.minXp - (myEntry?.xp ?? 0) : 0

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-2">
          Weekly League
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-2">
          League Standings
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Top learners ranked by XP earned. Keep practicing to climb the ranks!
        </p>
      </div>

      {/* Tier badges */}
      <div className="flex flex-wrap gap-3 mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {TIERS.map(tier => (
          <div key={tier.name} className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200" style={{
            background: tier.bg, borderColor: tier.border,
            boxShadow: tier.name === myTier?.name ? `0 0 16px ${tier.glow}` : 'none',
          }}>
            <div className="w-2 h-2 rounded-full" style={{ background: tier.color, boxShadow: `0 0 6px ${tier.color}` }} />
            <span className="text-sm font-semibold" style={{ color: tier.color }}>{tier.name}</span>
            <span className="text-xs opacity-50" style={{ color: tier.color }}>{tier.minXp.toLocaleString()}+ XP</span>
            {tier.name === myTier?.name && (
              <span className="text-xs opacity-70 ml-1" style={{ color: tier.color }}>← You</span>
            )}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-surface/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Card className="text-center py-10">
          <Trophy size={36} className="mx-auto text-text-dim mb-3" />
          <p className="text-text-muted">Could not load leaderboard. Try again later.</p>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && leaderboard.length === 0 && (
        <Card className="text-center py-16">
          <Trophy size={48} className="mx-auto text-primary-light mb-4 opacity-50" />
          <h3 className="font-bold text-text-primary mb-2">Be the first!</h3>
          <p className="text-text-muted text-sm">Complete lessons to appear on the leaderboard.</p>
        </Card>
      )}

      {/* Leaderboard table */}
      {!isLoading && !isError && leaderboard.length > 0 && (
        <div className="flex flex-col gap-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {leaderboard.map((u, i) => {
            const tier = getTier(u.xp)
            const barWidth = (u.xp / maxXP) * 100
            const avatar = getAvatar(u.user_id)

            return (
              <div
                key={u.user_id}
                className="p-4 sm:p-5 rounded-2xl border flex items-center gap-4 sm:gap-6 transition-all duration-200 animate-fade-up"
                style={{
                  background: u.is_me
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08))'
                    : i < 3 ? 'rgba(14,14,42,0.85)' : 'rgba(10,10,26,0.7)',
                  border: `1px solid ${u.is_me ? 'rgba(124,58,237,0.4)' : i < 3 ? tier.border : 'rgba(167,139,250,0.07)'}`,
                  boxShadow: u.is_me ? '0 0 24px rgba(124,58,237,0.15)' : 'none',
                  animationDelay: `${i * 0.05}s`
                }}
              >
                {/* Rank */}
                <div className="w-7 text-center shrink-0">
                  <RankBadge rank={u.rank} />
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full text-xl flex items-center justify-center shrink-0 border-[1.5px]" style={{
                  background: tier.bg, borderColor: tier.border,
                  boxShadow: i < 3 ? `0 0 12px ${tier.glow}` : 'none',
                }}>{avatar}</div>

                {/* Name + XP bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm truncate" style={{
                      color: u.is_me ? '#A78BFA' : i < 3 ? tier.color : '#EEE9FF',
                    }}>
                      {u.is_me ? displayName : u.display_name}
                      {u.is_me && <span className="ml-2 text-xs font-normal text-text-muted">(you)</span>}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      {/* Streak */}
                      <div className="flex items-center gap-1 text-xs text-warning-light">
                        <Flame size={12} />
                        {u.streak}
                      </div>
                      {/* XP */}
                      <div className="flex items-center gap-1 font-mono text-xs font-semibold" style={{ color: tier.color }}>
                        <Zap size={12} />
                        {u.xp.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* XP bar */}
                  <div className="h-1 rounded-full overflow-hidden bg-white/5">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, ${tier.color}, ${i < 3 ? '#06B6D4' : tier.color}80)`,
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* My rank summary */}
      {myEntry && (
        <Card className="mt-8 flex items-center justify-between gap-4 animate-fade-up bg-primary/10 border-primary/20" style={{ animationDelay: '0.5s' }}>
          <div>
            <div className="text-xs text-text-muted mb-1">Your rank</div>
            <div className="font-outfit font-extrabold text-xl md:text-2xl text-primary-light">
              #{myRank} · {myTier.name} League
            </div>
          </div>
          {nextTier && (
            <div className="text-right">
              <div className="text-xs text-text-muted mb-1">To reach {nextTier.name}</div>
              <div className="font-mono font-bold text-lg text-warning-light">
                +{xpToNextTier.toLocaleString()} XP needed
              </div>
            </div>
          )}
          {!nextTier && (
            <div className="text-right">
              <div className="text-xs text-success mb-1">🏆 Top tier achieved!</div>
              <div className="font-mono font-bold text-lg text-success-light">
                {myEntry.xp.toLocaleString()} XP
              </div>
            </div>
          )}
        </Card>
      )}
    </PageWrapper>
  )
}
