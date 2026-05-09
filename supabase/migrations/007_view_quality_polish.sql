-- ============================================================
-- Phase 4.6: Polish buyer-facing views.
--
-- Two changes, both purely on the view layer (no schema migration):
--
-- 1. Timestamp granularity reduced to date.
--    Full timestamps (with seconds) leak fingerprintable behavioral
--    patterns when joined with demographics. Buyers doing
--    longitudinal research only need day-level resolution. Project
--    log_date instead of created_at across all four research_* views.
--
-- 2. Journal entries deduplicated per day.
--    NewEntryScreen lets a user create multiple entries for the
--    same date if they navigate back to it. The buyer should only
--    see the latest entry per (user, day). DISTINCT ON gives us
--    that with no extra schema work.
--
-- Quality and consent filters from migrations 005 and 006 are
-- preserved verbatim.
-- ============================================================

DROP VIEW IF EXISTS research_dose_logs;
CREATE VIEW research_dose_logs AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at::date              AS log_date,
  (e.payload->>'cycle_id')        AS cycle_id,
  (e.payload->>'peptide_id')      AS peptide_id,
  (e.payload->>'amount')::numeric AS amount,
  (e.payload->>'unit')            AS unit,
  (e.payload->>'route')           AS route,
  (e.payload->>'site')            AS site
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'dose_logged'
  AND up.research_consent = true;

-- DISTINCT ON keeps only the latest entry per (anon → research_id, date).
-- The user_profiles join then projects research_id and demographics.
DROP VIEW IF EXISTS research_journal_entries;
CREATE VIEW research_journal_entries AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  latest.log_date,
  (latest.payload->>'cycle_id')           AS cycle_id,
  (latest.payload->>'sleepQuality')::numeric  AS sleep_quality,
  (latest.payload->>'energyLevel')::numeric   AS energy_level,
  (latest.payload->>'recoveryScore')::numeric AS recovery_score,
  (latest.payload->>'mood')::numeric          AS mood,
  (latest.payload->>'weight')::numeric        AS weight,
  (latest.payload->>'sleep_hours')::numeric   AS sleep_hours,
  latest.payload->'activePeptideIds'  AS active_peptide_ids,
  latest.payload->'sideEffects'       AS side_effects
FROM (
  SELECT DISTINCT ON (anon_id, created_at::date)
    anon_id,
    created_at::date AS log_date,
    payload,
    created_at
  FROM analytics_events
  WHERE event_type = 'journal_entry'
  ORDER BY anon_id, created_at::date, created_at DESC
) latest
JOIN user_profiles up ON up.anon_id = latest.anon_id
WHERE up.research_consent = true;

DROP VIEW IF EXISTS research_cycles_started;
CREATE VIEW research_cycles_started AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at::date                  AS log_date,
  (e.payload->>'cycle_id')            AS cycle_id,
  (e.payload->>'name')                AS cycle_name,
  (e.payload->>'goal')                AS goal,
  (e.payload->>'duration_weeks')::int AS duration_weeks,
  (e.payload->>'template_id')         AS template_id,
  e.payload->'compounds'              AS compounds,
  e.payload->'baseline'               AS baseline
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_created'
  AND up.research_consent = true
  AND EXISTS (
    SELECT 1 FROM analytics_events d
    WHERE d.event_type = 'dose_logged'
      AND d.payload->>'cycle_id' = e.payload->>'cycle_id'
      AND d.anon_id = e.anon_id
  );

DROP VIEW IF EXISTS research_cycles_ended;
CREATE VIEW research_cycles_ended AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at::date                       AS log_date,
  (e.payload->>'cycle_id')                 AS cycle_id,
  (e.payload->>'reason')                   AS reason,
  (e.payload->>'durationDays')::int        AS duration_days,
  (e.payload->>'expected_days')::int       AS expected_days,
  (e.payload->>'completed_days')::int      AS completed_days,
  (e.payload->>'adherence_pct')::int       AS adherence_pct,
  (e.payload->>'total_doses_logged')::int  AS total_doses_logged,
  e.payload->'peptideIds'                  AS peptide_ids
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_ended'
  AND up.research_consent = true
  AND EXISTS (
    SELECT 1 FROM analytics_events d
    WHERE d.event_type = 'dose_logged'
      AND d.payload->>'cycle_id' = e.payload->>'cycle_id'
      AND d.anon_id = e.anon_id
  );

REVOKE ALL ON research_dose_logs        FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_journal_entries  FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_cycles_started   FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_cycles_ended     FROM PUBLIC, authenticated, anon;
