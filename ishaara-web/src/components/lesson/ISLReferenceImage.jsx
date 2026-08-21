import { getSignData } from '../../data/islAlphabet'
import { ReferenceHandCanvas } from './SignReference'
import { REFERENCE_LANDMARKS } from '../../data/referenceLandmarks'
import { getVariantLandmarks } from '../../cv/scoring'

const LETTER_COLORS = [
  '#A78BFA', '#67E8F9', '#6EE7B7', '#FCD34D', '#F9A8D4',
  '#C4B5FD', '#7DD3FC', '#86EFAC', '#FDE68A', '#FDA4AF',
]

function getLetterColor(letter) {
  const idx = (letter?.toUpperCase()?.charCodeAt(0) || 65) - 65
  return LETTER_COLORS[idx % LETTER_COLORS.length]
}

export default function ISLReferenceImage({ letter, size = 'large', activeVariant = 'two' }) {
  const signData = getSignData(letter)
  const isSmall = size === 'small'

  if (!signData) return null

  const color = getLetterColor(letter)

  // Extract reference hand data (with dynamic variant support)
  let leftHand = null
  let rightHand = null
  let ref = null

  if (letter === 'I' || letter === 'U' || letter === 'Z') {
    ref = getVariantLandmarks(letter, activeVariant)
  } else {
    ref = REFERENCE_LANDMARKS[letter]
  }

  if (ref) {
    leftHand = ref.left_hand || null
    rightHand = ref.right_hand || null
  }

  if (isSmall) {
    return (
      <div
        className="relative rounded-xl flex items-center justify-center p-2 w-32 h-32 overflow-hidden border border-indigo-500/30"
        style={{
          background: 'linear-gradient(135deg, rgba(17,12,40,0.9) 0%, rgba(8,5,25,0.95) 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)'
        }}
      >
        {/* Decorative SVG grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none rounded-xl" />

        {/* Small corner brackets for high-tech aesthetic */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
          const isTop = pos.includes('top')
          const isLeft = pos.includes('left')
          return (
            <div
              key={pos}
              className="absolute w-2 h-2 pointer-events-none z-20"
              style={{
                top: isTop ? 4 : 'auto',
                bottom: !isTop ? 4 : 'auto',
                left: isLeft ? 4 : 'auto',
                right: !isLeft ? 4 : 'auto',
                borderTop: isTop ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
                borderBottom: !isTop ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
                borderLeft: isLeft ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
                borderRight: !isLeft ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
              }}
            />
          )
        })}

        {/* Dynamic target handshape skeleton */}
        {ref ? (
          <ReferenceHandCanvas leftHand={leftHand} rightHand={rightHand} color={color} size={105} />
        ) : (
          <span className="font-black text-5xl text-indigo-400 select-none">{letter}</span>
        )}

        {/* Small letter badge in top right corner */}
        <div className="absolute top-1.5 right-1.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-md px-1.5 py-0.5 border border-indigo-500/30 z-20 shadow-sm">
          {letter}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl border border-indigo-500/30 flex flex-col items-center justify-center transition-all duration-300 p-5 w-full min-h-[220px]"
      style={{
        background: 'linear-gradient(135deg, rgba(17,12,40,0.9) 0%, rgba(8,5,25,0.95) 100%)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08), inset 0 1px 1px rgba(255,255,255,0.05)',
      }}
    >
      {/* Top label */}
      <span className="text-[10px] font-black text-indigo-400/70 uppercase tracking-widest mb-3 z-20">
        TARGET SIGN
      </span>

      {/* Decorative SVG grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-xl" />

      {/* Main visual layout: Side-by-side or stacked grid depending on space */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 z-10 w-full px-4">
        {/* Left column: giant letter */}
        <div className="flex flex-col items-center justify-center">
          <span
            className="font-black tracking-tighter text-indigo-400 select-none text-8xl md:text-9xl leading-none"
            style={{
              textShadow: '0 0 40px rgba(99, 102, 241, 0.4), 0 0 10px rgba(99, 102, 241, 0.2)',
            }}
          >
            {letter}
          </span>
          {signData.handShape && (
            <p className="text-xs font-semibold text-indigo-200/80 text-center mt-2 max-w-[200px]">
              {signData.handShape}
            </p>
          )}
        </div>

        {/* Right column: Target handshape skeleton */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest">
            HOLOGRAPHIC REFERENCE
          </span>
          <ReferenceHandCanvas leftHand={leftHand} rightHand={rightHand} color={color} size={130} />
        </div>
      </div>

      {/* Instruction label */}
      {signData.instruction && (
        <p className="text-xs text-gray-400 text-center mt-4 px-6 leading-relaxed line-clamp-2 max-w-lg z-20">
          {signData.instruction}
        </p>
      )}

      {/* Tap tutorial to see steps */}
      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3 animate-bounce z-20">
        ℹ️ Tap Tutorial to see steps
      </span>

      {/* Small corner brackets for high-tech aesthetic */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
        const isTop = pos.includes('top')
        const isLeft = pos.includes('left')
        return (
          <div
            key={pos}
            className="absolute w-3 h-3 pointer-events-none"
            style={{
              top: isTop ? 6 : 'auto',
              bottom: !isTop ? 6 : 'auto',
              left: isLeft ? 6 : 'auto',
              right: !isLeft ? 6 : 'auto',
              borderTop: isTop ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
              borderBottom: !isTop ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
              borderLeft: isLeft ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
              borderRight: !isLeft ? '1.5px solid rgba(99, 102, 241, 0.4)' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
