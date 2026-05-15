-- ============================================================
-- stack_combinations — canonical registry of compound
-- combinations users actually run (architecture-spec gap #4).
--
-- Buyer-facing data product. Same privacy posture as the
-- research_* views: only research_consent = true users, keyed by
-- research_id (never anon_id), REVOKEd from anon/authenticated.
-- It only ever exposes AGGREGATE counts per combination — no
-- per-user rows.
--
-- Composition is the EFFECTIVE composition (latest cycle_created
-- OR cycle_updated per cycle_id), consistent with migrations
-- 025/026 — a cycle edited after creation is reflected here too.
--
-- combination_hash = md5 of the sorted, de-duplicated compound
-- set. It is the cross-user dedup identity: every user running
-- the same set maps to the same row.
--
-- Divergence from the spec, deliberate: the spec writes a row
-- only for cycles with 2+ compounds. We include n=1 (solo) too,
-- per product decision 2026-05-15 (solo-vs-stacked is a useful
-- buyer signal). Empty cycles (n=0) are excluded.
--
-- v1 is intentionally minimal (identity + counts + first/last
-- seen). Richer per-combination metrics (avg duration, side-
-- effect rate, repeat-usage, common goals) are deferred to a v2
-- once cycle_ended / outcome / journal data exists.
--
-- Refresh model: plain view (always fresh, recomputed per
-- query). Upgrade to a materialized view + scheduled refresh
-- when event volume makes per-query recompute expensive — same
-- infra as the still-unbuilt aggregate_insights nightly job
-- (spec gap #2).
--
-- Applied to production project criicsyjvafvgovqlyfq 2026-05-15.
-- ============================================================

CREATE OR REPLACE VIEW public.stack_combinations AS
WITH latest AS (
  SELECT DISTINCT ON ((e.payload ->> 'cycle_id'::text))
         e.anon_id,
         (e.payload ->> 'cycle_id'::text)  AS cycle_id,
         (e.payload -> 'peptide_ids'::text) AS peptide_ids,
         e.created_at                       AS effective_at
  FROM analytics_events e
  WHERE e.event_type = ANY (ARRAY['cycle_created'::text, 'cycle_updated'::text])
    AND (e.payload ? 'cycle_id'::text)
    AND (e.payload -> 'peptide_ids'::text) IS NOT NULL
  ORDER BY (e.payload ->> 'cycle_id'::text), e.created_at DESC
),
norm AS (
  SELECT l.anon_id,
         l.cycle_id,
         l.effective_at,
         ( SELECT jsonb_agg(d.p ORDER BY d.p)
             FROM ( SELECT DISTINCT jsonb_array_elements_text(l.peptide_ids) AS p ) d
         ) AS compounds,
         ( SELECT count(DISTINCT x.x)
             FROM jsonb_array_elements_text(l.peptide_ids) x(x)
         ) AS n_compounds
  FROM latest l
)
SELECT
  md5((n.compounds)::text)        AS combination_hash,
  n.compounds                     AS compounds,
  n.n_compounds                   AS n_compounds,
  count(DISTINCT up.research_id)  AS user_count,
  count(DISTINCT n.cycle_id)      AS cycle_count,
  min(n.effective_at)::date       AS first_seen,
  max(n.effective_at)::date       AS last_seen
FROM norm n
  JOIN user_profiles up ON up.anon_id = n.anon_id
WHERE n.n_compounds >= 1
  AND up.research_consent = true
GROUP BY n.compounds, n.n_compounds;

-- Buyer-facing: nobody but the service role reads this. Same
-- lockdown as the research_* views.
REVOKE ALL ON public.stack_combinations FROM PUBLIC;
REVOKE ALL ON public.stack_combinations FROM authenticated, anon;
