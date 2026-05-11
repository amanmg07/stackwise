-- ============================================================
-- research_chat_queries — buyer-facing view of chat questions
-- with intent category and peptides extracted from the query.
--
-- Source: chat_question events. The query text itself is never
-- stored (privacy posture) — we ship only:
--   - the length of the question (rough complexity proxy)
--   - a keyword-classified category (dosing/stacking/etc.)
--   - peptide_ids mentioned in the query
--   - peptide_ids active in the user's current cycle
--
-- This fills section 7 of the State of Peptides report
-- ("AI Query Insights" — top categories + most-asked compounds).
-- ============================================================

DROP VIEW IF EXISTS research_chat_queries;
CREATE VIEW research_chat_queries AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date                       AS log_date,
  (e.payload->>'query_category')           AS query_category,
  (e.payload->>'question_length')::int     AS question_length,
  e.payload->'peptide_ids_queried'         AS peptide_ids_queried,
  e.payload->'active_peptide_ids'          AS active_peptide_ids
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'chat_question'
  AND up.research_consent = true;

REVOKE ALL ON research_chat_queries FROM PUBLIC, authenticated, anon;
