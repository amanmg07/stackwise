-- ============================================================
-- Buyer-facing export views.
--
-- These views are the ONLY thing a healthcare data buyer should ever
-- see. They project research_id instead of anon_id and never expose
-- the auth.users foreign key.
--
-- Run a CSV/Parquet export against these views (e.g. via pg_dump
-- --table or a Supabase Edge Function) when delivering data to a
-- buyer. To revoke a buyer's slice: rotate_research_id() for the
-- affected users — their data in the export becomes unjoinable to
-- whatever the buyer downloaded previously.
-- ============================================================

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
WHERE e.event_type = 'dose_logged';

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
WHERE e.event_type = 'journal_entry';

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
WHERE e.event_type = 'cycle_created';

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
WHERE e.event_type = 'cycle_ended';

-- Lock down the views: nobody but the service role gets to read
-- these. Buyer exports run from a service-role context (admin
-- script / edge function), not from the mobile app.
REVOKE ALL ON research_dose_logs FROM PUBLIC;
REVOKE ALL ON research_journal_entries FROM PUBLIC;
REVOKE ALL ON research_cycles_started FROM PUBLIC;
REVOKE ALL ON research_cycles_ended FROM PUBLIC;

REVOKE ALL ON research_dose_logs FROM authenticated, anon;
REVOKE ALL ON research_journal_entries FROM authenticated, anon;
REVOKE ALL ON research_cycles_started FROM authenticated, anon;
REVOKE ALL ON research_cycles_ended FROM authenticated, anon;
