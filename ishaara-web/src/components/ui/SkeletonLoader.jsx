export default function SkeletonLoader({
  variant = 'line',
  width,
  height,
  size = 'md',
  className = '',
}) {
  const baseClasses = 'bg-surface-2 animate-pulse rounded'
  
  if (variant === 'circle') {
    const sizeMap = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-20 h-20',
    }
    return <div className={`${baseClasses} rounded-full ${sizeMap[size]} ${className}`} />
  }
  
  if (variant === 'rectangle') {
    return <div className={`${baseClasses} rounded-lg ${width || 'w-full'} ${height || 'h-32'} ${className}`} />
  }
  
  // Line
  return <div className={`${baseClasses} rounded-full ${width || 'w-full'} h-4 ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface border border-border p-4 rounded-xl flex flex-col gap-4 ${className}`}>
      <SkeletonLoader variant="rectangle" height="h-32" />
      <div className="flex flex-col gap-2">
        <SkeletonLoader variant="line" width="w-3/4" />
        <SkeletonLoader variant="line" width="w-full" />
        <SkeletonLoader variant="line" width="w-1/2" />
      </div>
    </div>
  )
}
