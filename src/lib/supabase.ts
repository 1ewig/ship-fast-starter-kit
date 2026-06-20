import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

declare global {
  var _supabaseAdmin: SupabaseClient | undefined;
}

function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!global._supabaseAdmin) {
    global._supabaseAdmin = createAdminClient();
  }
  return global._supabaseAdmin;
}
