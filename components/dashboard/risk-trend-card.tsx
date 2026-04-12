import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { RiskBadge } from './risk-badge'

interface RiskTrendCardProps {
  level: 'low' | 'moderate' | 'high'
  score: number
}

export function RiskTrendCard({ level, score }: RiskTrendCardProps) {
  const getTrendIcon = () => {
    if (score < 25) return <TrendingDown className="h-4 w-4 text-success" />
    if (score > 50) return <TrendingUp className="h-4 w-4 text-destructive" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendText = () => {
    if (score < 25) return 'Looking good!'
    if (score > 50) return 'Consider consulting your doctor'
    return 'Monitor closely'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <RiskBadge level={level} />
          {getTrendIcon()}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risk Score</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                score < 25
                  ? 'bg-success'
                  : score < 50
                  ? 'bg-warning'
                  : 'bg-destructive'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{getTrendText()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
