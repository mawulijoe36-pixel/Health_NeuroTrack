export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          id: string
          medication_taken: boolean | null
          mood: string | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string
          water_intake: number | null
        }
        Insert: {
          created_at?: string
          date: string
          energy_level?: number | null
          id?: string
          medication_taken?: boolean | null
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id: string
          water_intake?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          medication_taken?: boolean | null
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          emergency_contact: string | null
          id: string
          timezone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          emergency_contact?: string | null
          id: string
          timezone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          timezone?: string | null
        }
        Relationships: []
      }
      seizure_events: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          location: string | null
          notes: string | null
          postictal_symptoms: string[] | null
          seizure_type: string | null
          started_at: string
          triggers: string[] | null
          user_id: string
          warning_signs: string[] | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          postictal_symptoms?: string[] | null
          seizure_type?: string | null
          started_at: string
          triggers?: string[] | null
          user_id: string
          warning_signs?: string[] | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          postictal_symptoms?: string[] | null
          seizure_type?: string | null
          started_at?: string
          triggers?: string[] | null
          user_id?: string
          warning_signs?: string[] | null
        }
        Relationships: []
      }
      triggers: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
