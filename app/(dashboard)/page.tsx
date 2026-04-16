'use client'

import { useAuth } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { fetchDashboardData, fetchRecentActivity } from '@/lib/api'
import { RiskBadge } from '@/components/dashboard/risk-badge'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { StreakCard } from '@/components/dashboard/streak-card'
import { RiskTrendCard } from '@/components/dashboard/risk-trend-card'
import { Skeleton } from '@/components/ui/skeleton'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user, firstName } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => fetchDashboardData(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  })

  const { data: activity } = useQuery({
    queryKey: ['activity', user?.id],
    queryFn: () => fetchRecentActivity(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {"Here's your health overview"}
          </p>
        </div>
        <RiskBadge level={data.riskLevel} />
      </div>

      {/* Summary Stats */}
      <SummaryCards
        seizuresThisMonth={data.stats.seizuresThisMonth}
        avgSleepHours={data.stats.avgSleepHours}
        medicationAdherence={data.stats.medicationAdherence}
        lastSeizureDate={data.stats.lastSeizureDate}
      />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <StreakCard days={data.seizuresFreeStreak} todayCheckin={data.todayCheckin} />
          <RiskTrendCard level={data.riskLevel} score={data.riskScore} />
          <QuickActions />
        </div>
        <div>
          <ActivityTimeline activities={activity ?? []} />
        </div>
      </div>
    </div>
  )
}
