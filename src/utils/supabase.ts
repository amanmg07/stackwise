import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
// RN's built-in fetch buffers the whole body — expo/fetch exposes a
// real ReadableStream, which we need to stream the AI chat response.
import { fetch as expoFetch } from "expo/fetch";

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
  // Ensure we have a valid anonymous session before calling the proxy
  await ensureAuth();
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
    if (__DEV__) console.error(`Groq proxy error ${response.status}:`, errText);
    Sentry.captureException(new Error(`Groq proxy error: ${response.status}`), {
      extra: { status: response.status, body: errText },
    });
    throw new Error("AI request failed. Please try again.");
  }

  return response.json();
}

/**
 * Streaming variant of callGroqProxy. Uses expo/fetch to consume the
 * proxy's SSE passthrough, parses OpenAI-style `data: {delta}` chunks,
 * invokes onDelta with each text fragment, and resolves with the full
 * accumulated text. Auth / 429 / network handling mirrors callGroqProxy.
 */
export async function streamGroqProxy(
  body: Record<string, any>,
  onDelta: (text: string) => void,
): Promise<string> {
  await ensureAuth();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  let response: any;
  try {
    response = await expoFetch(`${SUPABASE_URL}/functions/v1/groq-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ ...body, stream: true }),
    });
  } catch (err: any) {
    if (err instanceof TypeError || /network/i.test(err?.message ?? "")) {
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
    if (__DEV__) console.error(`Groq proxy stream error ${response.status}:`, errText);
    Sentry.captureException(new Error(`Groq proxy stream error: ${response.status}`), {
      extra: { status: response.status, body: errText },
    });
    throw new Error("AI request failed. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE events are newline-delimited. Keep the last (possibly
    // partial) line buffered until the next chunk completes it so we
    // never JSON.parse a half-written event.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta: string | undefined = json?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        // Keep-alive / unparseable partial — safe to skip.
      }
    }
  }
  return full;
}

/** Right-of-access: fetch all server-side data StackWise has on the current user. */
export async function exportUserData(): Promise<any> {
  await ensureAuth();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in.");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/data-export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });
  if (!response.ok) {
    const errText = await response.text();
    Sentry.captureException(new Error(`data-export error: ${response.status}`), {
      extra: { status: response.status, body: errText },
    });
    throw new Error("Couldn't export data right now. Please try again.");
  }
  return response.json();
}

/** Right-of-erasure: wipe all server-side data + the auth user, sign out. */
export async function deleteServerData(): Promise<void> {
  await ensureAuth();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in.");

  const response = await fetch(`${SUPABASE_URL}/functions/v1/data-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });
  if (!response.ok) {
    const errText = await response.text();
    Sentry.captureException(new Error(`data-delete error: ${response.status}`), {
      extra: { status: response.status, body: errText },
    });
    throw new Error("Couldn't delete data right now. Please try again.");
  }
  // Sign out the local session — the auth.users row no longer exists.
  await supabase.auth.signOut();
}
