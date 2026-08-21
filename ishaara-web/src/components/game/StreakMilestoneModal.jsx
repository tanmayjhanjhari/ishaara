import { useEffect } from 'react'
import { Button } from '../ui'

export default function StreakMilestoneModal({ streak = 0, milestone, onDismiss }) {
  useEffect(() => {
    // Add overflow hidden to body when open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!milestone) return null

  const colors = ['#f97316', '#eab308', '#3b82f6', '#ec4899', '#22c55e', '#a855f7']
  const confettiList = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: `${Math.random() * 10 + 6}px`,
    duration: `${Math.random() * 2 + 1.5}s`,
  }))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <style>{`
        @keyframes flameBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15) rotate(2deg); }
        }
        .animate-flame-bounce {
          display: inline-block;
          animation: flameBounce 0.6s ease-in-out infinite;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
        }
        .animate-confetti {
          position: absolute;
          top: 0;
          border-radius: 50%;
          pointer-events: none;
          animation: confettiFall linear infinite;
        }
      `}</style>

      {/* Modal Card */}
      <div className="relative bg-gray-900 border border-orange-500/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_20px_50px_rgba(244,117,22,0.15)] overflow-hidden">
        
        {/* Confetti generator */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {confettiList.map((c) => (
            <span
              key={c.id}
              className="animate-confetti"
              style={{
                left: c.left,
                animationDelay: c.delay,
                animationDuration: c.duration,
                backgroundColor: c.color,
                width: c.size,
                height: c.size,
              }}
            />
          ))}
        </div>

        {/* Content wrapper to raise above confetti */}
        <div className="relative z-10">
          {/* Animated Flame */}
          <div className="animate-flame-bounce text-8xl mb-4 select-none">
            🔥
          </div>

          {/* Streak details */}
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-mono tracking-tight leading-none mb-1">
            {streak}
          </div>
          <div className="text-sm font-black text-orange-300 tracking-widest uppercase mb-4">
            Day Streak
          </div>

          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full my-4" />

          {/* Milestone descriptions */}
          <h2 className="text-2xl font-black text-white tracking-tight">
            {milestone.title}
          </h2>
          <p className="text-gray-400 font-medium text-sm mt-2 leading-relaxed">
            {milestone.msg}
          </p>

          {/* Dismiss button */}
          <Button
            onClick={onDismiss}
            variant="primary"
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 border-none font-bold py-3 text-white rounded-xl shadow-lg active:scale-95 transition-all"
          >
            Amazing! Keep Going
          </Button>
        </div>
      </div>
    </div>
  )
}
