-- Fix schema mismatches

-- 1. Alter daily_checkins.mood to be TEXT instead of INTEGER
ALTER TABLE public.daily_checkins 
  ALTER COLUMN mood TYPE TEXT USING mood::TEXT,
  DROP CONSTRAINT IF EXISTS daily_checkins_mood_check;

-- 2. Add energy_level column if missing
ALTER TABLE public.daily_checkins 
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5);

-- 3. Add water_intake column if missing  
ALTER TABLE public.daily_checkins 
  ADD COLUMN IF NOT EXISTS water_intake INTEGER;

-- 4. Rename seizure_logs to seizure_events if seizure_events doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seizure_events') THEN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seizure_logs') THEN
      ALTER TABLE public.seizure_logs RENAME TO seizure_events;
    ELSE
      -- Create seizure_events table from scratch
      CREATE TABLE public.seizure_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        duration_minutes INTEGER,
        seizure_type TEXT,
        triggers TEXT[],
        warning_signs TEXT[],
        postictal_symptoms TEXT[],
        location TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.seizure_events ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "seizure_events_select_own" ON public.seizure_events FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "seizure_events_insert_own" ON public.seizure_events FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "seizure_events_update_own" ON public.seizure_events FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "seizure_events_delete_own" ON public.seizure_events FOR DELETE USING (auth.uid() = user_id);

      CREATE INDEX IF NOT EXISTS idx_seizure_events_user_date ON public.seizure_events(user_id, started_at DESC);
    END IF;
  END IF;
END $$;

-- 5. Add started_at column to seizure_events if it was renamed from seizure_logs
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seizure_events') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'seizure_events' AND column_name = 'started_at') THEN
      ALTER TABLE public.seizure_events ADD COLUMN started_at TIMESTAMPTZ;
      -- Copy date + time to started_at if those columns exist
      IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'seizure_events' AND column_name = 'date') THEN
        UPDATE public.seizure_events SET started_at = (date::text || ' ' || COALESCE(time::text, '00:00:00'))::timestamptz;
      END IF;
      ALTER TABLE public.seizure_events ALTER COLUMN started_at SET DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'seizure_events' AND column_name = 'duration_minutes') THEN
      ALTER TABLE public.seizure_events ADD COLUMN duration_minutes INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'seizure_events' AND column_name = 'postictal_symptoms') THEN
      ALTER TABLE public.seizure_events ADD COLUMN postictal_symptoms TEXT[];
    END IF;
  END IF;
END $$;

-- 6. Update profiles table to match expected schema
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- 7. Create triggers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'triggers' AND policyname = 'triggers_select_own') THEN
    CREATE POLICY "triggers_select_own" ON public.triggers FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'triggers' AND policyname = 'triggers_insert_own') THEN
    CREATE POLICY "triggers_insert_own" ON public.triggers FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'triggers' AND policyname = 'triggers_update_own') THEN
    CREATE POLICY "triggers_update_own" ON public.triggers FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'triggers' AND policyname = 'triggers_delete_own') THEN
    CREATE POLICY "triggers_delete_own" ON public.triggers FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
