import React from 'react'

export default function PathNode({ lesson, status, index, sectionColor, onClick }) {
  const isFirst = index === 0

  // Style objects based on status
  const bgStyle = status === 'completed'
    ? {
        backgroundColor: sectionColor.bg,
        border: `3px solid ${sectionColor.ring}`,
        boxShadow: `0 4px 14px ${sectionColor.bg}60`,
      }
    : status === 'active'
    ? {
        backgroundColor: sectionColor.bg,
        border: `3px solid ${sectionColor.ring}`,
        animation: 'pathPulse 2s infinite',
      }
    : status === 'available'
    ? {
        backgroundColor: '#1f2937',
        border: `3px solid ${sectionColor.bg}`,
      }
    : {
        backgroundColor: '#111827',
        border: '3px solid #374151',
        opacity: 0.5,
      }

  const renderIcon = () => {
    if (status === 'completed') {
      return <span className="text-white text-2xl font-black">✓</span>
    }
    if (status === 'active') {
      return <span className="text-white text-xl">⭐</span>
    }
    if (status === 'locked') {
      return <span className="text-gray-600">🔒</span>
    }
    // Available: first letter of lesson title or index + 1
    return (
      <span className="text-gray-300 text-lg font-bold">
        {lesson.title ? lesson.title.charAt(0) : index + 1}
      </span>
    )
  }

  return (
    <div
      className="flex flex-col items-center relative path-node-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Connection line */}
      {!isFirst && (
        <div
          style={{
            width: 3,
            height: 40,
            background: status === 'completed' ? sectionColor.bg : '#374151',
            margin: '0 auto',
          }}
        />
      )}

      {/* Node circle */}
      <button
        onClick={onClick}
        style={bgStyle}
        className="w-16 h-16 rounded-full cursor-pointer relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        title={status === 'locked' ? `Reach Level ${lesson.required_level} to unlock` : undefined}
      >
        {renderIcon()}
      </button>

      {/* Label */}
      <div className="text-center mt-2 flex flex-col items-center max-w-28">
        <span className="text-xs font-semibold text-gray-300 text-center line-clamp-2 max-w-[80px]">
          {lesson.title}
        </span>
        {status === 'active' && (
          <span className="mt-1 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider animate-pulse">
            CONTINUE
          </span>
        )}
        <span className="text-[10px] text-gray-500 mt-1">
          ⚡ {lesson.xp_reward || 0} XP
        </span>
      </div>
    </div>
  )
}
