import React from 'react'

export default function PathSectionHeader({ section, completedCount, totalCount }) {
  const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="w-full py-6 px-4 text-center">
      <div
        style={{
          background: `linear-gradient(135deg, ${section.color.bg}, rgba(0, 0, 0, 0.4))`,
          borderRadius: 16,
          padding: '16px 24px',
          margin: '0 auto',
          maxWidth: 280,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        className="text-center"
      >
        <div className="text-4xl mb-2">{section.icon}</div>
        <h2 className="text-white text-lg font-black tracking-tight">{section.title}</h2>
        <p className="text-white/70 text-xs mt-1 font-semibold">
          {completedCount} / {totalCount} completed
        </p>
        <div className="bg-white/20 rounded-full h-1.5 mt-3 w-full overflow-hidden">
          <div
            className="bg-white/80 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
