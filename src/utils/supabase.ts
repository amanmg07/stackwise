import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://criicsyjvafvgovqlyfq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6dTbsxk9pihCtDg9UeRv7A_enUqKseV";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
