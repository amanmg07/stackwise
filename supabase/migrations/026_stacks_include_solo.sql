-- ============================================================
-- analytics_insights: also surface single-compound cycles.
--
-- The stacks branch previously required >1 compound, so a cycle
-- run with a single supplement/peptide produced no insight at all.
-- We want that signal too (solo-vs-stacked is a meaningful buyer
-- metric). Threshold lowered to >=1; insight wording adapts:
--   - 1 compound  -> "<compound> run solo by N users"
--   - 2+ compounds -> "Stack [...] used by N users"  (unchanged)
-- Empty cycles (n=0) are still excluded.
--
-- Builds on migration 025 (effective composition: latest
-- cycle_created/cycle_updated per cycle_id, order-normalized +
-- de-duped set, distinct-user counts). Non-destructive
-- CREATE OR REPLACE VIEW; 13 other branches reproduced verbatim.
-- Applied to production project criicsyjvafvgovqlyfq 2026-05-15.
-- ============================================================

CREATE OR REPLACE VIEW public.analytics_insights AS
 SELECT 'dosing'::text AS category,
    ((((((('Average '::text || (analytics_events.payload ->> 'peptide_id'::text)) || ' dose is '::text) || round(avg((analytics_events.payload ->> 'amount'::text)::numeric), 1)) || ' '::text) || (analytics_events.payload ->> 'unit'::text)) || ' ('::text) || count(*)) || ' doses logged)'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events
  WHERE analytics_events.event_type = 'dose_logged'::text
  GROUP BY (analytics_events.payload ->> 'peptide_id'::text), (analytics_events.payload ->> 'unit'::text)
 HAVING count(*) >= 1
UNION ALL
 SELECT 'dosing_by_age'::text AS category,
    (((((('Users aged '::text ||
        CASE
            WHEN up.age < 25 THEN '18-24'::text
            WHEN up.age < 35 THEN '25-34'::text
            WHEN up.age < 45 THEN '35-44'::text
            WHEN up.age < 55 THEN '45-54'::text
            ELSE '55+'::text
        END) || ' average '::text) || round(avg((e.payload ->> 'amount'::text)::numeric), 1)) || ' '::text) || (e.payload ->> 'unit'::text)) || ' of '::text) || (e.payload ->> 'peptide_id'::text) AS insight,
    count(*) AS sample_size
   FROM analytics_events e
     JOIN user_profiles up ON e.anon_id = up.anon_id
  WHERE e.event_type = 'dose_logged'::text AND up.age IS NOT NULL
  GROUP BY (
        CASE
            WHEN up.age < 25 THEN '18-24'::text
            WHEN up.age < 35 THEN '25-34'::text
            WHEN up.age < 45 THEN '35-44'::text
            WHEN up.age < 55 THEN '45-54'::text
            ELSE '55+'::text
        END), (e.payload ->> 'peptide_id'::text), (e.payload ->> 'unit'::text)
 HAVING count(*) >= 1
UNION ALL
 SELECT 'side_effects'::text AS category,
    ((((((((round(100.0 * count(*)::numeric / NULLIF(total.cnt, 0)::numeric, 1) || '% of '::text) || p.peptide_id) || ' users report '::text) || lower(se.effect)) || ' ('::text) || count(*)) || '/'::text) || total.cnt) || ' entries)'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e,
    LATERAL jsonb_array_elements_text(e.payload -> 'activePeptideIds'::text) p(peptide_id),
    LATERAL jsonb_array_elements_text(e.payload -> 'sideEffects'::text) se(effect)
     JOIN LATERAL ( SELECT count(*) AS cnt
           FROM analytics_events e2,
            LATERAL jsonb_array_elements_text(e2.payload -> 'activePeptideIds'::text) p2(peptide_id)
          WHERE e2.event_type = 'journal_entry'::text AND p2.peptide_id = p.peptide_id) total ON true
  WHERE e.event_type = 'journal_entry'::text
  GROUP BY p.peptide_id, se.effect, total.cnt
 HAVING count(*) >= 1
UNION ALL
 SELECT 'outcomes'::text AS category,
    ((((((((('Users on '::text || p.peptide_id) || ' report avg '::text) || round(avg((e.payload ->> 'sleepQuality'::text)::numeric), 1)) || '/10 sleep, '::text) || round(avg((e.payload ->> 'energyLevel'::text)::numeric), 1)) || '/10 energy, '::text) || round(avg((e.payload ->> 'recoveryScore'::text)::numeric), 1)) || '/10 recovery, '::text) || round(avg((e.payload ->> 'mood'::text)::numeric), 1)) || '/10 mood'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e,
    LATERAL jsonb_array_elements_text(e.payload -> 'activePeptideIds'::text) p(peptide_id)
  WHERE e.event_type = 'journal_entry'::text
  GROUP BY p.peptide_id
 HAVING count(*) >= 1
