-- NeuroTrack Database Schema
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  daily_reminder_time TIME DEFAULT '09:00:00',
  theme TEXT DEFAULT 'system',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create medications table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  time_of_day TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  hydration_glasses INTEGER,
  exercise_minutes INTEGER,
  medication_taken BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create seizure_logs table
CREATE TABLE IF NOT EXISTS public.seizure_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  duration_seconds INTEGER,
  seizure_type TEXT,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  triggers TEXT[],
  warning_signs TEXT[],
  post_symptoms TEXT[],
  location TEXT,
  witnesses BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create risk_assessments table for AI-generated risk scores
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  factors JSONB,
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seizure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for medications
CREATE POLICY "medications_select_own" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "medications_insert_own" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "medications_update_own" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "medications_delete_own" ON public.medications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_checkins
CREATE POLICY "daily_checkins_select_own" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_checkins_insert_own" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_checkins_update_own" ON public.daily_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "daily_checkins_delete_own" ON public.daily_checkins FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for seizure_logs
CREATE POLICY "seizure_logs_select_own" ON public.seizure_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "seizure_logs_insert_own" ON public.seizure_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "seizure_logs_update_own" ON public.seizure_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "seizure_logs_delete_own" ON public.seizure_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for risk_assessments
CREATE POLICY "risk_assessments_select_own" ON public.risk_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "risk_assessments_insert_own" ON public.risk_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risk_assessments_update_own" ON public.risk_assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "risk_assessments_delete_own" ON public.risk_assessments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_seizure_logs_user_date ON public.seizure_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON public.medications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_date ON public.risk_assessments(user_id, date DESC);
