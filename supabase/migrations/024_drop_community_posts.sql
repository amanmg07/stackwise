-- ============================================================
-- Drop community_posts.
--
-- This table was never created by a migration — it was added
-- out-of-band when StackWise briefly explored a shared-protocols
-- ("community") feature. That feature is no longer part of the
-- product, the table was empty (0 rows), had no inbound foreign
-- keys, and nothing in the app references it.
--
-- Recorded here so the repo's migration history reflects the live
-- schema instead of carrying silent drift. Already executed
-- against the production project (criicsyjvafvgovqlyfq) on
-- 2026-05-15; this makes any other environment converge.
-- ============================================================

DROP TABLE IF EXISTS public.community_posts;
