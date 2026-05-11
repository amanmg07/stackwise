-- ============================================================
-- research_cycle_outcomes — buyer-facing view for standardized
-- check-ins at week 4 / 8 / 12 / 16 of every cycle.
--
-- These structured-interval scores are what makes outcome data
-- scientifically comparable across users. Buyers can finally
-- answer "what does week 8 of compound X look like" cleanly,
-- because every user answers the same questions on the same
-- schedule.
--
-- Filters identical to other research_* views: research_consent
-- required, log_date is date-only, co_medications projected for
-- stratification.
-- ============================================================

DROP VIEW IF EXISTS research_cycle_outcomes;
CREATE VIEW research_cycle_outcomes AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date                         AS log_date,
  (e.payload->>'cycle_id')                   AS cycle_id,
  (e.payload->>'week_number')::int           AS week_number,
  (e.payload->>'overall_score')::numeric     AS overall_score,
  (e.payload->>'goal_progress_score')::numeric AS goal_progress_score,
  (e.payload->>'energy_score')::numeric      AS energy_score,
  (e.payload->>'recovery_score')::numeric    AS recovery_score,
  (e.payload->>'would_repeat')::boolean      AS would_repeat,
  (e.payload->>'side_effect_severity')       AS side_effect_severity,
  e.payload->'side_effects_reported'         AS side_effects
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_outcome'
  AND up.research_consent = true;

REVOKE ALL ON research_cycle_outcomes FROM PUBLIC, authenticated, anon;
