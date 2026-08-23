import { useState } from 'react'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

const colors = [
  'bg-primary/15 text-primary-light border-primary/20',
  'bg-success/15 text-success-light border-success/20',
  'bg-warning/15 text-warning-light border-warning/20',
  'bg-error/15 text-red-400 border-error/20',
  'bg-cyan/15 text-cyan-light border-cyan/20',
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
]

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (!parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getColorIndex(name = '') {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return sum % colors.length
}

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [error, setError] = useState(false)
  const isImageValid = src && !error

  const baseClasses = `inline-flex items-center justify-center rounded-full flex-shrink-0 border font-bold ${sizes[size]} ${className}`

  if (isImageValid) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        loading="lazy"
        className={`${baseClasses} object-cover border-border`}
        onError={() => setError(true)}
      />
    )
  }

  const initials = getInitials(name)
  const colorClass = colors[getColorIndex(name)]

  return (
    <div className={`${baseClasses} ${colorClass}`}>
      {initials}
    </div>
  )
}