UNION ALL
 SELECT 'weight'::text AS category,
    ((((('Users on '::text || sub.peptide_id) || ' average '::text) ||
        CASE
            WHEN sub.avg_change < 0::numeric THEN round(abs(sub.avg_change), 1) || ' lbs lost'::text
            ELSE round(sub.avg_change, 1) || ' lbs gained'::text
        END) || ' per week ('::text) || sub.user_count) || ' users)'::text AS insight,
    sub.user_count AS sample_size
   FROM ( SELECT p.peptide_id,
            avg(wd.weight_delta / NULLIF(wd.day_span, 0::numeric) * 7::numeric) AS avg_change,
            count(DISTINCT e.anon_id) AS user_count
           FROM ( SELECT analytics_events.anon_id,
                    last_value((analytics_events.payload ->> 'weight'::text)::numeric) OVER w - first_value((analytics_events.payload ->> 'weight'::text)::numeric) OVER w AS weight_delta,
                    EXTRACT(epoch FROM max(analytics_events.created_at) OVER (PARTITION BY analytics_events.anon_id) - min(analytics_events.created_at) OVER (PARTITION BY analytics_events.anon_id)) / 86400::numeric AS day_span
                   FROM analytics_events
                  WHERE analytics_events.event_type = 'journal_entry'::text AND (analytics_events.payload ->> 'weight'::text) IS NOT NULL
                  WINDOW w AS (PARTITION BY analytics_events.anon_id ORDER BY analytics_events.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)) wd
             JOIN analytics_events e ON e.anon_id = wd.anon_id AND e.event_type = 'journal_entry'::text,
            LATERAL jsonb_array_elements_text(e.payload -> 'activePeptideIds'::text) p(peptide_id)
          WHERE wd.day_span >= 7::numeric
          GROUP BY p.peptide_id
         HAVING count(DISTINCT e.anon_id) >= 1) sub
UNION ALL
 SELECT 'retention'::text AS category,
    ((((((p.peptide_id || ': avg cycle '::text) || round(avg((e.payload ->> 'durationDays'::text)::numeric))) || ' days, '::text) || round(100.0 * count(*) FILTER (WHERE (e.payload ->> 'reason'::text) <> 'completed'::text)::numeric / NULLIF(count(*), 0)::numeric, 0)) || '% ended early ('::text) || count(*)) || ' cycles)'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e,
    LATERAL jsonb_array_elements_text(e.payload -> 'peptideIds'::text) p(peptide_id)
  WHERE e.event_type = 'cycle_ended'::text
  GROUP BY p.peptide_id
 HAVING count(*) >= 1
UNION ALL
 SELECT 'stacks'::text AS category,
    CASE
        WHEN norm.n_compounds = 1 THEN ((((norm.peptide_set ->> 0) || ' run solo by '::text) || count(DISTINCT norm.anon_id)) || ' users'::text)
        ELSE ((('Stack '::text || (norm.peptide_set)::text) || ' used by '::text) || count(DISTINCT norm.anon_id)) || ' users'::text
    END AS insight,
    count(DISTINCT norm.anon_id) AS sample_size
   FROM ( SELECT latest.anon_id,
            ( SELECT jsonb_agg(d.p ORDER BY d.p) AS jsonb_agg
                   FROM ( SELECT DISTINCT jsonb_array_elements_text(latest.peptide_ids) AS p) d) AS peptide_set,
            ( SELECT count(DISTINCT x.x) AS count
                   FROM jsonb_array_elements_text(latest.peptide_ids) x(x)) AS n_compounds
           FROM ( SELECT DISTINCT ON ((e.payload ->> 'cycle_id'::text)) e.anon_id,
                    e.payload -> 'peptide_ids'::text AS peptide_ids
                   FROM analytics_events e
                  WHERE e.event_type = ANY (ARRAY['cycle_created'::text, 'cycle_updated'::text])
                    AND (e.payload ? 'cycle_id'::text)
                    AND (e.payload -> 'peptide_ids'::text) IS NOT NULL
                  ORDER BY (e.payload ->> 'cycle_id'::text), e.created_at DESC) latest) norm
  WHERE norm.n_compounds >= 1
  GROUP BY norm.peptide_set, norm.n_compounds
 HAVING count(DISTINCT norm.anon_id) >= 1
UNION ALL
 SELECT 'demographics'::text AS category,
    ((((up.gender || ' users prefer '::text) || p.peptide_id) || ' ('::text) || count(*)) || ' cycles)'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e
     JOIN user_profiles up ON e.anon_id = up.anon_id,
    LATERAL jsonb_array_elements_text(e.payload -> 'peptide_ids'::text) p(peptide_id)
  WHERE e.event_type = 'cycle_created'::text AND up.gender IS NOT NULL
  GROUP BY up.gender, p.peptide_id
 HAVING count(*) >= 1
