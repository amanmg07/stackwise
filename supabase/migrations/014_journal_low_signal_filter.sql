-- ============================================================
-- Filter low-signal journal entries from the buyer view.
--
-- A journal entry counts as "low-signal" when the user clearly
-- didn't engage — every rating at the default 5/10, no weight,
-- no body fat, no sleep hours, no side effects, no active
-- peptides, no cycle. These rows have zero research value and
-- only inflate the noise floor of any aggregate.
--
-- The filter is applied INSIDE the DISTINCT ON subquery so that
-- if a user logs a low-signal entry AND a meaningful one on the
-- same day, the meaningful one wins regardless of timestamp.
--
-- Anything that breaks the all-defaults pattern stays — including
-- baseline entries off-cycle (real ratings, no peptides) which
-- are useful as control data points.
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
  latest.payload->'sideEffects'               AS side_effects
FROM (
  SELECT DISTINCT ON (anon_id, created_at::date)
    anon_id,
    created_at::date AS log_date,
    payload,
    created_at
  FROM analytics_events
  WHERE event_type = 'journal_entry'
    -- Drop low-signal rows: keep only entries with at least one
    -- signal beyond the all-defaults baseline.
    AND (
      (payload->>'sleepQuality')::numeric  IS DISTINCT FROM 5 OR
      (payload->>'energyLevel')::numeric   IS DISTINCT FROM 5 OR
      (payload->>'recoveryScore')::numeric IS DISTINCT FROM 5 OR
      (payload->>'mood')::numeric          IS DISTINCT FROM 5 OR
      payload->>'weight'      IS NOT NULL OR
      payload->>'body_fat'    IS NOT NULL OR
      payload->>'sleep_hours' IS NOT NULL OR
      payload->>'cycle_id'    IS NOT NULL OR
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
