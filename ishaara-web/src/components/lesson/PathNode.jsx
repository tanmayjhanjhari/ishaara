import React from 'react'

export default function PathNode({ lesson, status, index, onClick }) {
  // Style config based on status
  let nodeStyle = {}
  let iconColor = 'text-gray-400'
  let labelColor = 'text-gray-400'
  let xpColor = 'text-gray-500'

  if (status === 'completed') {
    nodeStyle = {
      backgroundColor: '#6d28d9', // Vibrant purple
      border: '4px solid #c084fc', // Light purple glow border
      boxShadow: '0 0 20px rgba(109, 40, 217, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
    }
    iconColor = 'text-white'
    labelColor = 'text-purple-300 font-bold'
    xpColor = 'text-purple-400'
  } else if (status === 'active') {
    nodeStyle = {
      backgroundColor: '#064e3b', // Deep green
      border: '4px solid #10b981', // Neon green ring
      boxShadow: '0 0 25px rgba(16, 185, 129, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
      animation: 'pathPulse 2s infinite',
    }
    iconColor = 'text-emerald-400 font-black'
    labelColor = 'text-emerald-400 font-extrabold'
    xpColor = 'text-emerald-500'
  } else if (status === 'available') {
    nodeStyle = {
      backgroundColor: '#1f2937',
      border: '4px solid #6b7280',
      boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.05)',
    }
    iconColor = 'text-gray-300'
    labelColor = 'text-gray-300 font-semibold'
    xpColor = 'text-gray-500'
  } else {
    // locked
    nodeStyle = {
      backgroundColor: '#111827',
      border: '4px solid #1f2937',
      opacity: 0.4,
    }
    iconColor = 'text-gray-600'
    labelColor = 'text-gray-600 font-medium'
    xpColor = 'text-gray-700'
  }

  const renderIcon = () => {
    if (status === 'completed') {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (status === 'active') {
      return (
        <svg className="w-7 h-7 text-emerald-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }
    if (status === 'locked') {
      return (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
    // Available
    return (
      <span className={`text-xl font-black ${iconColor}`}>
        {lesson.title ? lesson.title.charAt(0) : index + 1}
      </span>
    )
  }

  return (
    <div
      className="flex flex-col items-center relative path-node-enter"
      style={{
        animationDelay: `${index * 60}ms`,
        opacity: status === 'locked' ? 0.55 : 1,
      }}
    >
      {/* Node circle button */}
      <button
        onClick={onClick}
        style={nodeStyle}
        className="w-[72px] h-[72px] rounded-full cursor-pointer relative flex items-center justify-center transition-all hover:scale-110 active:scale-90 focus:outline-none z-10"
        title={status === 'locked' ? `Reach Level ${lesson.required_level} to unlock` : undefined}
      >
        {renderIcon()}
      </button>

      {/* Label and XP */}
      <div className="text-center mt-3 flex flex-col items-center max-w-[125px] z-10">
        <span className={`text-[12px] text-center line-clamp-2 leading-snug tracking-wide ${labelColor}`}>
          {lesson.title}
        </span>
        {status === 'active' && (
          <span className="mt-1 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest animate-pulse border border-emerald-400">
            CONTINUE
          </span>
        )}
        <span className={`text-[10px] mt-1 flex items-center gap-0.5 font-bold ${xpColor}`}>
          ⚡ {lesson.xp_reward || 0} XP
        </span>
      </div>
    </div>
  )
}
