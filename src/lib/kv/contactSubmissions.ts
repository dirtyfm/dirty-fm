import { validateContactSubmission, validatePostSubmission, type ContactSubmissionInput } from "../contentValidation.ts";
import { createDirtyNewsDraftFromContact } from "../contactToDirtyNews.ts";
import type { ContactSubmissionStatus } from "../db/types.ts";
import { cleanAdminNotes } from "../submissionWorkflows.ts";
import { createKvContactSubmissionRecord } from "./contactSubmissionCore.ts";
import { readJsonKey, writeJsonKey, deleteJsonKey } from "./store.ts";
import type { KvContactSubmission, KvPostSubmission } from "./types.ts";
import { addToIndex, removeFromIndex } from "./indexes.ts";
import { createId, keyFor, keys, nowIso } from "./keys.ts";

export async function createKvContactSubmission(input: ContactSubmissionInput) {
  const validated = validateContactSubmission(input);

  if (!validated.ok) {
    return validated;
  }

  const timestamp = nowIso();
  const data: KvContactSubmission = createKvContactSubmissionRecord(
    validated.data,
    createId("contact"),
    timestamp
  );
  await writeJsonKey(keyFor("contact-submissions", data.id), data);
  await addToIndex(keys.contactIndex, data.id);
  return { data: { created_at: data.created_at, id: data.id }, ok: true as const };
}

export async function updateKvContactSubmission(id: string, status: ContactSubmissionStatus, adminNotes: FormDataEntryValue | null, profileId: string) {
  const existing = await readJsonKey<KvContactSubmission | null>(keyFor("contact-submissions", id), null);
  if (!existing) throw new Error("Contact submission not found.");
  await writeJsonKey(keyFor("contact-submissions", id), {
    ...existing,
    admin_notes: cleanAdminNotes(adminNotes),
    reviewed_at: nowIso(),
    reviewed_by: profileId,
    status,
    updated_at: nowIso()
  });
}

export async function convertKvContactToPostSubmission(id: string, category: unknown, profileId: string) {
  const existing = await readJsonKey<KvContactSubmission | null>(keyFor("contact-submissions", id), null);
  if (!existing) throw new Error("Contact submission not found.");

  const draft = createDirtyNewsDraftFromContact(existing, category);
  const validated = validatePostSubmission(draft);
  if (!validated.ok) throw new Error(Object.values(validated.errors).join(" "));

  const timestamp = nowIso();
  const postSubmission: KvPostSubmission = {
    admin_notes: draft.adminNotes,
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

  await writeJsonKey(keyFor("post-submissions", postSubmission.id), postSubmission);
  await addToIndex(keys.postSubmissionsIndex, postSubmission.id);
  await writeJsonKey(keyFor("contact-submissions", id), {
    ...existing,
    reviewed_at: timestamp,
    reviewed_by: profileId,
    status: "approved",
    updated_at: timestamp
  });

  return postSubmission;
}

export async function deleteKvContactSubmission(id: string) {
  await deleteJsonKey(keyFor("contact-submissions", id));
  await removeFromIndex(keys.contactIndex, id);
}
