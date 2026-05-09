-- ============================================================
-- Surface adverse events as a queryable row-per-event view.
--
-- The journal events now ship sideEffects as a structured array:
--   [{ effect, severity?, duration? }, ...]
--
-- research_journal_entries already projects this whole array as the
-- side_effects JSONB column — useful for buyers doing aggregate
-- counts. But for safety / pharmacovigilance research, buyers
-- typically want one row per (user, day, effect) so they can group
-- by severity, filter by duration, etc. This view does that
-- explicitly.
--
-- Old entries stored sideEffects as raw strings ["nausea",
-- "headache"]. The unnest below handles both shapes:
--   - object items: extract effect/severity/duration
--   - string items: treat as { effect: <string>, severity: null, duration: null }
-- ============================================================

DROP VIEW IF EXISTS research_adverse_events;
CREATE VIEW research_adverse_events AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  e.created_at::date AS log_date,
  (e.payload->>'cycle_id') AS cycle_id,
  -- Each item in sideEffects becomes its own row.
  -- Use jsonb_typeof to gracefully handle legacy string entries.
  CASE
    WHEN jsonb_typeof(item) = 'string' THEN item #>> '{}'
    ELSE item->>'effect'
  END AS effect,
  CASE
    WHEN jsonb_typeof(item) = 'object' THEN item->>'severity'
    ELSE NULL
  END AS severity,
  CASE
    WHEN jsonb_typeof(item) = 'object' THEN item->>'duration'
    ELSE NULL
  END AS duration,
  e.payload->'activePeptideIds' AS active_peptide_ids
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
CROSS JOIN LATERAL jsonb_array_elements(
  COALESCE(e.payload->'sideEffects', '[]'::jsonb)
) AS item
WHERE e.event_type = 'journal_entry'
  AND up.research_consent = true;

REVOKE ALL ON research_adverse_events FROM PUBLIC, authenticated, anon;
