import { Flame, Trophy, Calendar } from 'lucide-react'

export default function StreakCard({ currentStreak = 0, longestStreak = 0, lastActiveDate = null, compact = false }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const isStreakDay = lastActiveDate === todayStr

  // Heuristic for active days
  const isActiveDay = (dateStr) => {
    if (!lastActiveDate || currentStreak <= 0) return false
    const dayTime = new Date(dateStr).getTime()
    const activeTime = new Date(lastActiveDate).getTime()
    const diffDays = Math.round((activeTime - dayTime) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays < currentStreak
  }

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const getDayLabel = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    return days[date.getDay()]
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-orange-950/20 text-orange-400 border border-orange-500/20 select-none">
        <Flame size={13} className="fill-orange-400 animate-pulse" />
        <span>{currentStreak} day streak</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
          <Flame size={16} className="fill-orange-500/20" />
        </div>
        <span className="text-sm font-bold text-gray-400">Daily Streak</span>
      </div>

      {/* Large Streak Number */}
      <div className="mb-6 flex flex-col items-center justify-center py-2">
        {currentStreak > 0 ? (
          <>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-mono tracking-tight animate-bounce">
              {currentStreak}
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              days active
            </span>
          </>
        ) : (
          <>
            <span className="text-5xl font-black text-gray-600 font-mono tracking-tight">
              0
            </span>
            <span className="text-xs font-bold text-gray-400 mt-2 text-center max-w-[180px]">
              Start your streak today!
            </span>
          </>
        )}
      </div>

      {/* 7-day calendar row */}
      <div className="mb-6 bg-white/5 border border-white/5 rounded-xl p-3.5">
        <div className="flex justify-between items-center gap-2">
          {last7.map((dateStr) => {
            const active = isActiveDay(dateStr)
            const isToday = dateStr === todayStr
            return (
              <div key={dateStr} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                    active
                      ? `${
                          isToday ? 'ring-2 ring-orange-300 scale-110' : ''
                        } bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20`
                      : 'bg-gray-800 text-gray-500 border border-white/5'
                  }`}
                >
                  {active ? '🔥' : getDayLabel(dateStr)}
                </div>
                <span className="text-[9px] font-black text-gray-500 uppercase">
                  {getDayLabel(dateStr)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats row below calendar */}
      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs font-semibold text-gray-400">
        <div className="flex items-center gap-1.5">
          <Trophy size={13} className="text-amber-400" />
          <span>Best: <strong className="text-white">{longestStreak}</strong></span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <Calendar size={13} className="text-indigo-400" />
          <span>
            Today:{' '}
            <strong className={isStreakDay ? 'text-amber-400' : 'text-gray-500'}>
              {isStreakDay ? '✓ Done' : 'Not yet'}
            </strong>
          </span>
        </div>
      </div>

      {/* Bottom Banner */}
      {isStreakDay ? (
        <div className="bg-green-950/30 border border-green-500/10 text-green-400 p-2.5 rounded-xl text-xs font-semibold text-center mt-4">
          ✓ Streak maintained today!
        </div>
      ) : (
        <div className="bg-orange-950/20 border border-orange-500/10 text-orange-300 p-2.5 rounded-xl text-xs font-semibold text-center mt-4 animate-pulse">
          🔥 Practice today to keep your streak!
        </div>
      )}
    </div>
  )
}
