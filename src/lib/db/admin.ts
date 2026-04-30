import "server-only";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { assertAdminProfile } from "@/lib/authGuards";

export async function requireAdmin(accessToken: string) {
  if (!accessToken) {
    throw new Error("Admin access requires an authenticated Supabase session.");
  }

  const supabase = createSupabaseServerClient(accessToken);
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    throw new Error("Admin access requires a valid Supabase user.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("user_id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    throw new Error("Admin profile lookup failed.");
  }

  return assertAdminProfile(profile);
}
