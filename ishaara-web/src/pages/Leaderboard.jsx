import PageWrapper from '../components/layout/PageWrapper'
import { Zap, Crown, Flame, TrendingUp } from 'lucide-react'
import { Card, Badge, ProgressBar } from '../components/ui'

const TIERS = [
  { name: 'Platinum', color: '#67E8F9', bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.25)',  glow: 'rgba(6,182,212,0.4)', minXp: 5000 },
  { name: 'Gold',     color: '#FCD34D', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', glow: 'rgba(245,158,11,0.4)', minXp: 2000 },
  { name: 'Silver',   color: '#A78BFA', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)', glow: 'rgba(124,58,237,0.35)', minXp: 800 },
  { name: 'Bronze',   color: '#6EE7B7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)',  glow: 'rgba(16,185,129,0.3)', minXp: 0 },
]

const USERS = [
  { rank:1,  name:'Priya M.',     xp:6840, streak:22, avatar:'🌸', tier:'Platinum', isMe: false },
  { rank:2,  name:'Rohan K.',     xp:5920, streak:18, avatar:'⚡', tier:'Platinum', isMe: false },
  { rank:3,  name:'Aisha T.',     xp:4380, streak:31, avatar:'🌙', tier:'Gold',     isMe: false },
  { rank:4,  name:'Dev S.',       xp:3210, streak:9,  avatar:'🔥', tier:'Gold',     isMe: false },
  { rank:5,  name:'Meera R.',     xp:2890, streak:14, avatar:'✨', tier:'Gold',     isMe: false },
  { rank:6,  name:'Karan B.',     xp:2100, streak:7,  avatar:'🎯', tier:'Gold',     isMe: false },
  { rank:7,  name:'Arjun S.',     xp:1240, streak:7,  avatar:'🌌', tier:'Silver',   isMe: true },
  { rank:8,  name:'Neha G.',      xp:980,  streak:5,  avatar:'💫', tier:'Silver',   isMe: false },
  { rank:9,  name:'Vikram L.',    xp:750,  streak:3,  avatar:'🛸', tier:'Silver',   isMe: false },
  { rank:10, name:'Sanya P.',     xp:620,  streak:2,  avatar:'🌺', tier:'Bronze',   isMe: false },
]

const maxXP = USERS[0].xp

function RankBadge({ rank }) {
  if (rank === 1) return <Crown size={18} color="#FCD34D" />
  if (rank === 2) return <span className="font-mono font-bold text-sm text-cyan">#2</span>
  if (rank === 3) return <span className="font-mono font-bold text-sm text-primary-light">#3</span>
  return <span className="font-mono font-semibold text-xs text-text-muted">#{rank}</span>
}

export default function Leaderboard() {
  const myTier = TIERS.find(t => t.name === 'Silver')

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
          Top 20 learners by XP earned this week. Resets every Sunday at midnight.
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
            {tier.name === myTier?.name && (
              <span className="text-xs opacity-70 ml-1" style={{ color: tier.color }}>← You</span>
            )}
          </div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="flex flex-col gap-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {USERS.map((u, i) => {
          const tier = TIERS.find(t => t.name === u.tier)
          const barWidth = (u.xp / maxXP) * 100

          return (
            <div
              key={u.rank}
              className={`p-4 sm:p-5 rounded-2xl border flex items-center gap-4 sm:gap-6 transition-all duration-200 animate-fade-up`}
              style={{
                background: u.isMe
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08))'
                  : i < 3 ? 'rgba(14,14,42,0.85)' : 'rgba(10,10,26,0.7)',
                border: `1px solid ${u.isMe ? 'rgba(124,58,237,0.4)' : i < 3 ? tier.border : 'rgba(167,139,250,0.07)'}`,
                boxShadow: u.isMe ? '0 0 24px rgba(124,58,237,0.15)' : 'none',
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
              }}>{u.avatar}</div>

              {/* Name + XP bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm" style={{
                    color: u.isMe ? '#A78BFA' : i < 3 ? tier.color : '#EEE9FF',
                  }}>
                    {u.name}
                    {u.isMe && <span className="ml-2 text-xs font-normal text-text-muted">(you)</span>}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
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

      {/* My rank summary */}
      <Card className="mt-8 flex items-center justify-between gap-4 animate-fade-up bg-primary/10 border-primary/20" style={{ animationDelay: '0.5s' }}>
        <div>
          <div className="text-xs text-text-muted mb-1">Your rank this week</div>
          <div className="font-outfit font-extrabold text-xl md:text-2xl text-primary-light">
            #7 · Silver League
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted mb-1">To reach Gold</div>
          <div className="font-mono font-bold text-lg text-warning-light">
            +760 XP needed
          </div>
        </div>
      </Card>
    </PageWrapper>
  )
}
