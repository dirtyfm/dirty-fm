export type DirtyfmAuthMode = "local" | "supabase";

export function getDirtyfmAuthMode(): DirtyfmAuthMode {
  return process.env.DIRTYFM_AUTH_MODE === "local" ? "local" : "supabase";
}

export function isLocalAuthMode() {
  return getDirtyfmAuthMode() === "local";
}
