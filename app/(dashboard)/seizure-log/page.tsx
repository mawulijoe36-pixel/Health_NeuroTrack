'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createSeizureEvent, fetchSeizureEvents } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Zap, Clock, MapPin, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

const seizureTypes = [
  'Tonic-Clonic (Grand Mal)',
  'Absence (Petit Mal)',
  'Focal Aware',
  'Focal Impaired Awareness',
  'Myoclonic',
  'Atonic',
  'Unknown',
]

const commonTriggers = [
  'Lack of sleep',
  'Stress',
  'Missed medication',
  'Alcohol',
  'Flashing lights',
  'Illness/fever',
  'Menstruation',
  'Caffeine',
]

export default function SeizureLogPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: seizures, isLoading } = useQuery({
    queryKey: ['seizures', user?.id],
    queryFn: () => fetchSeizureEvents(user!.id),
    enabled: !!user,
  })

  const [formData, setFormData] = useState({
    seizureType: '',
    duration: '',
    location: '',
    triggers: [] as string[],
    warningSignals: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await createSeizureEvent(user.id, {
        seizure_type: formData.seizureType || null,
        duration_minutes: formData.duration ? parseInt(formData.duration) : null,
        location: formData.location || null,
        triggers: formData.triggers.length > 0 ? formData.triggers : null,
        warning_signs: formData.warningSignals ? formData.warningSignals.split(',').map(s => s.trim()) : null,
        notes: formData.notes || null,
      })
      
      queryClient.invalidateQueries({ queryKey: ['seizures'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      
      setIsOpen(false)
      setFormData({
        seizureType: '',
        duration: '',
        location: '',
        triggers: [],
        warningSignals: '',
        notes: '',
      })
      toast.success('Seizure event logged successfully')
    } catch (error) {
      toast.error('Failed to log seizure event')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seizure Log</h1>
          <p className="text-muted-foreground">
            Track and review your seizure events
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Seizure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Seizure Event</DialogTitle>
              <DialogDescription>
                Record the details of this seizure event
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Seizure Type</Label>
                <Select
                  value={formData.seizureType}
                  onValueChange={(value) => setFormData({ ...formData, seizureType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {seizureTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Where did it occur?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Possible Triggers</Label>
                <div className="flex flex-wrap gap-2">
                  {commonTriggers.map((trigger) => (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => toggleTrigger(trigger)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.triggers.includes(trigger)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warnings">Warning Signs (comma-separated)</Label>
                <Input
                  id="warnings"
                  placeholder="e.g., aura, dizziness, nausea"
                  value={formData.warningSignals}
                  onChange={(e) => setFormData({ ...formData, warningSignals: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Event'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seizure History */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : !seizures || seizures.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">No seizures recorded</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tap the button above to log a seizure event
              </p>
            </CardContent>
          </Card>
        ) : (
          seizures.map((seizure) => (
            <Card key={seizure.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                      <Zap className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {seizure.seizure_type || 'Unknown Type'}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(seizure.started_at), 'PPP')} at{' '}
                        {format(new Date(seizure.started_at), 'p')}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(seizure.started_at), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  {seizure.duration_minutes && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {seizure.duration_minutes} min
                    </div>
                  )}
                  {seizure.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {seizure.location}
                    </div>
                  )}
                </div>
                {seizure.triggers && seizure.triggers.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {seizure.triggers.map((trigger, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-warning/10 text-warning"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {seizure.notes && (
                  <p className="text-sm text-muted-foreground">{seizure.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
