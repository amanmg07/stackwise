-- ============================================================
-- Expose entry_mode + quick_logged on the buyer-facing views.
--
-- Phase 1.3 added `entry_mode: 'quick' | 'full'` to journal_entry
-- events and Phase 1.6 added `quick_logged: boolean` to dose_logged
-- events. Both are written to analytics_events correctly, but the
-- research_* views never surfaced them as columns — so buyers
-- couldn't filter quick-logged rows out of high-fidelity dose-
-- response aggregates (which is exactly the integrity guard the
-- tags were introduced for).
--
-- This migration drops + recreates the two views with the new
-- columns. Older rows (pre-Phase-1) don't carry the field; SQL
-- returns NULL for them — which is the right behavior. Buyer
-- queries can do:
--
--   -- High-fidelity dose-response only:
--   SELECT ... FROM research_dose_logs
--   WHERE quick_logged IS NOT TRUE;     -- handles NULL + false
--
--   -- Carefully-rated journal data only:
--   SELECT ... FROM research_journal_entries
--   WHERE entry_mode = 'full' OR entry_mode IS NULL;
--
-- Tested as DROP + CREATE because PostgreSQL doesn't allow ALTER
-- VIEW to change projection — and there's no schema migration
-- elsewhere relying on these views' shapes.
--
-- Safe to re-run.
-- ============================================================

-- ── research_dose_logs ──────────────────────────────────────
-- Carries over migration 022's projection + adds quick_logged.
DROP VIEW IF EXISTS research_dose_logs;
CREATE VIEW research_dose_logs AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date              AS log_date,
  (e.payload->>'cycle_id')        AS cycle_id,
  (e.payload->>'peptide_id')      AS peptide_id,
  (e.payload->>'amount')::numeric AS amount,
  (e.payload->>'unit')            AS unit,
  (e.payload->>'route')           AS route,
  (e.payload->>'site')            AS site,
  (e.payload->>'source')          AS source,
  -- True for notification-action batch-logs and Home/Cycle '+ icon'
  -- one-taps (Phase 1.6). Buyer aggregates that need precise
  -- dose-response data should filter `quick_logged IS NOT TRUE`.
  -- NULL for pre-Phase-1 events (no field in payload).
  (e.payload->>'quick_logged')::boolean AS quick_logged
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'dose_logged'
  AND up.research_consent = true;

REVOKE ALL ON research_dose_logs FROM PUBLIC, authenticated, anon;

-- ── research_journal_entries ────────────────────────────────
-- Carries over migration 029's projection + adds entry_mode.
DROP VIEW IF EXISTS research_journal_entries;
CREATE VIEW research_journal_entries AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  latest.log_date,
  (latest.payload->>'cycle_id')               AS cycle_id,
  (latest.payload->>'sleepQuality')::numeric  AS sleep_quality,
  (latest.payload->>'energyLevel')::numeric   AS energy_level,
  (latest.payload->>'recoveryScore')::numeric AS recovery_score,
  (latest.payload->>'mood')::numeric          AS mood,
  (latest.payload->>'weight')::numeric        AS weight,
  (latest.payload->>'weight_unit')            AS weight_unit,
  (latest.payload->>'body_fat')::numeric      AS body_fat,
  (latest.payload->>'skin_quality')::numeric  AS skin_quality,
  (latest.payload->>'joint_comfort')::numeric AS joint_comfort,
  (latest.payload->>'libido')::numeric        AS libido,
  (latest.payload->>'strength')::numeric      AS strength,
  (latest.payload->>'sleep_hours')::numeric   AS sleep_hours,
  latest.payload->'activePeptideIds'          AS active_peptide_ids,
  -- 'quick' = mood-keyed pre-fills from the one-tap emoji row;
  -- 'full' = user moved each slider explicitly. NULL on pre-
  -- Phase-1 events. High-fidelity slider aggregates should
  -- filter `entry_mode = 'full' OR entry_mode IS NULL`.
  (latest.payload->>'entry_mode')             AS entry_mode,
  COALESCE(
    (
      SELECT jsonb_agg(
        CASE
          WHEN jsonb_typeof(item) = 'string' THEN jsonb_build_object('effect', item #>> '{}')
          ELSE item
        END
      )
      FROM jsonb_array_elements(latest.payload->'sideEffects') AS item
    ),
    '[]'::jsonb
  ) AS side_effects
FROM (
  SELECT DISTINCT ON (anon_id, created_at::date)
    anon_id,
    created_at::date AS log_date,
    payload,
    created_at
  FROM analytics_events
  WHERE event_type = 'journal_entry'
    AND (
      (payload->>'sleepQuality')::numeric  IS DISTINCT FROM 5 OR
      (payload->>'energyLevel')::numeric   IS DISTINCT FROM 5 OR
      (payload->>'recoveryScore')::numeric IS DISTINCT FROM 5 OR
      (payload->>'mood')::numeric          IS DISTINCT FROM 5 OR
      payload->>'weight'         IS NOT NULL OR
      payload->>'body_fat'       IS NOT NULL OR
      payload->>'sleep_hours'    IS NOT NULL OR
      payload->>'cycle_id'       IS NOT NULL OR
      payload->>'skin_quality'   IS NOT NULL OR
      payload->>'joint_comfort'  IS NOT NULL OR
      payload->>'libido'         IS NOT NULL OR
      payload->>'strength'       IS NOT NULL OR
      (payload->'sideEffects' IS NOT NULL
        AND jsonb_typeof(payload->'sideEffects') = 'array'
        AND jsonb_array_length(payload->'sideEffects') > 0) OR
      (payload->'activePeptideIds' IS NOT NULL
        AND jsonb_typeof(payload->'activePeptideIds') = 'array'
        AND jsonb_array_length(payload->'activePeptideIds') > 0)
    )
  ORDER BY anon_id, created_at::date, created_at DESC
) latest
JOIN user_profiles up ON up.anon_id = latest.anon_id
WHERE up.research_consent = true;

REVOKE ALL ON research_journal_entries FROM PUBLIC, authenticated, anon;
