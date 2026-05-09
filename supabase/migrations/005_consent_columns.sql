-- ============================================================
-- Phase 3: Granular consent
--
-- Two distinct boolean flags stored on user_profiles:
--   analytics_consent — opt-in for INTERNAL product analytics. Already
--                       gated client-side via Settings.analyticsConsent;
--                       this column mirrors that for server-side queries.
--   research_consent  — opt-in for SALE / SHARING of de-identified data
--                       with third-party healthcare research partners.
--                       Strictly stricter: a user can opt into product
--                       analytics but decline data sharing.
--
-- Default: both false. Existing users will be re-prompted by the
-- onboarding flow (researchConsentDecided is false until they answer).
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS research_consent  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS research_consent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_research_consent
  ON user_profiles(research_consent)
  WHERE research_consent = true;

-- Re-create the buyer-facing views so they only include rows from
-- users who explicitly opted into sharing. CREATE OR REPLACE keeps
-- view names + permissions stable.

CREATE OR REPLACE VIEW research_dose_logs AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at,
  (e.payload->>'cycle_id')   AS cycle_id,
  (e.payload->>'peptide_id') AS peptide_id,
  (e.payload->>'amount')::numeric AS amount,
  (e.payload->>'unit')       AS unit,
  (e.payload->>'route')      AS route,
  (e.payload->>'site')       AS site
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'dose_logged'
  AND up.research_consent = true;

CREATE OR REPLACE VIEW research_journal_entries AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at,
  (e.payload->>'cycle_id')        AS cycle_id,
  (e.payload->>'sleepQuality')::numeric  AS sleep_quality,
  (e.payload->>'energyLevel')::numeric   AS energy_level,
  (e.payload->>'recoveryScore')::numeric AS recovery_score,
  (e.payload->>'mood')::numeric          AS mood,
  (e.payload->>'weight')::numeric        AS weight,
  (e.payload->>'sleep_hours')::numeric   AS sleep_hours,
  e.payload->'activePeptideIds'  AS active_peptide_ids,
  e.payload->'sideEffects'       AS side_effects
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'journal_entry'
  AND up.research_consent = true;

CREATE OR REPLACE VIEW research_cycles_started AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at,
  (e.payload->>'cycle_id')           AS cycle_id,
  (e.payload->>'name')               AS cycle_name,
  (e.payload->>'goal')               AS goal,
  (e.payload->>'duration_weeks')::int AS duration_weeks,
  (e.payload->>'template_id')        AS template_id,
  e.payload->'compounds'             AS compounds,
  e.payload->'baseline'              AS baseline
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_created'
  AND up.research_consent = true;

CREATE OR REPLACE VIEW research_cycles_ended AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at,
  (e.payload->>'cycle_id')           AS cycle_id,
  (e.payload->>'reason')             AS reason,
  (e.payload->>'durationDays')::int  AS duration_days,
  (e.payload->>'expected_days')::int AS expected_days,
  (e.payload->>'completed_days')::int AS completed_days,
  (e.payload->>'adherence_pct')::int AS adherence_pct,
  (e.payload->>'total_doses_logged')::int AS total_doses_logged,
  e.payload->'peptideIds'            AS peptide_ids
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_ended'
  AND up.research_consent = true;

-- Re-apply the lock-down so authenticated/anon roles can't read.
REVOKE ALL ON research_dose_logs FROM PUBLIC;
REVOKE ALL ON research_journal_entries FROM PUBLIC;
REVOKE ALL ON research_cycles_started FROM PUBLIC;
REVOKE ALL ON research_cycles_ended FROM PUBLIC;

REVOKE ALL ON research_dose_logs FROM authenticated, anon;
REVOKE ALL ON research_journal_entries FROM authenticated, anon;
REVOKE ALL ON research_cycles_started FROM authenticated, anon;
REVOKE ALL ON research_cycles_ended FROM authenticated, anon;
