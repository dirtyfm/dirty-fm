import "server-only";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { assertAdminProfile } from "@/lib/authGuards";
import { isLocalAuthMode } from "@/lib/authMode";
import { verifyLocalSessionToken } from "@/lib/localAuth";

export async function requireAdmin(accessToken: string) {
  if (!accessToken) {
    throw new Error("Admin access requires an authenticated Supabase session.");
  }

  if (isLocalAuthMode()) {
    const profile = await verifyLocalSessionToken(accessToken);

    if (!profile) {
      throw new Error("Admin access requires a valid local Signal Control session.");
    }

    return profile;
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
