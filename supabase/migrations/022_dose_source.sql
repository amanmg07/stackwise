-- ============================================================
-- Surface dose `source` (brand / vendor / lab) as a top-level
-- column in research_dose_logs so it's a first-class research
-- variable, not a buried payload field.
--
-- Same compound from different vendors can have wildly
-- different purity, peptide content, and reconstitution
-- behavior. Buyers controlling for vendor effects is a real
-- requirement for any honest research question. Examples:
--
--   SELECT source, AVG(amount) FROM research_dose_logs
--   WHERE peptide_id = 'bpc157' AND source IS NOT NULL
--   GROUP BY source HAVING COUNT(*) >= 10;
--
-- Old dose_logged events (before this commit) have no source
-- in payload; column will return NULL for them.
-- ============================================================

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
  (e.payload->>'source')          AS source
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'dose_logged'
  AND up.research_consent = true;

REVOKE ALL ON research_dose_logs FROM PUBLIC, authenticated, anon;
