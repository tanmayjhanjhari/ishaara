import React, { useEffect } from 'react'

export default function BadgeNotification({ badge, isVisible, onDismiss }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onDismiss, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible || !badge) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 p-4 rounded-xl border border-primary/30 shadow-2xl animate-toast-in text-left"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.95) 0%, rgba(12, 14, 28, 0.98) 100%)',
        minWidth: '280px',
        maxWidth: '360px'
      }}
    >
      {badge.icon_url ? (
        <img
          src={badge.icon_url}
          alt={badge.name}
          className="w-10 h-10 object-contain shrink-0 animate-bounce"
        />
      ) : (
        <span className="text-3xl shrink-0 animate-bounce">🏆</span>
      )}
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-extrabold text-primary-light font-outfit uppercase tracking-widest">
          Badge Earned!
        </span>
        <span className="text-sm font-black text-white font-outfit mt-0.5">
          {badge.name}
        </span>
        {badge.description && (
          <span className="text-xs text-gray-300 font-medium leading-tight mt-0.5">
            {badge.description}
          </span>
        )}
      </div>
    </div>
  )
}
