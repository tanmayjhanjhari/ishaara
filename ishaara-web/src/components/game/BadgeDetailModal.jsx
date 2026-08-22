import { Modal, ProgressBar } from '../ui'

const formatDate = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getConditionText = (badge) => {
  const n = badge.condition_value
  switch (badge.condition_type) {
    case 'attempt_count':
      return `Complete ${n} sign attempt${n > 1 ? 's' : ''}`
    case 'lesson_count':
      return `Complete ${n} lesson${n > 1 ? 's' : ''}`
    case 'streak_days':
      return `Maintain a ${n}-day streak`
    case 'xp_total':
      return `Earn ${n.toLocaleString()} total XP`
    default:
      return ''
  }
}

export default function BadgeDetailModal({ badge, isEarned = true, isOpen, onClose }) {
  if (!badge) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="" showCloseButton={true}>
      <div className="flex flex-col items-center justify-center py-4">
        {isEarned ? (
          <>
            <div className="text-7xl mb-4 select-none animate-bounce">
              {badge.icon || '🏆'}
            </div>
            <h3 className="text-xl font-bold text-white text-center mt-2">
              {badge.name}
            </h3>
            <p className="text-gray-400 text-center text-sm mt-2 max-w-[240px]">
              {badge.description}
            </p>
            
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold px-4 py-1.5 mt-4 flex items-center gap-1.5 shadow-sm">
              <span>✓</span>
              <span>Earned on {formatDate(badge.earned_at)}</span>
            </div>

            <div className="text-xs text-gray-500 font-semibold mt-6 text-center bg-white/5 border border-white/5 py-2 px-4 rounded-xl w-full">
              <span className="text-gray-600 uppercase block text-[9px] font-black tracking-widest mb-0.5">Awarded For</span>
              <span className="text-gray-400">{getConditionText(badge)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-7xl mb-4 select-none filter grayscale opacity-30">
              {badge.icon || '🏆'}
            </div>
            <h3 className="text-xl font-bold text-gray-400 text-center mt-2">
              {badge.name}
            </h3>
            <p className="text-gray-500 text-center text-sm mt-2 max-w-[240px]">
              {badge.description}
            </p>

            <div className="w-full mt-6 bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold font-mono text-gray-400">
                <span>Progress</span>
                <span>{badge.user_progress || 0} / {badge.condition_value}</span>
              </div>
              <ProgressBar value={badge.progress_percent || 0} color="primary" />
              <div className="text-center text-xs font-semibold text-gray-500 mt-1">
                {badge.condition_value - (badge.user_progress || 0)} more to unlock
              </div>
            </div>

            <div className="text-xs text-gray-500 font-semibold mt-6 text-center bg-white/5 border border-white/5 py-2 px-4 rounded-xl w-full">
              <span className="text-gray-600 uppercase block text-[9px] font-black tracking-widest mb-0.5">Target Requirement</span>
              <span className="text-gray-500">{getConditionText(badge)}</span>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
