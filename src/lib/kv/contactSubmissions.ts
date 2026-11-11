import { validateContactSubmission, validatePostSubmission, type ContactSubmissionInput } from "../contentValidation.ts";
import { createDirtyNewsDraftFromContact } from "../contactToDirtyNews.ts";
import type { ContactSubmissionStatus } from "../db/types.ts";
import { SignalControlFormError } from "../signalControlFeedback.ts";
import { cleanAdminNotes } from "../submissionWorkflows.ts";
import { createKvContactSubmissionRecord } from "./contactSubmissionCore.ts";
import { getDirtyfmKvNamespace, readJsonKey, writeJsonKey, deleteJsonKey } from "./store.ts";
import type { KvContactSubmission, KvPostSubmission } from "./types.ts";
import { addToIndex, readMany, removeFromIndex } from "./indexes.ts";
import { createId, keyFor, keys, nowIso } from "./keys.ts";
import { contactReviewId } from "./postSubmissions.ts";

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
  if (!existing) throw new SignalControlFormError("Contact submission not found.");
  await writeJsonKey(keyFor("contact-submissions", id), {
    ...existing,
    admin_notes: cleanAdminNotes(adminNotes),
    reviewed_at: nowIso(),
    reviewed_by: profileId,
    status,
    updated_at: nowIso()
  });
}

export async function convertKvContactToPostSubmission(id: string, category: unknown) {
  const namespace = await getDirtyfmKvNamespace();
  const contactKey = keyFor("contact-submissions", id);
  const reviewId = contactReviewId(id);
  const reviewKey = keyFor("post-submissions", reviewId);
  const [existing, converted] = await Promise.all([
    namespace.get<KvContactSubmission>(contactKey, "json"),
    namespace.get<KvPostSubmission>(reviewKey, "json")
  ]);
  if (!existing) throw new SignalControlFormError("Contact submission not found.");
  if (converted) return { submission: converted, alreadyConverted: true };
  if (existing.status !== "pending") {
    const earlier = await readMany<KvPostSubmission>(keys.postSubmissionsIndex, (itemId) => keyFor("post-submissions", itemId));
    const match = earlier.find((item) => item.admin_notes?.startsWith(`Converted from contact signal ${id}.`));
    if (match) return { submission: match, alreadyConverted: true };
  }

  const draft = createDirtyNewsDraftFromContact(existing, category);
  const validated = validatePostSubmission(draft);
  if (!validated.ok) throw new SignalControlFormError(Object.values(validated.errors).join(" "));

  const timestamp = nowIso();
  const postSubmission: KvPostSubmission = {
    admin_notes: draft.adminNotes,
    body: validated.data.body,
    category: validated.data.category,
    created_at: timestamp,
    email: validated.data.email,
    id: reviewId,
    name: validated.data.name,
    reviewed_at: null,
    reviewed_by: null,
    source_url: validated.data.sourceUrl ?? null,
    status: "pending",
    title: validated.data.title,
    updated_at: timestamp
  };

  try {
    await namespace.put(reviewKey, JSON.stringify(postSubmission));
  } catch (error) {
    const current = await namespace.get<KvPostSubmission>(reviewKey, "json");
    if (!current) throw error;
    return { submission: current, alreadyConverted: true };
  }
  return { submission: postSubmission, alreadyConverted: false };
}

export async function deleteKvContactSubmission(id: string) {
  await deleteJsonKey(keyFor("contact-submissions", id));
  await removeFromIndex(keys.contactIndex, id);
}
