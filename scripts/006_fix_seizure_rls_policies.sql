-- Remove old seizure_logs policies that are conflicting
DROP POLICY IF EXISTS "seizure_logs_insert_own" ON seizure_events;
DROP POLICY IF EXISTS "seizure_logs_select_own" ON seizure_events;
DROP POLICY IF EXISTS "seizure_logs_delete_own" ON seizure_events;
DROP POLICY IF EXISTS "seizure_logs_update_own" ON seizure_events;

-- Verify the new policies exist and are correct
-- If these don't exist, they will be created
CREATE POLICY IF NOT EXISTS "seizure_events_select_own"
  ON seizure_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "seizure_events_insert_own"
  ON seizure_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "seizure_events_update_own"
  ON seizure_events
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "seizure_events_delete_own"
  ON seizure_events
  FOR DELETE
  USING (auth.uid() = user_id);
