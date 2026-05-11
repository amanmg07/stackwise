-- ============================================================
-- Granular cycle end reasons.
--
-- The cycle_ended event's `reason` field used to be a binary
-- `completed | ended_early`. We've widened it to five values:
--
--   completed       — natural end (today >= plannedEnd)
--   side_effects    — user stopped because of adverse events
--   goal_achieved   — early success
--   cost            — couldn't afford to continue
--   other           — fallback for anything else
--
-- Legacy events still carry `ended_early`; treat them as
-- "early stop, reason unspecified." This migration refreshes
-- two surfaces:
--
-- 1. research_cycles_ended — no schema change needed (reason
--    is already projected as TEXT), but re-declared here so
--    the view definition is colocated with the new spec.
--
-- 2. analytics_insights section 6 — the "% ended early"
--    computation was hardcoded to compare against
--    `reason = 'ended_early'`. With the new enum that's wrong
--    (most early stops will now have a specific reason).
--    Replace with `reason != 'completed'` so any non-completion
--    counts as an early stop, regardless of the specific
--    reason. The view continues to show the same metric;
--    individual reason breakdowns can be queried directly
--    from research_cycles_ended.
-- ============================================================

-- (1) research_cycles_ended is unchanged structurally — the
-- reason column already projects payload->>'reason' as TEXT.
-- No DDL needed. Documenting the contract here for clarity.

-- (2) Refresh the analytics_insights view so the "ended early"
-- bucket includes all non-completed values. We recreate the
-- whole view (Postgres CREATE OR REPLACE requires matching
-- column shape, which UNION ALL views can be picky about, so
-- we DROP + CREATE for safety).

DROP VIEW IF EXISTS analytics_insights;

CREATE VIEW analytics_insights AS

-- 1. Average dose by peptide
SELECT 'dosing' AS category,
  'Average ' || (payload->>'peptide_id') || ' dose is ' ||
  ROUND(AVG((payload->>'amount')::numeric), 1) || ' ' || (payload->>'unit') ||
  ' (' || COUNT(*) || ' doses logged)' AS insight,
  COUNT(*) AS sample_size
FROM analytics_events
WHERE event_type = 'dose_logged'
GROUP BY (payload->>'peptide_id'), (payload->>'unit')
HAVING COUNT(*) >= 1

UNION ALL

-- 2. Dose by peptide by age bracket
SELECT 'dosing_by_age',
  'Users aged ' ||
  CASE WHEN up.age < 25 THEN '18-24' WHEN up.age < 35 THEN '25-34'
       WHEN up.age < 45 THEN '35-44' WHEN up.age < 55 THEN '45-54' ELSE '55+' END ||
  ' average ' || ROUND(AVG((e.payload->>'amount')::numeric), 1) || ' ' || (e.payload->>'unit') ||
  ' of ' || (e.payload->>'peptide_id'),
  COUNT(*)
FROM analytics_events e
JOIN user_profiles up ON e.anon_id = up.anon_id
WHERE e.event_type = 'dose_logged' AND up.age IS NOT NULL
GROUP BY CASE WHEN up.age < 25 THEN '18-24' WHEN up.age < 35 THEN '25-34'
              WHEN up.age < 45 THEN '35-44' WHEN up.age < 55 THEN '45-54' ELSE '55+' END,
         (e.payload->>'peptide_id'), (e.payload->>'unit')
HAVING COUNT(*) >= 1

UNION ALL

-- 3. Side effect rates by peptide
SELECT 'side_effects',
  ROUND(100.0 * COUNT(*) / NULLIF(total.cnt, 0), 1) || '% of ' || p.peptide_id ||
  ' users report ' || LOWER(se.effect) ||
  ' (' || COUNT(*) || '/' || total.cnt || ' entries)',
  COUNT(*)
FROM analytics_events e,
  jsonb_array_elements_text(e.payload->'activePeptideIds') AS p(peptide_id),
  jsonb_array_elements_text(e.payload->'sideEffects') AS se(effect)
JOIN LATERAL (
  SELECT COUNT(*) AS cnt FROM analytics_events e2,
    jsonb_array_elements_text(e2.payload->'activePeptideIds') AS p2(peptide_id)
  WHERE e2.event_type = 'journal_entry' AND p2.peptide_id = p.peptide_id
) total ON true
WHERE e.event_type = 'journal_entry'
GROUP BY p.peptide_id, se.effect, total.cnt
HAVING COUNT(*) >= 1

