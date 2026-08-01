import { Button, StatTile } from '../ui'
import { CheckCircle2, BookOpen, Zap, Target, TrendingUp } from 'lucide-react'

export default function LessonComplete({
  lesson,
  scores,
  onPracticeAgain,
  onBack,
  // Props from API response (Step 8)
  xpEarned    = null,
  newLevel     = null,
  leveledUp    = false,
  badgesEarned = [],
}) {
  const signCount = lesson?.signs?.length ?? 0

  // Use API xpEarned if available, otherwise estimate from sign rewards
  const displayXP = xpEarned !== null
    ? xpEarned
    : (lesson?.signs?.reduce((sum, s) => sum + (s.xp_reward ?? 10), 0) ?? signCount * 10)

  const avgScore = scores?.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12 text-center">

      {/* Level-up banner */}
      {leveledUp && newLevel && (
        <div
          className="w-full max-w-sm mb-6 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)',
            animation: 'levelUpSlide 0.5s ease-out both',
          }}
        >
          <TrendingUp size={20} color="#6EE7B7" className="shrink-0" />
          <p className="text-success-light font-semibold text-sm">
            Level Up! You reached <span className="font-black">Level {newLevel}</span> 🎉
          </p>
        </div>
      )}

      {/* Badge notifications */}
      {badgesEarned.length > 0 && (
        <div className="w-full max-w-sm mb-6 flex flex-col gap-2">
          {badgesEarned.map(badge => (
            <div
              key={badge.id}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
              }}
            >
              <span className="text-lg">🏆</span>
              <div className="text-left">
                <p className="text-primary-light font-semibold text-sm">{badge.name}</p>
                <p className="text-text-muted text-xs">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animated checkmark */}
      <div
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)',
          border: '2px solid rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'completePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          boxShadow: '0 0 40px rgba(16,185,129,0.3)',
        }}
      >
        <CheckCircle2 size={40} color="#6EE7B7" />
      </div>

      <h1
        className="font-outfit font-black text-text-primary mt-6"
        style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}
      >
        Lesson Complete!
      </h1>
      <p className="text-text-muted mt-2">
        You practiced <span className="text-text-primary font-semibold">{signCount} signs</span>
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
        <StatTile label="Signs"     value={signCount}                            icon={BookOpen} />
        <StatTile label="XP Earned" value={`+${displayXP}`}                     icon={Zap} />
        <StatTile label="Accuracy"  value={avgScore !== null ? `${avgScore}%` : '--'} icon={Target} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <Button variant="secondary" size="lg" onClick={onPracticeAgain}>
          Practice Again
        </Button>
        <Button variant="primary" size="lg" onClick={onBack}>
          Back to Lessons
        </Button>
      </div>
    </div>
  )
}
