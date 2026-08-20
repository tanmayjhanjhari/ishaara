import React from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 140 // ~879.64

export function updateRing(ringRef, progress, isComplete) {
  const offset = CIRCUMFERENCE * (1 - progress / 100)
  if (ringRef.current) {
    ringRef.current.style.strokeDashoffset = offset
    ringRef.current.style.stroke = isComplete ? '#10b981' : '#4f46e5'

    // Control visibility of the hold ring wrapper container via class list
    const container = ringRef.current.closest('.hold-ring-container')
    if (container) {
      if (progress > 0) {
        container.classList.remove('opacity-0')
        container.classList.add('opacity-100')
      } else {
        container.classList.remove('opacity-100')
        container.classList.add('opacity-0')
      }
    }
  }
}

export default function HoldRing({ ringRef }) {
  return (
    <div className="hold-ring-container absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 opacity-0 z-10 flex items-center justify-center">
      <svg className="w-[300px] h-[300px]" viewBox="0 0 300 300" fill="none">
        {/* Background ring */}
        <circle
          cx="150"
          cy="150"
          r="140"
          stroke="#e5e7eb"
          strokeWidth="3"
          className="opacity-30"
        />
        {/* Progress ring */}
        <circle
          ref={ringRef}
          cx="150"
          cy="150"
          r="140"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          transform="rotate(-90 150 150)"
          style={{ transition: 'stroke 0.2s, stroke-dashoffset 0.1s ease-out' }}
        />
      </svg>
    </div>
  )
}
