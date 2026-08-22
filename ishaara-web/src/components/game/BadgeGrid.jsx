import { useState } from 'react'
import { EmptyState, Divider } from '../ui'
import BadgeCard from './BadgeCard'
import BadgeDetailModal from './BadgeDetailModal'

export default function BadgeGrid({ earned = [], locked = [] }) {
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBadgeClick = (badge, isEarned) => {
    setSelectedBadge({ ...badge, isEarned })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 select-none">
      {/* Earned Badges Section */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
          <span>Earned Badges</span>
          <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-black">
            {earned.length}
          </span>
        </h3>
        
        {earned.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <EmptyState
              title="No Badges Yet"
              description="Complete your first sign attempt to start earning badges!"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {earned.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isEarned={true}
                onClick={() => handleBadgeClick(badge, true)}
              />
            ))}
          </div>
        )}
      </div>

      <Divider className="opacity-10" />

      {/* Locked Badges Section */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
          <span>Locked Badges</span>
          <span className="bg-white/5 text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-black">
            {locked.length}
          </span>
        </h3>
        
        {locked.length === 0 ? (
          <p className="text-sm text-gray-600 font-medium">You've unlocked every single badge! Absolute Legend! 👑</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {locked.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isEarned={false}
                onClick={() => handleBadgeClick(badge, false)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Badge detail modal overlay */}
      <BadgeDetailModal
        badge={selectedBadge}
        isEarned={selectedBadge?.isEarned}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
