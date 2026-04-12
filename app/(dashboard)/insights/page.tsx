'use client'

import { useAuth } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { fetchSeizureEvents, fetchCheckins } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, TrendingUp, Moon, Zap, Calendar } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns'

export default function InsightsPage() {
  const { user } = useAuth()

  const { data: seizures, isLoading: seizuresLoading } = useQuery({
    queryKey: ['seizures', user?.id],
    queryFn: () => fetchSeizureEvents(user!.id, 100),
    enabled: !!user,
  })

  const { data: checkins, isLoading: checkinsLoading } = useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: () => fetchCheckins(user!.id, 30),
    enabled: !!user,
  })

  const isLoading = seizuresLoading || checkinsLoading

  // Process data for charts
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  })

  const sleepData = last7Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const checkin = checkins?.find(c => c.date === dateStr)
    return {
      day: format(day, 'EEE'),
      hours: checkin?.sleep_hours ?? 0,
    }
  })

  const seizuresByType = seizures?.reduce((acc, s) => {
    const type = s.seizure_type || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  const seizureTypeData = Object.entries(seizuresByType).map(([name, value]) => ({
    name,
    value,
  }))

  const triggerCounts = seizures?.reduce((acc, s) => {
    s.triggers?.forEach(trigger => {
      acc[trigger] = (acc[trigger] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>) ?? {}

  const triggerData = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

  // Calculate stats
  const totalSeizures = seizures?.length ?? 0
  const avgSleepHours = checkins?.length
    ? Math.round((checkins.reduce((sum, c) => sum + (c.sleep_hours ?? 0), 0) / checkins.length) * 10) / 10
    : 0
  const medicationAdherence = checkins?.length
    ? Math.round((checkins.filter(c => c.medication_taken).length / checkins.length) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Analyze your patterns and identify trends
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Seizures (30 days)
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeizures}</div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medication Adherence
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicationAdherence}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sleep Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sleep Pattern (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Seizure Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Seizure Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seizureTypeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No seizure data to display
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={seizureTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {seizureTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {seizureTypeData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {seizureTypeData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Triggers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Common Triggers
            </CardTitle>
            <CardDescription>
              Most frequently reported triggers from your seizure logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {triggerData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No trigger data available. Log seizures with triggers to see patterns.
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={triggerData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
