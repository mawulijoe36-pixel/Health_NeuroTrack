import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type DailyCheckin = Database['public']['Tables']['daily_checkins']['Row']
type SeizureEvent = Database['public']['Tables']['seizure_events']['Row']

export interface DashboardData {
  riskLevel: 'low' | 'moderate' | 'high'
  riskScore: number
  seizuresFreeStreak: number
  todayCheckin: boolean
  stats: {
    seizuresThisMonth: number
    avgSleepHours: number
    medicationAdherence: number
    lastSeizureDate: string | null
  }
}

export interface ActivityItem {
  id: string
  type: 'checkin' | 'seizure' | 'medication'
  title: string
  description: string
  timestamp: string
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0]

  // Fetch seizures this month
  const { data: seizures } = await supabase
    .from('seizure_events')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startOfMonth)
    .order('started_at', { ascending: false })

  // Fetch recent checkins
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)

  // Check if today's checkin exists
  const todayCheckin = checkins?.some(c => c.date === today) ?? false

  // Calculate stats
  const seizuresThisMonth = seizures?.length ?? 0
  const avgSleepHours = checkins?.length 
    ? checkins.reduce((sum, c) => sum + (c.sleep_hours ?? 0), 0) / checkins.length 
    : 0

  const medicationAdherence = checkins?.length
    ? (checkins.filter(c => c.medication_taken).length / checkins.length) * 100
    : 0

  const lastSeizure = seizures?.[0]?.started_at ?? null

  // Calculate seizure-free streak
  let seizuresFreeStreak = 0
  if (lastSeizure) {
    const daysSinceLastSeizure = Math.floor(
      (now.getTime() - new Date(lastSeizure).getTime()) / (1000 * 60 * 60 * 24)
    )
    seizuresFreeStreak = daysSinceLastSeizure
  } else {
    seizuresFreeStreak = checkins?.length ? checkins.length : 0
  }

  // Calculate risk level based on various factors
  let riskScore = 0
  if (seizuresThisMonth > 5) riskScore += 40
  else if (seizuresThisMonth > 2) riskScore += 20
  else if (seizuresThisMonth > 0) riskScore += 10

  if (avgSleepHours < 6) riskScore += 20
  else if (avgSleepHours < 7) riskScore += 10

  if (medicationAdherence < 80) riskScore += 30
  else if (medicationAdherence < 95) riskScore += 10

  const riskLevel: DashboardData['riskLevel'] = 
    riskScore >= 50 ? 'high' : riskScore >= 25 ? 'moderate' : 'low'

  return {
    riskLevel,
    riskScore: Math.min(100, riskScore),
    seizuresFreeStreak,
    todayCheckin,
    stats: {
      seizuresThisMonth,
      avgSleepHours: Math.round(avgSleepHours * 10) / 10,
      medicationAdherence: Math.round(medicationAdherence),
      lastSeizureDate: lastSeizure,
    },
  }
}

export async function fetchRecentActivity(userId: string): Promise<ActivityItem[]> {
  const supabase = createClient()
  
  const [{ data: checkins }, { data: seizures }] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('seizure_events')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(5),
  ])

  const activities: ActivityItem[] = []

  checkins?.forEach((checkin: DailyCheckin) => {
    activities.push({
      id: checkin.id,
      type: 'checkin',
      title: 'Daily Check-in',
      description: `Mood: ${checkin.mood ?? 'Not recorded'}, Sleep: ${checkin.sleep_hours ?? 0}h`,
      timestamp: checkin.date,
    })
  })

  seizures?.forEach((seizure: SeizureEvent) => {
    activities.push({
      id: seizure.id,
      type: 'seizure',
      title: 'Seizure Event',
      description: `${seizure.seizure_type ?? 'Unknown type'}${seizure.duration_minutes ? `, ${seizure.duration_minutes} min` : ''}`,
      timestamp: seizure.started_at,
    })
  })

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}

export async function createCheckin(
  userId: string,
  data: Partial<Database['public']['Tables']['daily_checkins']['Insert']>
) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: result, error } = await supabase
    .from('daily_checkins')
    .insert({
      ...data,
      user_id: userId,
      date: today,
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export async function createSeizureEvent(
  userId: string,
  data: Partial<Database['public']['Tables']['seizure_events']['Insert']>
) {
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: result, error } = await supabase
    .from('seizure_events')
    .insert({
      ...data,
      user_id: userId,
      date: today,
      started_at: data.started_at ?? new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[v0] Seizure event error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(error.message || 'Failed to create seizure event')
  }
  
  return result
}

export async function fetchSeizureEvents(userId: string, limit = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('seizure_events')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[v0] Fetch seizure events error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw error
  }
  return data
}

export async function fetchCheckins(userId: string, limit = 30) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function fetchProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateProfile(
  userId: string,
  data: Partial<Database['public']['Tables']['profiles']['Update']>
) {
  const supabase = createClient()

  const { data: result, error } = await supabase
    .from('profiles')
    .upsert({
      ...data,
      id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return result
}
