// Edge function: data-export
//
// Returns the calling user's complete server-side data as JSON.
// This fulfills the GDPR/CCPA right of access — a user can request
// a copy of every record we hold about them.
//
// Auth: requires a valid Supabase JWT (sent in Authorization header).
// We extract the user from the JWT, then use the service-role client
// to gather data from all tables the user has rows in.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Per-user in-memory rate limit. Export is heavier than a normal API
// call (full table scan + JSON stringify), so cap aggressively. The
// map only lives for the lifetime of the edge function instance, so
// it's a soft cap — adequate for stopping a single user from
// hammering it but not a hard guarantee across cold starts.
const RATE_LIMIT = 5;                         // exports per window
const RATE_WINDOW = 60 * 60 * 1000;           // 1 hour
const exportRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = exportRateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    exportRateLimits.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify the caller via their JWT.
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Per-user rate limit.
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Maximum ${RATE_LIMIT} exports per hour.` }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Use service role to gather data — bypasses RLS so we can
    //    read the user's profile (column-level grants restrict
    //    research_id from the client even via SELECT *).
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await admin
      .from("user_profiles")
      .select("anon_id, age, gender, goals, experience_level, analytics_consent, research_consent, research_consent_at, co_medications, co_medications_other, created_at, updated_at")
      .eq("anon_id", user.id)
      .maybeSingle();

    const { data: events } = await admin
      .from("analytics_events")
      .select("event_type, payload, created_at")
      .eq("anon_id", user.id)
      .order("created_at", { ascending: true });

    const exportPayload = {
      exported_at: new Date().toISOString(),
      anon_id: user.id,
      profile: profile || null,
      events: events || [],
      event_count: events?.length || 0,
      // Note: we do NOT include research_id in exports. It's a
      // server-internal handle for buyers, not user-facing.
      notes: [
        "This export contains all data StackWise has stored about you on its servers.",
        "Photos, free-text journal notes, and chat messages are stored only on your device — they are NOT in this file because we never receive them.",
      ],
    };

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("data-export error:", e?.message || e);
    return new Response(JSON.stringify({ error: "Internal server error", detail: e?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
