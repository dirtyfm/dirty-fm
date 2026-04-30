import { readJsonKey, writeJsonKey } from "@/lib/kv/store";
import type { KvHomeSettings } from "@/lib/kv/types";
import { keys, nowIso } from "@/lib/kv/keys";

export async function getKvHomeSettings(): Promise<KvHomeSettings> {
  return readJsonKey<KvHomeSettings>(keys.home, {
    hero_aside: "Pirate radio for the unmanageable.",
    hero_body:
      "Drift keeps the mic on. Nobody asked him to and he doesn't care. Prank calls, rants, drug war breakdowns, and whatever stumbles through the door. Free speech with a hangover.",
    hero_eyebrow: "Hero / Dirty Signal",
    hero_title: "DirtyFM Is the Signal They Forgot to Kill.",
    id: "home",
    updated_at: nowIso()
  });
}

export async function updateKvHomeSettings(formData: FormData) {
  const existing = await getKvHomeSettings();
  const next: KvHomeSettings = {
    ...existing,
    hero_aside: String(formData.get("hero_aside") ?? existing.hero_aside).trim() || existing.hero_aside,
    hero_body: String(formData.get("hero_body") ?? existing.hero_body).trim() || existing.hero_body,
    hero_eyebrow: String(formData.get("hero_eyebrow") ?? existing.hero_eyebrow).trim() || existing.hero_eyebrow,
    hero_title: String(formData.get("hero_title") ?? existing.hero_title).trim() || existing.hero_title,
    updated_at: nowIso()
  };
  await writeJsonKey(keys.home, next);
}
