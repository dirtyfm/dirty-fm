import "server-only";
import { isLocalAuthMode } from "@/lib/authMode";

export type DirtyfmContentBackend = "cloudflare-kv" | "supabase";

export function getDirtyfmContentBackend(): DirtyfmContentBackend {
  const configured = process.env.DIRTYFM_CONTENT_BACKEND;

  if (configured === "cloudflare-kv" || configured === "supabase") {
    return configured;
  }

  return isLocalAuthMode() ? "cloudflare-kv" : "supabase";
}

export function isKvContentBackend() {
  return getDirtyfmContentBackend() === "cloudflare-kv";
}