UNION ALL

-- 4. Average metrics by peptide
SELECT 'outcomes',
  'Users on ' || p.peptide_id || ' report avg ' ||
  ROUND(AVG((e.payload->>'sleepQuality')::numeric), 1) || '/10 sleep, ' ||
  ROUND(AVG((e.payload->>'energyLevel')::numeric), 1) || '/10 energy, ' ||
  ROUND(AVG((e.payload->>'recoveryScore')::numeric), 1) || '/10 recovery, ' ||
  ROUND(AVG((e.payload->>'mood')::numeric), 1) || '/10 mood',
  COUNT(*)
FROM analytics_events e,
  jsonb_array_elements_text(e.payload->'activePeptideIds') AS p(peptide_id)
WHERE e.event_type = 'journal_entry'
GROUP BY p.peptide_id
HAVING COUNT(*) >= 1

UNION ALL

-- 5. Weight change by peptide
SELECT 'weight',
  'Users on ' || sub.peptide_id || ' average ' ||
  CASE WHEN sub.avg_change < 0 THEN ROUND(ABS(sub.avg_change), 1) || ' lbs lost'
       ELSE ROUND(sub.avg_change, 1) || ' lbs gained' END ||
  ' per week (' || sub.user_count || ' users)',
  sub.user_count
FROM (
  SELECT p.peptide_id,
    AVG(weight_delta / NULLIF(day_span, 0) * 7) AS avg_change,
    COUNT(DISTINCT e.anon_id) AS user_count
  FROM (
    SELECT anon_id,
      (last_value((payload->>'weight')::numeric) OVER w - first_value((payload->>'weight')::numeric) OVER w) AS weight_delta,
      EXTRACT(EPOCH FROM (MAX(created_at) OVER (PARTITION BY anon_id) - MIN(created_at) OVER (PARTITION BY anon_id))) / 86400 AS day_span
    FROM analytics_events
    WHERE event_type = 'journal_entry' AND (payload->>'weight') IS NOT NULL
    WINDOW w AS (PARTITION BY anon_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
  ) wd
  JOIN analytics_events e ON e.anon_id = wd.anon_id AND e.event_type = 'journal_entry',
    jsonb_array_elements_text(e.payload->'activePeptideIds') AS p(peptide_id)
  WHERE wd.day_span >= 7
  GROUP BY p.peptide_id
  HAVING COUNT(DISTINCT e.anon_id) >= 1
) sub

UNION ALL

-- 6. Cycle duration + abandonment by peptide
-- Changed: "ended early" now counts ANY non-completed reason
-- (was hardcoded to 'ended_early' before the enum widened).
SELECT 'retention',
  p.peptide_id || ': avg cycle ' || ROUND(AVG((e.payload->>'durationDays')::numeric)) || ' days, ' ||
  ROUND(100.0 * COUNT(*) FILTER (WHERE (e.payload->>'reason') != 'completed') / NULLIF(COUNT(*), 0), 0) ||
  '% ended early (' || COUNT(*) || ' cycles)',
  COUNT(*)
FROM analytics_events e,
  jsonb_array_elements_text(e.payload->'peptideIds') AS p(peptide_id)
WHERE e.event_type = 'cycle_ended'
GROUP BY p.peptide_id
HAVING COUNT(*) >= 1

UNION ALL

-- 7. Most popular peptide stacks
SELECT 'stacks',
  'Stack ' || (e.payload->'peptide_ids')::text || ' used by ' || COUNT(*) || ' users',
  COUNT(*)
FROM analytics_events e
WHERE e.event_type = 'cycle_created'
  AND jsonb_array_length(e.payload->'peptide_ids') > 1
GROUP BY (e.payload->'peptide_ids')
HAVING COUNT(*) >= 1

UNION ALL

-- 8. Peptide popularity by gender
SELECT 'demographics',
  up.gender || ' users prefer ' || p.peptide_id ||
  ' (' || COUNT(*) || ' cycles)',
  COUNT(*)
FROM analytics_events e
JOIN user_profiles up ON e.anon_id = up.anon_id,
  jsonb_array_elements_text(e.payload->'peptide_ids') AS p(peptide_id)
WHERE e.event_type = 'cycle_created' AND up.gender IS NOT NULL
GROUP BY up.gender, p.peptide_id
HAVING COUNT(*) >= 1

UNION ALL

-- 9. Peptide popularity by age bracket
SELECT 'demographics',
  CASE WHEN up.age < 25 THEN '18-24' WHEN up.age < 35 THEN '25-34'
       WHEN up.age < 45 THEN '35-44' WHEN up.age < 55 THEN '45-54' ELSE '55+' END ||
  ' age group: ' || p.peptide_id || ' used by ' || COUNT(*) || ' users',
  COUNT(*)
FROM analytics_events e
JOIN user_profiles up ON e.anon_id = up.anon_id,
  jsonb_array_elements_text(e.payload->'peptide_ids') AS p(peptide_id)
WHERE e.event_type = 'cycle_created' AND up.age IS NOT NULL
GROUP BY CASE WHEN up.age < 25 THEN '18-24' WHEN up.age < 35 THEN '25-34'
              WHEN up.age < 45 THEN '35-44' WHEN up.age < 55 THEN '45-54' ELSE '55+' END,
         p.peptide_id
HAVING COUNT(*) >= 1

UNION ALL

-- 10. Scan improvement rates
SELECT 'scan_outcomes',
  'AI scan comparisons show avg ' ||
  ROUND(AVG((e.payload->>'changesImproved')::numeric), 1) || ' improvements and ' ||
  ROUND(AVG((e.payload->>'changesWorsened')::numeric), 1) || ' regressions per scan' ||
  ' (avg ' || ROUND(AVG((e.payload->>'daysBetween')::numeric)) || ' days apart, ' ||
  COUNT(*) || ' comparisons)',
  COUNT(*)
FROM analytics_events e
WHERE e.event_type = 'scan_compared'
HAVING COUNT(*) >= 1

UNION ALL

-- 11. Which peptides show visible results in scans
SELECT 'scan_outcomes',
  wp.peptide_id || ' shows visible improvement in ' || COUNT(*) || ' scan comparisons',
  COUNT(*)
FROM analytics_events e,
  jsonb_array_elements_text(e.payload->'workingPeptideIds') AS wp(peptide_id)
WHERE e.event_type = 'scan_compared'
GROUP BY wp.peptide_id
HAVING COUNT(*) >= 1

UNION ALL

-- 12. Goal distribution
SELECT 'market',
  g.goal || ' is a goal for ' ||
  ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM user_profiles), 0), 1) ||
  '% of users (' || COUNT(*) || ' users)',
  COUNT(*)
