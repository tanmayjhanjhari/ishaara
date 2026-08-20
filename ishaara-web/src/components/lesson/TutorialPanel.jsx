import { Hand, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getSignData } from '../../data/islAlphabet'
import { ReferenceHandCanvas } from './SignReference'
import { REFERENCE_LANDMARKS } from '../../data/referenceLandmarks'

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

  // Extract reference hand data for rendering in the tutorial modal
  let leftHand  = null
  let rightHand = null
  let ref = sign.reference_landmarks

  if (!ref) {
    const localRef = REFERENCE_LANDMARKS[letter]
    if (localRef) {
      ref = {
        left_hand: localRef.left_hand,
        right_hand: localRef.right_hand
      }
    }
  }

  if (ref) {
    if (Array.isArray(ref) && ref.length === 21) {
      rightHand = ref
    } else if (ref && typeof ref === 'object') {
      leftHand  = ref.left_hand  || null
      rightHand = ref.right_hand || null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(4, 4, 16, 0.95)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{
          background: 'linear-gradient(160deg, #0d0d22 0%, #130a28 100%)',
          border: `1px solid ${color}25`,
          boxShadow: `0 0 60px ${color}15, 0 25px 60px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Left Column: Hand Shape Canvas & Header */}
        <div className="w-full md:w-60 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/5 relative shrink-0">
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }}
          />
          <div className="w-full text-center md:text-left relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${color}99` }}>
              ISL Sign
            </p>
            <div className="flex md:flex-col items-center md:items-start gap-3 mt-2 justify-center md:justify-start">
              <span
                className="text-6xl font-black leading-none"
                style={{ color, textShadow: `0 0 30px ${color}60` }}
              >
                {letter}
              </span>
              <div className="text-left mt-1">
                <p className="text-sm font-bold text-white leading-tight">{handShape}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sign.category} · Alphabet</p>
              </div>
            </div>
          </div>

          {/* Canvas container */}
          <div className="relative w-44 h-44 bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center my-6 z-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <ReferenceHandCanvas leftHand={leftHand} rightHand={rightHand} color={color} />
          </div>
          
          <p className="hidden md:block text-[10px] text-gray-500 font-semibold text-center mt-2 z-10">
            Target hand shape outline
          </p>
        </div>

        {/* Right Column: Instructions, Tips & Steps */}
        <div className="flex-1 p-6 flex flex-col justify-between relative">
          {/* Close cross in header */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg font-light z-20"
          >
            ×
          </button>

          {/* Content */}
          <div className="space-y-4">
            {/* Instruction card */}
            <div
              className="flex items-start gap-3 rounded-xl p-4 mt-2"
              style={{ background: `${color}12`, border: `1px solid ${color}20` }}
            >
              <Hand size={18} className="shrink-0 mt-0.5" style={{ color }} />
              <p className="text-sm leading-relaxed" style={{ color: '#d4cff0' }}>{instruction}</p>
            </div>

            {/* Tip + Watch out grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="flex gap-3 pt-6">
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
    </div>
  )
}
