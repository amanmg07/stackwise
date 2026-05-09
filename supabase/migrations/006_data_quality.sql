-- ============================================================
-- Phase 4.5: Data quality — keep mistakes and noise out of the
-- buyer-facing dataset.
--
-- Two complementary mechanisms:
--   1. Cascade deletes: when a user deletes a cycle in the app, the
--      app fires a DELETE on the corresponding analytics events. This
--      requires a DELETE policy on analytics_events keyed to anon_id.
--   2. Quality threshold: research_cycles_* views require the cycle
--      to have at least one dose log linked to it. A cycle the user
--      created and never touched is filtered out at the view layer
--      regardless of what got recorded.
-- ============================================================

CREATE POLICY "Users can delete own events"
  ON analytics_events FOR DELETE
  USING (anon_id = auth.uid());

-- Replace cycle views with the quality filter. Cycles with no dose
-- logs are abandoned/mistaken and get filtered out automatically.

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
WHERE e.event_type = 'cycle_created'
  AND up.research_consent = true
  AND EXISTS (
    SELECT 1 FROM analytics_events d
    WHERE d.event_type = 'dose_logged'
      AND d.payload->>'cycle_id' = e.payload->>'cycle_id'
      AND d.anon_id = e.anon_id
  );

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
WHERE e.event_type = 'cycle_ended'
  AND up.research_consent = true
  AND EXISTS (
    SELECT 1 FROM analytics_events d
    WHERE d.event_type = 'dose_logged'
      AND d.payload->>'cycle_id' = e.payload->>'cycle_id'
      AND d.anon_id = e.anon_id
  );

-- Re-apply the lock-down (CREATE OR REPLACE preserves grants but make
-- sure idempotently in case of partial migrations).
REVOKE ALL ON research_cycles_started FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_cycles_ended   FROM PUBLIC, authenticated, anon;