FROM user_profiles up, unnest(up.goals) AS g(goal)
GROUP BY g.goal
HAVING COUNT(*) >= 1

UNION ALL

-- 13. Experience level distribution
SELECT 'market',
  CASE experience_level
    WHEN 'new' THEN 'Beginners'
    WHEN 'some' THEN 'Intermediate users'
    WHEN 'experienced' THEN 'Advanced users'
  END || ' make up ' ||
  ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM user_profiles), 0), 1) ||
  '% of the user base (' || COUNT(*) || ' users)',
  COUNT(*)
FROM user_profiles
WHERE experience_level IS NOT NULL
GROUP BY experience_level

UNION ALL

-- 14. NEW: end-reason breakdown by peptide
-- Per-peptide breakdown of WHY cycles end. Lets buyers see "23%
-- of users on retatrutide ended due to side_effects" vs goal/cost
-- distinctions. Surfaces nothing for legacy ended_early rows.
SELECT 'retention',
  p.peptide_id || ': ' ||
  ROUND(100.0 * COUNT(*) FILTER (WHERE (e.payload->>'reason') = 'side_effects')
        / NULLIF(COUNT(*), 0), 0) || '% stopped for side effects, ' ||
  ROUND(100.0 * COUNT(*) FILTER (WHERE (e.payload->>'reason') = 'goal_achieved')
        / NULLIF(COUNT(*), 0), 0) || '% reached their goal, ' ||
  ROUND(100.0 * COUNT(*) FILTER (WHERE (e.payload->>'reason') = 'cost')
        / NULLIF(COUNT(*), 0), 0) || '% stopped for cost (' || COUNT(*) || ' cycles)',
  COUNT(*)
FROM analytics_events e,
  jsonb_array_elements_text(e.payload->'peptideIds') AS p(peptide_id)
WHERE e.event_type = 'cycle_ended'
  AND (e.payload->>'reason') IN ('side_effects', 'goal_achieved', 'cost', 'other')
GROUP BY p.peptide_id
HAVING COUNT(*) >= 1;
