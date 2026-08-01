import Spinner from './Spinner'

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-space disabled:opacity-50 disabled:cursor-not-allowed select-none'

const variants = {
  primary: 'bg-primary/90 text-text-primary hover:bg-primary hover:shadow-[0_0_24px_rgba(124,58,237,0.25)] border border-white/5',
  secondary: 'bg-surface-2/40 text-primary-light border border-primary/30 hover:bg-surface-2 hover:border-primary/50',
  ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-2/60 border border-transparent',
  danger: 'bg-error/15 text-error hover:bg-error/25 border border-error/20',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner size="sm" color="currentColor" /> : children}
    </button>
  )
}
