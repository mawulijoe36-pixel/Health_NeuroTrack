-- Drop the UNIQUE constraint that prevents multiple check-ins per day
ALTER TABLE public.daily_checkins 
DROP CONSTRAINT IF EXISTS daily_checkins_user_id_date_key;

-- Add a new index without uniqueness for better query performance
DROP INDEX IF EXISTS idx_daily_checkins_user_date;
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, date DESC);
