import { useEffect } from 'react'
import { X } from 'lucide-react'

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
      className="fixed bottom-6 right-6 z-[100] bg-indigo-950 border border-indigo-500/50 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] p-4 min-w-[280px] max-w-sm select-none text-left"
      style={{
        animation: 'slideInRight 0.3s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrinkWidth 4s linear forwards;
        }
      `}</style>

      {/* Top row */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
          BADGE EARNED
        </span>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} className="stroke-[2.5px]" />
        </button>
      </div>

      {/* Content row */}
      <div className="flex items-center gap-3.5">
        <div className="text-4xl shrink-0 animate-bounce select-none">
          {badge.icon || badge.icon_url || '🏆'}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-white leading-tight">
            {badge.name}
          </span>
          <span className="text-[11px] text-gray-400 font-semibold leading-normal mt-0.5">
            {badge.description}
          </span>
        </div>
      </div>

      {/* Progress countdown indicator */}
      <div className="w-full h-0.5 bg-indigo-500/10 rounded-full overflow-hidden mt-3.5">
        <div className="h-full bg-indigo-500/60 rounded-full animate-shrink" />
      </div>
    </div>
  )
}