UNION ALL
 SELECT 'demographics'::text AS category,
    ((((
        CASE
            WHEN up.age < 25 THEN '18-24'::text
            WHEN up.age < 35 THEN '25-34'::text
            WHEN up.age < 45 THEN '35-44'::text
            WHEN up.age < 55 THEN '45-54'::text
            ELSE '55+'::text
        END || ' age group: '::text) || p.peptide_id) || ' used by '::text) || count(*)) || ' users'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e
     JOIN user_profiles up ON e.anon_id = up.anon_id,
    LATERAL jsonb_array_elements_text(e.payload -> 'peptide_ids'::text) p(peptide_id)
  WHERE e.event_type = 'cycle_created'::text AND up.age IS NOT NULL
  GROUP BY (
        CASE
            WHEN up.age < 25 THEN '18-24'::text
            WHEN up.age < 35 THEN '25-34'::text
            WHEN up.age < 45 THEN '35-44'::text
            WHEN up.age < 55 THEN '45-54'::text
            ELSE '55+'::text
        END), p.peptide_id
 HAVING count(*) >= 1
UNION ALL
 SELECT 'scan_outcomes'::text AS category,
    (((((((('AI scan comparisons show avg '::text || round(avg((e.payload ->> 'changesImproved'::text)::numeric), 1)) || ' improvements and '::text) || round(avg((e.payload ->> 'changesWorsened'::text)::numeric), 1)) || ' regressions per scan'::text) || ' (avg '::text) || round(avg((e.payload ->> 'daysBetween'::text)::numeric))) || ' days apart, '::text) || count(*)) || ' comparisons)'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e
  WHERE e.event_type = 'scan_compared'::text
 HAVING count(*) >= 1
UNION ALL
 SELECT 'scan_outcomes'::text AS category,
    ((wp.peptide_id || ' shows visible improvement in '::text) || count(*)) || ' scan comparisons'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e,
    LATERAL jsonb_array_elements_text(e.payload -> 'workingPeptideIds'::text) wp(peptide_id)
  WHERE e.event_type = 'scan_compared'::text
  GROUP BY wp.peptide_id
 HAVING count(*) >= 1
UNION ALL
 SELECT 'market'::text AS category,
    ((((g.goal || ' is a goal for '::text) || round(100.0 * count(*)::numeric / NULLIF(( SELECT count(*) AS count
           FROM user_profiles), 0)::numeric, 1)) || '% of users ('::text) || count(*)) || ' users)'::text AS insight,
    count(*) AS sample_size
   FROM user_profiles up,
    LATERAL unnest(up.goals) g(goal)
  GROUP BY g.goal
 HAVING count(*) >= 1
UNION ALL
 SELECT 'market'::text AS category,
    ((((
        CASE user_profiles.experience_level
            WHEN 'new'::text THEN 'Beginners'::text
            WHEN 'some'::text THEN 'Intermediate users'::text
            WHEN 'experienced'::text THEN 'Advanced users'::text
            ELSE NULL::text
        END || ' make up '::text) || round(100.0 * count(*)::numeric / NULLIF(( SELECT count(*) AS count
           FROM user_profiles user_profiles_1), 0)::numeric, 1)) || '% of the user base ('::text) || count(*)) || ' users)'::text AS insight,
    count(*) AS sample_size
   FROM user_profiles
  WHERE user_profiles.experience_level IS NOT NULL
  GROUP BY user_profiles.experience_level
UNION ALL
 SELECT 'retention'::text AS category,
    ((((((((p.peptide_id || ': '::text) || round(100.0 * count(*) FILTER (WHERE (e.payload ->> 'reason'::text) = 'side_effects'::text)::numeric / NULLIF(count(*), 0)::numeric, 0)) || '% stopped for side effects, '::text) || round(100.0 * count(*) FILTER (WHERE (e.payload ->> 'reason'::text) = 'goal_achieved'::text)::numeric / NULLIF(count(*), 0)::numeric, 0)) || '% reached their goal, '::text) || round(100.0 * count(*) FILTER (WHERE (e.payload ->> 'reason'::text) = 'cost'::text)::numeric / NULLIF(count(*), 0)::numeric, 0)) || '% stopped for cost ('::text) || count(*)) || ' cycles)'::text AS insight,
    count(*) AS sample_size
   FROM analytics_events e,
    LATERAL jsonb_array_elements_text(e.payload -> 'peptideIds'::text) p(peptide_id)
  WHERE e.event_type = 'cycle_ended'::text AND ((e.payload ->> 'reason'::text) = ANY (ARRAY['side_effects'::text, 'goal_achieved'::text, 'cost'::text, 'other'::text]))
  GROUP BY p.peptide_id
 HAVING count(*) >= 1;
