import "server-only";
import type { DirtyfmContentBackend } from "./runtimeConfigCore.ts";
import { getValidatedDirtyfmContentBackend } from "./runtimeConfig.ts";

export type { DirtyfmContentBackend };

export function getDirtyfmContentBackend(): DirtyfmContentBackend {
  // Production selects Cloudflare KV explicitly; Supabase remains available only by mode.
  return getValidatedDirtyfmContentBackend();
}

export function isKvContentBackend() {
  return getDirtyfmContentBackend() === "cloudflare-kv";
}
