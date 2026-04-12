import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, Zap, Pill } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityItem } from '@/lib/api'

interface ActivityTimelineProps {
  activities: ActivityItem[]
}

const iconMap = {
  checkin: ClipboardCheck,
  seizure: Zap,
  medication: Pill,
}

const colorMap = {
  checkin: 'bg-primary/10 text-primary',
  seizure: 'bg-destructive/10 text-destructive',
  medication: 'bg-secondary/10 text-secondary',
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity. Start tracking to see your history here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type]
            const colorClass = colorMap[activity.type]
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
