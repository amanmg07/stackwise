-- ============================================================
-- Add source_scan_id to research_cycles_started so buyers can
-- compute the Self Scan → Cycle conversion funnel:
--
--   SELECT
--     COUNT(*) FILTER (WHERE source_scan_id IS NOT NULL) AS scan_started,
--     COUNT(*) AS total_cycles,
--     ROUND(100.0 * COUNT(*) FILTER (WHERE source_scan_id IS NOT NULL)
--           / NULLIF(COUNT(*), 0), 1) AS pct_from_scan
--   FROM research_cycles_started;
--
-- Also useful for outcome attribution: "of cycles that started from
-- Self Scan, what's the typical adherence?" (join to cycles_ended).
-- ============================================================

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
  (e.payload->>'goal')                AS goal,
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
