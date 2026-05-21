-- ============================================================
-- research_journal_entries: include subjective metrics in the
-- low-signal filter (audit finding F6).
--
-- Migration 020 introduced a "low-signal" filter on journal_entry
-- events: an entry was kept only if the user had moved AT LEAST ONE
-- of the core scores (sleep/energy/recovery/mood) off the default 5,
-- OR set weight/body_fat/sleep_hours/cycle_id, OR populated
-- sideEffects/activePeptideIds. The intent was to drop "default 5"
-- entries that carry no information.
--
-- The bug: the four subjective metrics added by migration 010
-- (skin_quality, joint_comfort, libido, strength) were NOT in that
-- OR list. So a user who logged ONLY subjective metrics (e.g. set
-- libido = 8 and left the core four at default 5) had their entry
-- dropped as "low-signal" — real data loss for the subjective-metric
-- use case.
--
-- Fix: add the four subjective metrics to the OR clause as
-- `IS NOT NULL` checks (mirroring weight/body_fat/sleep_hours). The
-- view body, projections, side_effects normalization, and outer
-- consent join are otherwise unchanged.
-- ============================================================

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
      -- NEW: subjective metrics (audit finding F6).
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
