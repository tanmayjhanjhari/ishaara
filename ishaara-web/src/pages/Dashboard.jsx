import { Link } from 'react-router-dom'
import { Zap, Flame, Star, ArrowRight, TrendingUp, Award, PlayCircle } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import HandConstellation from '../components/ui/HandConstellation'
import { StatTile, ProgressBar, Card, Button, Badge } from '../components/ui'

// Mock constellation path: 26 alphabet signs
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SIGN_STATUS = {
  A: 'mastered', B: 'mastered', C: 'mastered', D: 'mastered', E: 'mastered',
  F: 'mastered', G: 'mastered', H: 'mastered', I: 'unlocked',
}
const getStatus = l => SIGN_STATUS[l] || (ALPHABET.indexOf(l) <= 11 ? 'locked-soon' : 'locked')

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
  return (
    <PageWrapper>
      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.7s ease-out both' }}>
        <p className="text-sm font-semibold tracking-widest text-text-muted uppercase mb-2">
          Welcome back
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          Your Universe
        </h1>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <StatTile icon={Flame} value="7" label="Day Streak" trend="up" trendValue="Hot" />
        <StatTile icon={Zap} value="1,240" label="Total XP" trend="up" trendValue="120" />
        <StatTile icon={Star} value="8" label="Signs Mastered" />
        <StatTile icon={TrendingUp} value="94%" label="Avg Accuracy" />
      </div>

      {/* XP bar */}
      <div className="mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <Card>
          <div className="flex justify-between items-baseline mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-text-muted uppercase">Level</span>
              <span className="text-2xl font-black text-primary-light">5</span>
            </div>
            <div className="text-sm font-mono text-text-muted">
              <span className="text-primary-light font-bold">1,240</span> / 2,000 XP
            </div>
          </div>
          <ProgressBar value={62} color="primary" />
          <div className="text-xs text-text-dim mt-3">
            760 XP to Level 6
          </div>
        </Card>
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
                <div className="text-2xl font-bold text-text-primary mb-1">Sign I: Alphabet</div>
                <div className="text-sm text-text-muted">9 signs mastered · Learning Path</div>
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { emoji: '🔥', name: 'Week Warrior', desc: '7-day streak', color: '#FCD34D', bg: 'rgba(245,158,11,0.1)' },
            { emoji: '✋', name: 'First Signs', desc: 'Mastered A–E', color: '#6EE7B7', bg: 'rgba(16,185,129,0.1)' },
            { emoji: '⚡', name: 'Speed Run', desc: 'Score 90+ three times', color: '#A78BFA', bg: 'rgba(124,58,237,0.1)' },
          ].map(a => (
            <Card key={a.name} variant="elevated" className="flex items-center gap-4">
              <div className="text-3xl leading-none w-12 h-12 flex items-center justify-center rounded-xl shrink-0" style={{ background: a.bg }}>
                {a.emoji}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: a.color }}>{a.name}</div>
                <div className="text-xs text-text-muted mt-0.5">{a.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
