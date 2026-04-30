import { validatePostSubmission, type PostSubmissionInput } from "../contentValidation.ts";
import { deleteJsonKey, writeJsonKey } from "./store.ts";
import type { KvPostSubmission } from "./types.ts";
import { addToIndex, removeFromIndex } from "./indexes.ts";
import { createId, keyFor, keys, nowIso } from "./keys.ts";

export async function createKvPostSubmission(input: PostSubmissionInput) {
  const validated = validatePostSubmission(input);

  if (!validated.ok) {
    return validated;
  }

  const timestamp = nowIso();
  const data: KvPostSubmission = {
    admin_notes: null,
    body: validated.data.body,
    category: validated.data.category,
    created_at: timestamp,
    email: validated.data.email,
    id: createId("submission"),
    name: validated.data.name,
    reviewed_at: null,
    reviewed_by: null,
    source_url: validated.data.sourceUrl ?? null,
    status: "pending",
    title: validated.data.title,
    updated_at: timestamp
  };
  await writeJsonKey(keyFor("post-submissions", data.id), data);
  await addToIndex(keys.postSubmissionsIndex, data.id);
  return { data: { created_at: data.created_at, id: data.id }, ok: true as const };
}

export async function deleteKvPostSubmission(id: string) {
  await deleteJsonKey(keyFor("post-submissions", id));
  await removeFromIndex(keys.postSubmissionsIndex, id);
}
