import "server-only";
import type { DirtyfmContentBackend } from "@/lib/runtimeConfigCore";
import { getValidatedDirtyfmContentBackend } from "@/lib/runtimeConfig";

export type { DirtyfmContentBackend };

export function getDirtyfmContentBackend(): DirtyfmContentBackend {
  return getValidatedDirtyfmContentBackend();
}

export function isKvContentBackend() {
  return getDirtyfmContentBackend() === "cloudflare-kv";
}
