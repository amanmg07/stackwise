-- ============================================================
-- Journal polish: side_effects shape normalization + legacy
-- entry cleanup.
--
-- Two changes:
--
-- 1. research_journal_entries.side_effects is rebuilt to ALWAYS
--    return [{effect, severity?, duration?}, ...] regardless of
--    whether the underlying payload uses the legacy string[]
--    shape or the new structured shape.
--
--    Why: pre-May 10 2026 entries stored side effects as
--    ["nausea", "headache"]; newer entries store
--    [{effect: "nausea", severity: "mild"}, ...]. A buyer
--    parsing the column directly hits an inconsistent JSONB
--    type. The research_adverse_events view already handled
--    this gracefully, but the journal view passed through
--    whatever shape it found. Normalize at the view layer so
--    downstream code never has to branch.
--
-- 2. Drop journal_entry events that pre-date the cascade-delete
--    work (commit d1c0837). These have no journal_entry_id in
--    payload, so if the user deletes that entry locally the
--    cascade can't find it. Easier to clear them out now —
--    they're test data from before the schema lock.
-- ============================================================

-- Clean up legacy journal events that can't be cascade-deleted.
DELETE FROM analytics_events
WHERE event_type = 'journal_entry'
  AND payload->>'journal_entry_id' IS NULL;

-- Rebuild the view with side_effects normalized.
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
  -- Coerce side effects to the structured shape regardless of
  -- how the original payload stored them. Strings become
  -- {effect: <string>}; objects pass through unchanged.
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
    -- Same low-signal filter as migration 014: drop entries with
    -- all defaults and no extras.
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
