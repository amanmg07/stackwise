import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";

const SUPABASE_URL = "https://criicsyjvafvgovqlyfq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6dTbsxk9pihCtDg9UeRv7A_enUqKseV";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** Ensure the user is signed in anonymously. Returns the user ID. */
export async function ensureAuth(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user!.id;
}

/** Get the current user ID if signed in. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

/** Call Groq via the Supabase Edge Function proxy. */
export async function callGroqProxy(body: Record<string, any>): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/groq-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // fetch throws TypeError on network failure (airplane mode, no Wi-Fi, etc.)
    if (
      err instanceof TypeError ||
      /network/i.test(err?.message ?? "")
    ) {
      throw new Error(
        "No internet connection. Please check your network and try again."
      );
    }
    throw err;
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit reached. Wait a moment and try again.");
    }
    const errText = await response.text();
    Sentry.captureException(new Error(`Groq proxy error: ${response.status}`), {
      extra: { status: response.status, body: errText },
    });
    throw new Error("AI request failed. Please try again.");
  }

  return response.json();
}
