import { readJsonKey, writeJsonKey } from "@/lib/kv/store";

export async function getIndex(key: string) {
  return readJsonKey<string[]>(key, []);
}

export async function saveIndex(key: string, ids: string[]) {
  await writeJsonKey(key, Array.from(new Set(ids)));
}

export async function addToIndex(key: string, id: string) {
  await saveIndex(key, [id, ...(await getIndex(key)).filter((item) => item !== id)]);
}

export async function removeFromIndex(key: string, id: string) {
  await saveIndex(
    key,
    (await getIndex(key)).filter((item) => item !== id)
  );
}

export async function readMany<T>(indexKey: string, itemKey: (id: string) => string) {
  const ids = await getIndex(indexKey);
  const records: T[] = [];

  for (const id of ids) {
    const record = await readJsonKey<T | null>(itemKey(id), null);

    if (record) {
      records.push(record);
    }
  }

  return records;
}

export function byCreatedDesc<T extends { created_at: string }>(a: T, b: T) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function byPublishedDesc<T extends { published_at: string | null }>(a: T, b: T) {
  return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
}
