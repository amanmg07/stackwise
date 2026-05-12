-- Per-cycle goal becomes multi-select. The cycle_created event payload now
-- emits `goals` (a JSON array of strings) instead of `goal` (a single string).
--
-- Update research_cycles_started to project goals as text[], with a back-compat
-- fallback for older events that still carry `goal`. Keep a single-goal column
-- for analyses that want a primary goal (first element of the array).

DROP VIEW IF EXISTS research_cycles_started;
CREATE VIEW research_cycles_started AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date                  AS log_date,
  (e.payload->>'cycle_id')            AS cycle_id,
  (e.payload->>'name')                AS cycle_name,
  COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(e.payload->'goals')),
    CASE WHEN e.payload ? 'goal' THEN ARRAY[e.payload->>'goal'] ELSE ARRAY[]::text[] END
  )                                    AS goals,
  COALESCE(
    (e.payload->'goals'->>0),
    (e.payload->>'goal')
  )                                    AS primary_goal,
  (e.payload->>'duration_weeks')::int AS duration_weeks,
  (e.payload->>'template_id')         AS template_id,
  (e.payload->>'source_scan_id')      AS source_scan_id,
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

REVOKE ALL ON research_cycles_started FROM PUBLIC, authenticated, anon;
