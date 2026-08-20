import React, { useState } from 'react'
import { CheckCircle2, BookOpen, Zap, Target, ChevronDown, ChevronUp, AlertCircle, Award } from 'lucide-react'
import { Button, StatTile, Card } from '../ui'
import { getRating } from '../../cv/scoring'
import { getLessonInsight } from '../../cv/feedback'

export default function LessonSummary({
  lesson,
  signResults = [],
  totalXP = 0,
  onPracticeAgain,
  onBack
}) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const insight = getLessonInsight(signResults) || {
    bestSign: null,
    weakestSign: null,
    successCount: 0,
    totalCount: 0,
    successRate: 0
  }

  const { bestSign, weakestSign, successCount, totalCount, successRate } = insight

  // Sort breakdown by score descending
  const sortedBreakdown = [...signResults].sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto px-6 py-12 text-center animate-fade-in">
      {/* Animated checkmark */}
      <div
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'completePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.25)',
        }}
      >
        <CheckCircle2 size={40} className="text-success-light" />
      </div>

      <h1 className="font-outfit font-black text-white text-3xl mt-6">
        Lesson Complete!
      </h1>
      <p className="text-text-muted mt-2 text-sm">
        You mastered <span className="text-success-light font-bold">{successCount}</span> of{' '}
        <span className="text-white font-bold">{totalCount}</span> signs
      </p>

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-4 mt-8 w-full">
        <StatTile label="Signs" value={totalCount} icon={BookOpen} />
        <StatTile label="XP Earned" value={`+${totalXP}`} icon={Zap} />
        <StatTile label="Accuracy" value={`${successRate}%`} icon={Target} />
      </div>

      {/* Highlights (Best Sign & Needs Work) */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 w-full text-left">
          {/* Best Sign */}
          {bestSign && (
            <Card
              className="border-success/30 bg-success/5 p-5 relative overflow-hidden"
              style={{ borderLeftWidth: '4px' }}
            >
              <div className="absolute top-2 right-2 opacity-10">
                <Award size={64} className="text-success-light" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-success-light font-extrabold font-outfit">
                Best Sign
              </p>
              <h3 className="text-2xl font-black text-white font-outfit mt-1">
                {bestSign.sign?.label}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: getRating(bestSign.score).color + '20',
                    color: getRating(bestSign.score).color,
                  }}
                >
                  {getRating(bestSign.score).label}
                </span>
                <span className="text-xs text-text-muted">
                  Score: {bestSign.score}%
                </span>
              </div>
            </Card>
          )}

          {/* Weakest Sign / Needs Work */}
          {weakestSign && weakestSign.score < 70 && (
            <Card
              className="border-amber-500/30 bg-amber-500/5 p-5 relative overflow-hidden"
              style={{ borderLeftWidth: '4px' }}
            >
              <div className="absolute top-2 right-2 opacity-10">
                <AlertCircle size={64} className="text-amber-500" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500 font-extrabold font-outfit">
                Keep Practicing
              </p>
              <h3 className="text-2xl font-black text-white font-outfit mt-1">
                {weakestSign.sign?.label}
              </h3>
              <p className="text-xs text-text-muted mt-2">
                Score: {weakestSign.score}% • Try this sign again
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Per-sign breakdown list (Collapsible) */}
      {sortedBreakdown.length > 0 && (
        <div className="w-full mt-6 text-left">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-surface/50 border border-white/5 hover:bg-surface/80 transition-colors text-sm font-semibold text-text-primary"
          >
            <span>See all signs breakdown</span>
            {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showBreakdown && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/5 bg-surface/30 divide-y divide-white/5 animate-slide-down">
              {sortedBreakdown.map((item, idx) => {
                const rating = getRating(item.score)
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary-light font-outfit">
                        {item.sign?.label}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          Sign {item.sign?.label}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: rating.color + '20',
                          color: rating.color,
                        }}
                      >
                        {rating.label}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-10 justify-center w-full">
        <Button variant="secondary" size="lg" className="flex-1 max-w-[200px]" onClick={onPracticeAgain}>
          Practice Again
        </Button>
        <Button variant="primary" size="lg" className="flex-1 max-w-[200px]" onClick={onBack}>
          Back to Lessons
        </Button>
      </div>
    </div>
  )
}
