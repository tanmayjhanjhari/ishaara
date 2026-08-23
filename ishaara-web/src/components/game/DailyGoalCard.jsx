import { Card } from '../ui'

export default function DailyGoalCard({ attemptsToday = 0, goalCount = 10 }) {
  const r = 32
  const strokeWidth = 6
  const center = 40
  const circumference = 2 * Math.PI * r
  const progress = Math.min(1, attemptsToday / goalCount)
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-gray-900/40 border border-gray-800/80">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
          <span className="text-sm font-semibold text-gray-300">Daily Goal</span>
        </div>

        <div className="relative flex items-center justify-center my-4 select-none">
          <svg width="88" height="88" viewBox="0 0 80 80" className="transform -rotate-90">
            {/* Outer track */}
            <circle
              cx={center}
              cy={center}
              r={r}
              className="stroke-gray-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Inner progress fill */}
            <circle
              cx={center}
              cy={center}
              r={r}
              className="stroke-indigo-500 transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-white font-mono leading-none">
              {attemptsToday}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 font-mono">
              /{goalCount}
            </span>
          </div>
        </div>

        <div className="text-center mt-3 font-semibold select-none">
          {attemptsToday >= goalCount ? (
            <span className="text-sm text-green-400 flex items-center justify-center gap-1">
              Goal reached! 🎉
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              {goalCount - attemptsToday} more signs to go
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
