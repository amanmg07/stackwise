import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

/** Upload a profile image to Supabase Storage and return the public URL. */
export async function uploadAvatar(userId: string, imageUri: string): Promise<string> {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const filePath = `${userId}.jpg`;

  await supabase.storage.from("avatars").upload(filePath, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  // Add cache-buster so updated avatars show immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}
