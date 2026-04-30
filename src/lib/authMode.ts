import type { DirtyfmAuthMode } from "@/lib/runtimeConfigCore";
import { getValidatedDirtyfmAuthMode } from "@/lib/runtimeConfig";

export type { DirtyfmAuthMode };

export function getDirtyfmAuthMode(): DirtyfmAuthMode {
  return getValidatedDirtyfmAuthMode();
}

export function isLocalAuthMode() {
  return getDirtyfmAuthMode() === "local";
}
