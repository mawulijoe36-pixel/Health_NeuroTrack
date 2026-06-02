-- Rename seizure_logs to seizure_events and fix schema
-- First, check if seizure_events already exists, if not rename seizure_logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seizure_events') THEN
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seizure_logs') THEN
            ALTER TABLE public.seizure_logs RENAME TO seizure_events;
        ELSE
            -- Create seizure_events from scratch
            CREATE TABLE public.seizure_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                duration_minutes INTEGER,
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
        END IF;
    END IF;
END $$;

-- Add started_at column if it doesn't exist (for renamed table)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seizure_events' 
        AND column_name = 'started_at'
    ) THEN
        ALTER TABLE public.seizure_events ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
        -- Populate started_at from date/time if they exist
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'seizure_events' 
            AND column_name = 'date'
        ) THEN
            UPDATE public.seizure_events 
            SET started_at = (date + COALESCE(time, '00:00:00'::time))::timestamptz
            WHERE started_at IS NULL;
        END IF;
    END IF;
END $$;

-- Add duration_minutes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seizure_events' 
        AND column_name = 'duration_minutes'
    ) THEN
        ALTER TABLE public.seizure_events ADD COLUMN duration_minutes INTEGER;
        -- Convert from seconds if duration_seconds exists
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'seizure_events' 
            AND column_name = 'duration_seconds'
        ) THEN
            UPDATE public.seizure_events 
            SET duration_minutes = CEIL(duration_seconds / 60.0)
            WHERE duration_seconds IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.seizure_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "seizure_events_select_own" ON public.seizure_events;
DROP POLICY IF EXISTS "seizure_events_insert_own" ON public.seizure_events;
DROP POLICY IF EXISTS "seizure_events_update_own" ON public.seizure_events;
DROP POLICY IF EXISTS "seizure_events_delete_own" ON public.seizure_events;

CREATE POLICY "seizure_events_select_own" ON public.seizure_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "seizure_events_insert_own" ON public.seizure_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "seizure_events_update_own" ON public.seizure_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "seizure_events_delete_own" ON public.seizure_events FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_seizure_events_user_started ON public.seizure_events(user_id, started_at DESC);
