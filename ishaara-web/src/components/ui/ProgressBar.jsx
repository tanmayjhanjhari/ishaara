const sizes = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colors = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
}

export default function ProgressBar({
  value = 0,
  color = 'primary',
  size = 'md',
  label,
  showPercentage = false,
  animated = false,
  className = '',
}) {
  const clampedValue = Math.min(100, Math.max(0, value))
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-text-muted">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      
      <div className={`w-full bg-surface-2 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden ${colors[color]}`}
          style={{ width: `${clampedValue}%` }}
        >
          {animated && (
            <div className="absolute inset-0 w-full h-full shimmer-bg opacity-50" />
          )}
        </div>
      </div>
    </div>
  )
}
