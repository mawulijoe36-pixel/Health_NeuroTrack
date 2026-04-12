import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface RiskBadgeProps {
  level: 'low' | 'moderate' | 'high'
  className?: string
}

const config = {
  low: {
    label: 'Low Risk',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
  moderate: {
    label: 'Moderate Risk',
    icon: AlertCircle,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  high: {
    label: 'High Risk',
    icon: AlertTriangle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const { label, icon: Icon, className: levelClassName } = config[level]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium',
        levelClassName,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  )
}
