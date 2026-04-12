'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { createCheckin } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { Loader2, CheckCircle, Moon, Battery, Brain, Droplets, Pill } from 'lucide-react'

const moods = [
  { value: 'great', label: 'Great', emoji: '😊' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'stressed', label: 'Stressed', emoji: '😫' },
]

export default function CheckinPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    mood: '',
    sleepHours: 7,
    sleepQuality: 3,
    energyLevel: 3,
    stressLevel: 2,
    waterIntake: 8,
    medicationTaken: true,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await createCheckin(user.id, {
        mood: formData.mood || null,
        sleep_hours: formData.sleepHours,
        sleep_quality: formData.sleepQuality,
        energy_level: formData.energyLevel,
        stress_level: formData.stressLevel,
        water_intake: formData.waterIntake,
        medication_taken: formData.medicationTaken,
        notes: formData.notes || null,
      })
      
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      
      setSubmitted(true)
      toast.success('Check-in completed successfully!')
    } catch (error) {
      toast.error('Failed to save check-in. Please try again.')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Check-in Complete!</h1>
        <p className="text-muted-foreground mb-6">
          {"Great job tracking your health today. Keep up the good work!"}
        </p>
        <Button onClick={() => setSubmitted(false)}>
          Update Check-in
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Daily Check-in</h1>
        <p className="text-muted-foreground">
          {"How are you feeling today? Let's track your wellbeing."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mood
            </CardTitle>
            <CardDescription>How would you describe your mood today?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: mood.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                    formData.mood === mood.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Hours of Sleep</Label>
                <span className="font-medium">{formData.sleepHours}h</span>
              </div>
              <Slider
                value={[formData.sleepHours]}
                onValueChange={([value]) => setFormData({ ...formData, sleepHours: value })}
                min={0}
                max={12}
                step={0.5}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sleep Quality</Label>
                <span className="font-medium">{formData.sleepQuality}/5</span>
              </div>
              <Slider
                value={[formData.sleepQuality]}
                onValueChange={([value]) => setFormData({ ...formData, sleepQuality: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Energy & Stress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Energy & Stress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Energy Level</Label>
                <span className="font-medium">{formData.energyLevel}/5</span>
              </div>
              <Slider
                value={[formData.energyLevel]}
                onValueChange={([value]) => setFormData({ ...formData, energyLevel: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stress Level</Label>
                <span className="font-medium">{formData.stressLevel}/5</span>
              </div>
              <Slider
                value={[formData.stressLevel]}
                onValueChange={([value]) => setFormData({ ...formData, stressLevel: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Water & Medication */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Hydration & Medication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Glasses of Water</Label>
                <span className="font-medium">{formData.waterIntake}</span>
              </div>
              <Slider
                value={[formData.waterIntake]}
                onValueChange={([value]) => setFormData({ ...formData, waterIntake: value })}
                min={0}
                max={16}
                step={1}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="medication">Took medication today</Label>
              </div>
              <Switch
                id="medication"
                checked={formData.medicationTaken}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, medicationTaken: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
            <CardDescription>
              Anything else you want to record about today?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any symptoms, triggers, or observations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Complete Check-in'
          )}
        </Button>
      </form>
    </div>
  )
}
