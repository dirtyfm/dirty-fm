import "server-only";
import type { DirtyfmContentBackend } from "@/lib/runtimeConfigCore";
import { getValidatedDirtyfmContentBackend } from "@/lib/runtimeConfig";

export type { DirtyfmContentBackend };

export function getDirtyfmContentBackend(): DirtyfmContentBackend {
  // Production selects Cloudflare KV explicitly; Supabase remains available only by mode.
  return getValidatedDirtyfmContentBackend();
}

export function isKvContentBackend() {
  return getDirtyfmContentBackend() === "cloudflare-kv";
}
