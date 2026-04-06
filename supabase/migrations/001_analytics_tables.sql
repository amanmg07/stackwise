-- Anonymous user profiles (demographics only, no PII)
CREATE TABLE IF NOT EXISTS user_profiles (
  anon_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER CHECK (age >= 16 AND age <= 100),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  goals TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('new', 'some', 'experienced')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anonymous analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type_created ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON user_profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON user_profiles USING GIN(goals);

-- Row-level security: users can only insert/read their own data
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upsert own profile"
  ON user_profiles FOR ALL
  USING (anon_id = auth.uid())
  WITH CHECK (anon_id = auth.uid());

CREATE POLICY "Users can insert own events"
  ON analytics_events FOR INSERT
  WITH CHECK (anon_id = auth.uid());

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Example analytics queries (for reference, not executed):
--
-- Peptide popularity by age bracket:
--   SELECT
--     CASE WHEN up.age < 25 THEN '18-24' WHEN up.age < 35 THEN '25-34'
--          WHEN up.age < 45 THEN '35-44' WHEN up.age < 55 THEN '45-54' ELSE '55+' END AS age_bracket,
--     e.payload->>'peptide_id' as peptide, COUNT(*)
--   FROM analytics_events e JOIN user_profiles up ON e.anon_id = up.anon_id
--   WHERE e.event_type = 'dose_logged'
--   GROUP BY age_bracket, e.payload->>'peptide_id'
--   ORDER BY count DESC;
--
-- Top peptide stacks:
--   SELECT payload->'peptide_ids' as stack, COUNT(*)
--   FROM analytics_events WHERE event_type = 'cycle_created'
--   GROUP BY payload->'peptide_ids' ORDER BY count DESC;
--
-- Scan improvement rates by active peptides:
--   SELECT payload->'working_peptide_ids' as peptides,
--          AVG((payload->>'changes_improved')::int) as avg_improvements
--   FROM analytics_events WHERE event_type = 'scan_compared'
--   GROUP BY payload->'working_peptide_ids';
