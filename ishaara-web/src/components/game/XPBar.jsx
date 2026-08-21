import { useEffect, useRef, useState } from 'react'

export default function XPBar({ xp = 0, level = 1, nextLevelXP = 100, prevLevelXP = 0, animated = true }) {
  const prevLevelRef = useRef(level)
  const [displayLevel, setDisplayLevel] = useState(level)
  const [showBurst, setShowBurst] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [disableTransition, setDisableTransition] = useState(false)

  // Calculations
  const xpIntoLevel = xp - prevLevelXP
  const xpNeeded    = nextLevelXP - prevLevelXP
  const fraction    = xpNeeded > 0 ? Math.max(0, Math.min(1, xpIntoLevel / xpNeeded)) : 1
  const percentage  = Math.round(fraction * 100)

  const [displayPercent, setDisplayPercent] = useState(percentage)

  useEffect(() => {
    if (level > prevLevelRef.current) {
      // 1. Animate fill to 100%
      setDisplayPercent(100)

      // 2. After 600ms: add flash effect (brightness pulse) and show burst
      const flashTimeout = setTimeout(() => {
        setIsFlashing(true)
        setShowBurst(true)
      }, 600)

      // 3. After 900ms: reset fill to 0%, then animate to new fraction
      const resetTimeout = setTimeout(() => {
        setIsFlashing(false)
        setDisplayLevel(level)
        setDisableTransition(true)
        setDisplayPercent(0)

        setTimeout(() => {
          setDisableTransition(false)
          setDisplayPercent(percentage)
        }, 50)
      }, 900)

      // 4. Hide level-up burst after 2 seconds
      const burstTimeout = setTimeout(() => {
        setShowBurst(false)
      }, 2000)

      return () => {
        clearTimeout(flashTimeout)
        clearTimeout(resetTimeout)
        clearTimeout(burstTimeout)
      }
    } else {
      setDisplayLevel(level)
      setDisplayPercent(percentage)
    }
    prevLevelRef.current = level
  }, [level, xp, nextLevelXP, prevLevelXP, percentage])

  return (
    <div className="relative w-full">
      <style>{`
        @keyframes levelBurst {
          0% { transform: translate(-50%, -100%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -120%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -100%) scale(1); opacity: 0; }
        }
        .animate-level-burst {
          animation: levelBurst 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes pulseBrightness {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.8) drop-shadow(0 0 8px rgba(124, 58, 237, 0.8)); }
        }
        .animate-flash-fill {
          animation: pulseBrightness 0.4s ease-in-out infinite;
        }
      `}</style>

      {/* Level-up burst */}
      {showBurst && (
        <div className="absolute left-1/2 top-0 animate-level-burst text-lg font-black text-amber-400 select-none z-30 pointer-events-none whitespace-nowrap">
          LEVEL UP! ✦
        </div>
      )}

      {/* Top row */}
      <div className="flex justify-between mb-1 items-center">
        <span className="text-sm font-bold text-indigo-400">
          Level {displayLevel}
        </span>
        <span className="text-xs text-gray-400">
          {xpNeeded > 0 ? `${xp - prevLevelXP} / ${xpNeeded} XP` : 'Max Level'}
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 ${
            isFlashing ? 'animate-flash-fill' : ''
          }`}
          style={{
            width: `${displayPercent}%`,
            transition: disableTransition ? 'none' : 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  )
}
