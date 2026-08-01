const variants = {
  default: 'bg-surface/80 backdrop-blur-md border border-white/5',
  elevated: 'bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10',
  flat: 'bg-void border border-transparent',
}

const paddings = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  none: '',
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  className = '',
}) {
  const isInteractive = onClick || hover
  const hoverClasses = isInteractive
    ? 'cursor-pointer hover:shadow-card-hover hover:border-border-bright transition-all duration-300 transform hover:-translate-y-0.5'
    : ''

  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  )
}
