// Edge function: data-delete
//
// Wipes the calling user's complete server-side footprint:
//   1. analytics_events rows (CASCADE from auth.users delete also
//      handles this, but we delete explicitly first to keep the order
//      deterministic and the audit trail explicit).
//   2. user_profiles row (also CASCADEs, but explicit).
//   3. The auth.users row itself, which signs the user out.
//
// After calling this, the client should clear local storage and
// re-run onboarding. ensureAuth() will create a fresh anonymous user
// with a brand-new anon_id, fully decoupled from the deleted record.
//
// This fulfills the GDPR/CCPA right of erasure.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Deletion is destructive and irreversible. Cap aggressively so an
// accidental loop or a malicious request can't repeatedly hammer it.
// 3/hr is generous for a real human use case while making attack
// noise visible.
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000;
const deleteRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = deleteRateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    deleteRateLimits.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
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

    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Maximum ${RATE_LIMIT} delete requests per hour.` }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Order: events → profile → auth user. Each individual delete
    // also CASCADEs, but we want this to be readable in the audit log.
    const { error: eventsError } = await admin
      .from("analytics_events")
      .delete()
      .eq("anon_id", user.id);
    if (eventsError) throw eventsError;

    const { error: profileError } = await admin
      .from("user_profiles")
      .delete()
      .eq("anon_id", user.id);
    if (profileError) throw profileError;

    // Delete the auth user. This signs them out — any in-flight client
    // tokens become 401s on next request.
    const { error: userError } = await admin.auth.admin.deleteUser(user.id);
    if (userError) throw userError;

    return new Response(JSON.stringify({ deleted: true, anon_id: user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("data-delete error:", e?.message || e);
    return new Response(JSON.stringify({ error: "Internal server error", detail: e?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
