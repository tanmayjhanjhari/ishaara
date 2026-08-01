import Card from './Card'
import SkeletonLoader from './SkeletonLoader'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export default function StatTile({
  label,
  value,
  icon: Icon,
  trend, // 'up' | 'down' | 'neutral'
  trendValue,
  loading = false,
  className = '',
}) {
  if (loading) {
    return (
      <Card className={`flex flex-col gap-3 ${className}`}>
        <div className="flex justify-between items-center">
          <SkeletonLoader variant="line" width="w-24" />
          <SkeletonLoader variant="circle" size="md" />
        </div>
        <SkeletonLoader variant="line" className="h-8 w-20" />
        <SkeletonLoader variant="line" width="w-16" />
      </Card>
    )
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {Icon && <Icon size={20} className="text-text-dim" />}
      </div>
      
      <div className="text-2xl font-bold text-text-primary font-mono mb-2">
        {value}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium">
          {trend === 'up' && (
            <>
              <ArrowUpRight size={14} className="text-success" />
              <span className="text-success">{trendValue}</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <ArrowDownRight size={14} className="text-error" />
              <span className="text-error">{trendValue}</span>
            </>
          )}
          {trend === 'neutral' && (
            <>
              <Minus size={14} className="text-text-dim" />
              <span className="text-text-dim">{trendValue}</span>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
