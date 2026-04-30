import type { getKvAdminVideos, getKvHomeSettings } from "@/lib/kv/contentStore";

export const adminFieldBase =
  "w-full border border-[rgba(183,178,168,0.28)] bg-dirty-black/70 px-3 py-2 text-sm text-dirty-ash outline-none focus:border-dirty-yellow";

export type KvHomeSettings = Awaited<ReturnType<typeof getKvHomeSettings>>;
export type KvAdminVideo = Awaited<ReturnType<typeof getKvAdminVideos>>[number];

export function formatDate(value: string | null) {
  if (!value) {
    return "Not aired";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function excerpt(value: string, maxLength = 180) {
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}
