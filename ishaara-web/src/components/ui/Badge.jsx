const variants = {
  success: 'bg-success/10 text-success-light border border-success/20',
  warning: 'bg-warning/10 text-warning-light border border-warning/20',
  error: 'bg-error/10 text-red-400 border border-error/20',
  neutral: 'bg-surface-2/60 text-text-muted border border-border',
  primary: 'bg-primary/15 text-primary-light border border-primary/20',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
