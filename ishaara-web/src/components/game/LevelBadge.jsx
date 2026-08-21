export default function LevelBadge({ level = 1, size = 'md' }) {
  // Level Name
  let levelName = 'Beginner'
  if (level >= 6 && level <= 10) levelName = 'Learner'
  else if (level >= 11 && level <= 15) levelName = 'Practitioner'
  else if (level >= 16 && level <= 20) levelName = 'Skilled'
  else if (level >= 21 && level <= 30) levelName = 'Expert'
  else if (level >= 31) levelName = 'Master'

  // Gradient
  let gradientClass = 'from-indigo-500 to-indigo-700'
  if (level >= 11 && level <= 20) gradientClass = 'from-blue-500 to-purple-600'
  else if (level >= 21 && level <= 30) gradientClass = 'from-purple-500 to-pink-600'
  else if (level >= 31) gradientClass = 'from-amber-400 to-yellow-600'

  // Size classes
  let sizeClass = 'w-8 h-8 text-sm'
  if (size === 'sm') sizeClass = 'w-6 h-6 text-xs'
  else if (size === 'lg') sizeClass = 'w-12 h-12 text-base font-black'

  return (
    <div
      className={`relative group flex items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} text-white font-black shadow-md shrink-0 cursor-pointer ${sizeClass}`}
      title={`Level ${level} — ${levelName}`}
    >
      <span>{level}</span>
      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 bg-gray-900 border border-white/10 text-white text-[11px] font-bold py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
        Level {level} — {levelName}
      </div>
    </div>
  )
}
