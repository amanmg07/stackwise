-- ============================================================
-- research_bloodwork — buyer-facing view of lab biomarker data.
--
-- Each row is one bloodwork snapshot. Numeric columns project the
-- payload values directly; the unit for each column is fixed (see
-- the Bloodwork interface in src/types/index.ts) so values are
-- directly comparable across users.
--
-- Filters identical to other research_* views: research_consent
-- required, log_date is date-only.
-- ============================================================

DROP VIEW IF EXISTS research_bloodwork;
CREATE VIEW research_bloodwork AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  -- Date the blood was actually drawn (from the user, not the event ts).
  (e.payload->>'drawn_on')::date            AS drawn_on,
  e.created_at::date                        AS log_date,
  (e.payload->>'cycle_id')                  AS cycle_id,
  (e.payload->>'lab_name')                  AS lab_name,
  -- Hormones
  (e.payload->>'testosterone_total')::numeric AS testosterone_total_ng_dl,
  (e.payload->>'testosterone_free')::numeric  AS testosterone_free_pg_ml,
  (e.payload->>'estradiol')::numeric          AS estradiol_pg_ml,
  (e.payload->>'shbg')::numeric               AS shbg_nmol_l,
  (e.payload->>'igf1')::numeric               AS igf1_ng_ml,
  (e.payload->>'tsh')::numeric                AS tsh_miu_l,
  -- Metabolic
  (e.payload->>'hba1c')::numeric              AS hba1c_pct,
  (e.payload->>'fasting_glucose')::numeric    AS fasting_glucose_mg_dl,
  (e.payload->>'fasting_insulin')::numeric    AS fasting_insulin_uiu_ml,
  -- Lipids
  (e.payload->>'total_cholesterol')::numeric  AS total_cholesterol_mg_dl,
  (e.payload->>'ldl')::numeric                AS ldl_mg_dl,
  (e.payload->>'hdl')::numeric                AS hdl_mg_dl,
  (e.payload->>'triglycerides')::numeric      AS triglycerides_mg_dl,
  -- Inflammation
  (e.payload->>'hs_crp')::numeric             AS hs_crp_mg_l,
  -- Liver / kidney
  (e.payload->>'alt')::numeric                AS alt_u_l,
  (e.payload->>'ast')::numeric                AS ast_u_l,
  (e.payload->>'creatinine')::numeric         AS creatinine_mg_dl
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'bloodwork_logged'
  AND up.research_consent = true;

REVOKE ALL ON research_bloodwork FROM PUBLIC, authenticated, anon;
