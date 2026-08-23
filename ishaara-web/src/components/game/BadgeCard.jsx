import { memo } from 'react'
import { Card } from '../ui'

const formatDate = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const BadgeCard = memo(function BadgeCard({ badge, isEarned = true, onClick }) {
  if (isEarned) {
    return (
      <div className="cursor-pointer group" onClick={onClick}>
        <Card
          className="bg-gray-800/80 border-indigo-500/40 hover:border-indigo-400 hover:scale-[1.03] transition-all duration-300 p-4 text-center flex flex-col items-center justify-center relative overflow-hidden"
          style={{ boxShadow: '0 0 15px rgba(79, 70, 229, 0.15)' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300 select-none">
            {badge.icon || '🏆'}
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight mt-1">
            {badge.name}
          </h4>
          <span className="text-[10px] font-semibold text-indigo-300 mt-1 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-full">
            Earned {formatDate(badge.earned_at)}
          </span>
        </Card>
      </div>
    )
  }

  return (
    <Card className="bg-gray-900/60 border-white/5 opacity-75 p-4 text-center flex flex-col items-center justify-center select-none relative">
      <div className="text-4xl mb-2 filter grayscale opacity-40">
        {badge.icon || '🏆'}
      </div>
      <h4 className="text-sm font-semibold text-gray-500 tracking-tight">
        {badge.name}
      </h4>
      
      {/* Progress Bar */}
      <div className="w-full mt-3">
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${badge.progress_percent || 0}%` }}
          />
        </div>
        <div className="text-[10px] text-gray-500 font-bold font-mono mt-1">
          {badge.user_progress || 0} / {badge.condition_value}
        </div>
      </div>
    </Card>
  )
})

export default BadgeCard
