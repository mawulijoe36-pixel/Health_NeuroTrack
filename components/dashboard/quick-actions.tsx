import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button asChild variant="outline" className="justify-start h-auto py-3">
          <Link href="/checkin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Daily Check-in</div>
              <div className="text-xs text-muted-foreground">
                Log your daily symptoms
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start h-auto py-3">
          <Link href="/seizure-log" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Log Seizure</div>
              <div className="text-xs text-muted-foreground">
                Record a seizure event
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start h-auto py-3">
          <Link href="/insights" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">View Insights</div>
              <div className="text-xs text-muted-foreground">
                Analyze your patterns
              </div>
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
