import React, { useEffect } from 'react'

export default function StreakNotification({ currentStreak, isVisible, onDismiss }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onDismiss, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border-l-4 border-orange-500 border border-white/5 shadow-2xl animate-toast-in text-left"
      style={{
        background: 'linear-gradient(135deg, rgba(25, 20, 15, 0.95) 0%, rgba(15, 12, 10, 0.98) 100%)',
        minWidth: '260px',
      }}
    >
      <span className="text-3xl shrink-0 animate-pulse">🔥</span>
      <div className="flex flex-col">
        <span className="text-sm font-extrabold text-orange-400 font-outfit uppercase tracking-wider">
          Streak Extended!
        </span>
        <span className="text-xs text-gray-300 font-medium mt-0.5">
          {currentStreak} day streak
        </span>
      </div>
    </div>
  )
}
