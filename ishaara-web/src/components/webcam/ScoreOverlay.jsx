import React, { useState, useEffect } from 'react'

export default function ScoreOverlay({ score = 0, rating, xpEarned = 0, isVisible, onDismiss }) {
  const [count, setCount] = useState(0)

  // Count up animation when visible
  useEffect(() => {
    if (!isVisible) {
      setCount(0)
      return
    }

    if (score <= 0) {
      setCount(0)
      return
    }

    const duration = 300 // ms
    const stepTime = Math.max(Math.floor(duration / score), 8)
    let start = 0
    const timer = setInterval(() => {
      start += 1
      if (start >= score) {
        setCount(score)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isVisible, score])

  // Automatic dismiss only on failure to allow seamless retrying
  useEffect(() => {
    if (isVisible) {
      const isSuccess = rating?.key !== 'fail'
      if (!isSuccess) {
        const timer = setTimeout(() => {
          onDismiss()
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, onDismiss, rating])

  if (!isVisible) return null

  // Get color and label defaults
  const ratingColor = rating?.color || '#ef4444'
  const ratingLabel = rating?.label || 'Try Again'
  const isSuccess = rating?.key !== 'fail'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
      <div
        className="relative overflow-hidden rounded-3xl border p-8 max-w-xs w-full text-center mx-4"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(10, 10, 20, 0.95) 100%)',
          borderColor: 'rgba(167, 139, 250, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(167, 139, 250, 0.1)',
          animation: 'scoreCardIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full filter blur-3xl opacity-20"
          style={{ backgroundColor: ratingColor }}
        />

        {/* Rating Title */}
        <h2
          className="text-3xl font-extrabold font-outfit uppercase tracking-wider mb-2 animate-fade-in-up"
          style={{
            color: ratingColor,
            textShadow: `0 0 20px ${ratingColor}40`,
            animationDelay: '100ms'
          }}
        >
          {ratingLabel}
        </h2>

        {/* Score Circle */}
        <div className="relative my-6 mx-auto flex items-center justify-center w-28 h-28 rounded-full border-4 shadow-inner"
             style={{ borderColor: ratingColor, boxShadow: `inset 0 0 15px ${ratingColor}20` }}>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-white font-outfit">
              {count}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              match
            </span>
          </div>
        </div>

        {/* XP Reward badge */}
        <div className="mb-6">
          {xpEarned > 0 ? (
            <div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-primary/20 text-primary-light border border-primary/30 shadow-md"
              style={{
                animation: 'slideUp 0.25s ease-out forwards',
                animationDelay: '200ms',
                opacity: 0,
              }}
            >
              <span className="animate-pulse">✨</span>
              <span>+{xpEarned} XP Earned</span>
            </div>
          ) : (
            <div className="text-xs text-text-muted tracking-wide animate-pulse">
              Keep trying to earn XP!
            </div>
          )}
        </div>

        {/* Interactive action buttons */}
        {isSuccess ? (
          <button
            onClick={onDismiss}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${ratingColor}, #06b6d4)`,
              boxShadow: `0 8px 20px ${ratingColor}40`,
            }}
          >
            Next Sign →
          </button>
        ) : (
          <button
            onClick={onDismiss}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-text-muted bg-white/5 border border-white/10 hover:bg-white/10 hover:text-text-primary transition-all duration-200 cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
