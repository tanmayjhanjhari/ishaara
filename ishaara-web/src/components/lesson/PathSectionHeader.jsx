import React from 'react'

export default function PathSectionHeader({ section, completedCount, totalCount }) {
  const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="w-full py-6 px-4">
      <div 
        className="w-full max-w-[360px] mx-auto p-[1px] rounded-2xl bg-gradient-to-br from-white/15 to-white/5 shadow-2xl relative group overflow-hidden"
        style={{
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Soft background ambient glow matching section color */}
        <div 
          className="absolute -inset-10 opacity-10 blur-xl pointer-events-none rounded-full transition-opacity group-hover:opacity-20"
          style={{
            background: `radial-gradient(circle, ${section.color.ring} 0%, transparent 70%)`
          }}
        />

        <div className="bg-[#0d0f21]/90 backdrop-blur-xl rounded-[15px] p-5 flex items-center gap-4 relative z-10 border border-white/5">
          {/* Section Icon with theme background glow */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl relative overflow-hidden flex-shrink-0"
            style={{
              background: `radial-gradient(circle, ${section.color.bg}40 0%, rgba(13, 15, 33, 0.6) 100%)`,
              border: `1.5px solid ${section.color.ring}40`
            }}
          >
            <span className="relative z-10">{section.icon}</span>
          </div>

          {/* Section Info & Progress */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-[15px] font-extrabold tracking-wide uppercase truncate">
              {section.title}
            </h2>
            
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5 font-bold">
              <span>PROGRESS</span>
              <span className="text-[10px] font-black text-gray-200 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {completedCount}/{totalCount} Completed
              </span>
            </div>

            {/* Glowing Progress Bar */}
            <div className="bg-slate-950/80 rounded-full h-2 mt-2 w-full p-[1px] border border-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${section.color.bg}, ${section.color.ring})`,
                  boxShadow: `0 0 10px ${section.color.ring}80`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
