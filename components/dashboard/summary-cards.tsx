import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Moon, Pill, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SummaryCardsProps {
  seizuresThisMonth: number
  avgSleepHours: number
  medicationAdherence: number
  lastSeizureDate: string | null
}

export function SummaryCards({
  seizuresThisMonth,
  avgSleepHours,
  medicationAdherence,
  lastSeizureDate,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Seizures This Month
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{seizuresThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            {seizuresThisMonth === 0 ? 'Keep it up!' : 'Track patterns in Insights'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg. Sleep
          </CardTitle>
          <Moon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgSleepHours}h</div>
          <p className="text-xs text-muted-foreground">
            {avgSleepHours >= 7 ? 'Good sleep pattern' : 'Try to get 7+ hours'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Medication Adherence
          </CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{medicationAdherence}%</div>
          <p className="text-xs text-muted-foreground">
            {medicationAdherence >= 90 ? 'Excellent consistency' : 'Keep taking your meds'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Last Seizure
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {lastSeizureDate
              ? formatDistanceToNow(new Date(lastSeizureDate), { addSuffix: false })
              : 'None'}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastSeizureDate ? 'ago' : 'No seizures recorded'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
