import { Hand, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getSignData } from '../../data/islAlphabet'

// Accent color per letter — consistent with SignReference
const LETTER_COLORS = [
  '#A78BFA', '#67E8F9', '#6EE7B7', '#FCD34D', '#F9A8D4',
  '#C4B5FD', '#7DD3FC', '#86EFAC', '#FDE68A', '#FDA4AF',
]
function getLetterColor(letter) {
  const idx = (letter?.toUpperCase()?.charCodeAt(0) || 65) - 65
  return LETTER_COLORS[idx % LETTER_COLORS.length]
}

export default function TutorialPanel({ sign, onClose, onStartPractice }) {
  if (!sign) return null

  const letter    = sign.label?.toUpperCase() || 'A'
  const signData  = getSignData(letter)
  const color     = getLetterColor(letter)

  const instruction   = signData?.instruction   || `Make the ISL sign for "${letter}"`
  const tip           = signData?.tip           || 'Watch the reference carefully'
  const handShape     = signData?.handShape     || 'See reference shape'
  const commonMistake = signData?.commonMistake || 'Follow the steps carefully'
  const steps         = signData?.steps || [
    'Position your hand clearly in front of the camera',
    instruction,
    tip,
    'Hold steady for half a second',
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4, 4, 16, 0.96)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
        style={{
          background: 'linear-gradient(160deg, #0d0d22 0%, #130a28 100%)',
          border: `1px solid ${color}25`,
          boxShadow: `0 0 60px ${color}15, 0 25px 60px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Ambient glow top */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${color}99` }}>
              How to sign
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span
                className="text-5xl font-black leading-none"
                style={{ color, textShadow: `0 0 30px ${color}60` }}
              >
                {letter}
              </span>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{handShape}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sign.category} · ISL Alphabet</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg font-light"
          >
            ×
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6" style={{ height: 1, background: `${color}20` }} />

        {/* Content */}
        <div className="px-6 py-5 space-y-3">

          {/* Instruction card */}
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: `${color}12`, border: `1px solid ${color}20` }}
          >
            <Hand size={18} className="shrink-0 mt-0.5" style={{ color }} />
            <p className="text-sm leading-relaxed" style={{ color: '#d4cff0' }}>{instruction}</p>
          </div>

          {/* Tip + Mistake row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Tip</span>
              </div>
              <p className="text-xs text-amber-200 leading-relaxed">{tip}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-red-400" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Watch out</span>
              </div>
              <p className="text-xs text-red-200 leading-relaxed">{commonMistake}</p>
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Steps</p>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onStartPractice}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              color: '#0d0d22',
              boxShadow: `0 4px 20px ${color}40`,
            }}
          >
            🎯 Start Practice
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-semibold text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-all border border-white/8"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
