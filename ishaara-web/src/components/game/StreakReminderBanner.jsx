import { Flame, ArrowRight } from 'lucide-react'

export default function StreakReminderBanner({ currentStreak = 0, onStartPractice }) {
  if (currentStreak <= 0) return null

  return (
    <div className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-4 sm:px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-orange-500/10 mb-6 select-none animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shadow-inner">
          🔥
        </div>
        <div className="text-sm font-semibold">
          Your <span className="font-extrabold text-white underline decoration-white/40">{currentStreak}-day streak</span> ends at midnight! Practice today to keep it alive.
        </div>
      </div>
      <button
        onClick={onStartPractice}
        className="w-full sm:w-auto px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 active:scale-95 transition-all text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 shrink-0"
      >
        <span>Practice Now</span>
        <ArrowRight size={13} className="stroke-[3px]" />
      </button>
    </div>
  )
}
