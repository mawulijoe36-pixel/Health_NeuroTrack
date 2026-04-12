import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface StreakCardProps {
  days: number
  todayCheckin: boolean
}

export function StreakCard({ days, todayCheckin }: StreakCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent" />
          Seizure-Free Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{days}</span>
          <span className="text-muted-foreground">days</span>
        </div>
        {!todayCheckin && (
          <p className="text-xs text-muted-foreground mt-2">
            {"Don't forget to complete today's check-in!"}
          </p>
        )}
        {todayCheckin && (
          <p className="text-xs text-success mt-2">
            {"Today's check-in complete"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
