import type { DirtyfmAuthMode } from "@/lib/runtimeConfigCore";
import { getValidatedDirtyfmAuthMode } from "@/lib/runtimeConfig";

export type { DirtyfmAuthMode };

export function getDirtyfmAuthMode(): DirtyfmAuthMode {
  // Production selects local auth explicitly; Supabase remains available only by mode.
  return getValidatedDirtyfmAuthMode();
}

export function isLocalAuthMode() {
  return getDirtyfmAuthMode() === "local";
}
