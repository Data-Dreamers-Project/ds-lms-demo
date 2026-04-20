import "server-only";
import { env } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

// server client
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);
