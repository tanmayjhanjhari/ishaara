import PageWrapper from '../components/layout/PageWrapper'
import HandConstellation from '../components/ui/HandConstellation'
import { Zap, Flame, Star, Award, TrendingUp, Calendar } from 'lucide-react'
import { Card, StatTile, ProgressBar, Badge } from '../components/ui'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SIGN_ACCURACY = { A:98, B:95, C:92, D:89, E:94, F:87, G:85, H:91, I:76 }

const BADGES = [
  { emoji:'🔥', name:'Week Warrior',   desc:'7-day streak',             color:'#FCD34D', earned: true },
  { emoji:'✋', name:'First Contact',  desc:'Completed first sign',      color:'#6EE7B7', earned: true },
  { emoji:'⚡', name:'Speed Scorer',   desc:'90+ score 3x in a row',    color:'#A78BFA', earned: true },
  { emoji:'🌟', name:'Stargazer',      desc:'8 signs mastered',          color:'#67E8F9', earned: true },
  { emoji:'🏆', name:'Chapter Clear',  desc:'Complete all 26 alphabet',  color:'#FCD34D', earned: false },
  { emoji:'🎯', name:'Perfectionist',  desc:'Score 100 on any sign',     color:'#6EE7B7', earned: false },
  { emoji:'⚔️', name:'Boss Slayer',    desc:'Win a Boss Battle',         color:'#EF4444', earned: false },
  { emoji:'🌌', name:'Constellation',  desc:'Full universe revealed',    color:'#A78BFA', earned: false },
]

function AccuracyCell({ letter }) {
  const acc = SIGN_ACCURACY[letter]
  const hasData = acc !== undefined
  const color = !hasData ? '#2A2A5A'
    : acc >= 90 ? '#10B981'
    : acc >= 70 ? '#06B6D4'
    : acc >= 50 ? '#F59E0B'
    : '#EF4444'

  return (
    <div
      title={hasData ? `${letter}: ${acc}%` : `${letter}: not attempted`}
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
          {acc}
        </span>
      )}
    </div>
  )
}

export default function Profile() {
  const xp = 1240, maxXp = 2000, level = 5
  const pct = Math.round((xp / maxXp) * 100)

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
            Level {level} · Learner
          </p>
          <h1 className="font-outfit font-extrabold text-3xl md:text-4xl text-text-primary tracking-tight mb-2">
            Arjun Sharma
          </h1>
          <p className="text-sm text-text-muted mb-5">Joined June 2026 · Indian Sign Language Track</p>

          {/* XP bar */}
          <div className="max-w-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-text-muted">Level {level} → {level + 1}</span>
              <span className="font-mono text-xs font-bold text-primary-light">
                {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
              </span>
            </div>
            <ProgressBar value={pct} color="primary" />
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <StatTile icon={Flame} value="7" label="Streak" />
        <StatTile icon={Zap} value="1,240" label="Total XP" />
        <StatTile icon={Star} value="8" label="Signs Mastered" />
        <StatTile icon={TrendingUp} value="94%" label="Avg Accuracy" />
        <StatTile icon={Calendar} value="12" label="Days Active" />
      </div>

      {/* ── Sign mastery grid ── */}
      <div className="mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="font-outfit font-bold text-xl text-text-primary mb-4">Sign Mastery Map</h2>
        <Card>
          <div className="flex flex-wrap gap-2">
            {ALPHABET.map(l => <AccuracyCell key={l} letter={l} />)}
          </div>
          <div className="flex flex-wrap gap-5 mt-5 pt-4 border-t border-white/5">
            {[{ c:'#10B981', l:'90–100 Mastered' }, { c:'#06B6D4', l:'70–89 Great' }, { c:'#F59E0B', l:'50–69 Learning' }, { c:'#2A2A5A', l:'Not started' }].map(i => (
              <div key={i.l} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: i.c }} />
                <span className="text-xs text-text-muted">{i.l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Badges ── */}
      <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="font-outfit font-bold text-xl text-text-primary mb-4 flex items-baseline gap-3">
          Achievements
          <span className="text-sm font-normal text-text-muted">{BADGES.filter(b=>b.earned).length}/{BADGES.length} earned</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map(b => (
            <Card key={b.name} variant="elevated" className={`flex items-center gap-3 p-4 ${b.earned ? 'opacity-100' : 'opacity-35'}`}>
              <div className="w-11 h-11 shrink-0 rounded-xl text-[22px] flex items-center justify-center border" style={{
                background: b.earned ? `${b.color}18` : 'rgba(42,42,90,0.3)',
                borderColor: b.earned ? `${b.color}35` : 'rgba(42,42,90,0.5)',
              }}>{b.emoji}</div>
              <div>
                <div className="font-bold text-sm" style={{ color: b.earned ? b.color : '#4A4A7A' }}>{b.name}</div>
                <div className="text-xs text-text-muted mt-0.5">{b.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
