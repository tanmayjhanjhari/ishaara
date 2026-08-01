import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="mb-4 text-text-dim opacity-50 bg-surface-2 p-4 rounded-full border border-border">
          {typeof Icon === 'function' ? <Icon size={48} /> : Icon}
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          {title}
        </h3>
      )}
      
      {subtitle && (
        <p className="text-sm text-text-muted max-w-sm mb-6">
          {subtitle}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
