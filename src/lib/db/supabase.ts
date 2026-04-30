import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readRequiredServerEnv } from "@/lib/env";
import type { Database } from "@/lib/db/types";

export function createSupabaseServerClient(accessToken?: string) {
  const url = readRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readRequiredServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}

export function createSupabaseServiceRoleClient() {
  const url = readRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
