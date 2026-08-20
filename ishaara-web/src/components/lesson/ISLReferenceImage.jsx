import { getSignData } from '../../data/islAlphabet'

export default function ISLReferenceImage({ letter, size = 'large' }) {
  const signData = getSignData(letter)
  const isSmall = size === 'small'

  if (!signData) return null

  return (
    <div
      className={`relative rounded-xl bg-gray-950/80 border border-indigo-500/30 flex flex-col items-center justify-center transition-all duration-300 ${
        isSmall ? 'p-3 w-32 h-32' : 'p-6 w-full min-h-[220px]'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(17,12,40,0.9) 0%, rgba(8,5,25,0.95) 100%)',
        boxShadow: isSmall
          ? '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)'
          : '0 8px 32px rgba(99, 102, 241, 0.08), inset 0 1px 1px rgba(255,255,255,0.05)',
      }}
    >
      {/* Top label (only if large) */}
      {!isSmall && (
        <span className="text-[10px] font-black text-indigo-400/70 uppercase tracking-widest mb-1">
          TARGET SIGN
        </span>
      )}

      {/* Decorative SVG grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-xl" />

      {/* Main visual layout */}
      <div className="relative flex flex-col items-center justify-center z-10 w-full">
        {/* Large letter */}
        <span
          className={`font-black tracking-tighter text-indigo-400 select-none ${
            isSmall ? 'text-5xl leading-none' : 'text-8xl md:text-9xl leading-none'
          }`}
          style={{
            textShadow: '0 0 40px rgba(99, 102, 241, 0.4), 0 0 10px rgba(99, 102, 241, 0.2)',
          }}
        >
          {letter}
        </span>

        {/* Static hand outline SVG */}
        {!isSmall && (
          <div className="absolute opacity-[0.06] pointer-events-none transform -translate-y-2">
            <svg
              width="180"
              height="180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-400 animate-pulse"
            >
              <path d="M18 8a3 3 0 0 0-3-3 3 3 0 0 0-3 3v2M14 10.5V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v8" />
              <path d="M10 14.5V9a3 3 0 0 0-3-3 3 3 0 0 0-3 3v8a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-4.5" />
            </svg>
          </div>
        )}

        {/* Handshape description or hint */}
        {!isSmall && signData.handShape && (
          <p className="text-xs font-semibold text-indigo-200/80 text-center mt-3 max-w-[200px] line-clamp-1">
            {signData.handShape}
          </p>
        )}

        {/* Instruction label */}
        {!isSmall && signData.instruction && (
          <p className="text-xs text-gray-400 text-center mt-1 px-4 leading-relaxed line-clamp-2">
            {signData.instruction}
          </p>
        )}

        {/* Tap tutorial to see how label */}
        {!isSmall && (
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-4 animate-bounce">
            ℹ️ Tap Tutorial to see steps
          </span>
        )}
      </div>

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
