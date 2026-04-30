import "server-only";

export function readRequiredServerEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseEnv() {
  return {
    anonKey: readRequiredServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: readRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    url: readRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL")
  };
}
