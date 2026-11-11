import { getPublishedPosts, type DirtyNewsPost } from "../../data/posts.ts";
import { validatePostSubmission, type PostSubmissionInput } from "../contentValidation.ts";
import type { PostSubmissionStatus } from "../db/types.ts";
import { SignalControlFormError } from "../signalControlFeedback.ts";
import { cleanAdminNotes, createDirtyNewsExcerpt, createDirtyNewsSlug, isPendingPostReview } from "../submissionWorkflows.ts";
import { getDirtyfmKvNamespace, listJsonRecords, writeJsonKey, deleteJsonKey } from "./store.ts";
import type { KvDirtyNewsPost, KvPostFile, KvPostStatus, KvPostSubmission } from "./types.ts";
import { byPublishedDesc, readMany, removeFromIndex } from "./indexes.ts";
import { createId, keyFor, keys, nowIso } from "./keys.ts";

const postFilePrefix = "file-";
const reviewedPostPrefix = `${postFilePrefix}review-`;
const reviewDraftPrefix = "content:review-drafts:";

export function isStoredPost(file: KvPostFile): file is KvDirtyNewsPost {
  return !("deleted" in file);
}

export function reviewedPostId(submissionId: string) {
  return `${reviewedPostPrefix}${submissionId}`;
}

function newPostSlug(title: string, id: string) {
  const suffix = id.slice(postFilePrefix.length);
  return createDirtyNewsSlug(title, suffix, suffix.length);
}

export async function getKvPostInventory() {
  const [indexed, files, drafts] = await Promise.all([
    readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id)),
    listJsonRecords<KvPostFile>(keyFor("posts", postFilePrefix)),
    listJsonRecords<KvDirtyNewsPost>(reviewDraftPrefix)
  ]);
  const byId = new Map<string, KvPostFile>();
  for (const record of [...indexed, ...drafts, ...files]) byId.set(record.id, record);
  return byId;
}

function postToPublic(post: KvDirtyNewsPost): DirtyNewsPost {
  return {
    author: post.author,
    body: post.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    category: post.category,
    excerpt: post.excerpt,
    featuredImageUrl: post.featured_image_url ?? undefined,
    id: post.id,
    publishedAt: post.published_at ?? new Date(0).toISOString(),
    slug: post.slug,
    status: "published",
    title: post.title
  };
}

export async function getKvPublicPosts() {
  const [legacyPosts, files] = await Promise.all([
    readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id)),
    listJsonRecords<KvPostFile>(keyFor("posts", postFilePrefix)).catch((error: unknown): KvPostFile[] => {
      console.error("Dirty News files could not be listed.", error);
      return [];
    })
  ]);
  const posts = [...legacyPosts, ...files.filter(isStoredPost)];
  return posts
    .filter((post) => post.status === "published" && post.published_at && post.published_at <= nowIso())
    .sort(byPublishedDesc)
    .map(postToPublic);
}

export async function updateKvPostSubmission(id: string, status: PostSubmissionStatus, input: PostSubmissionInput & { adminNotes?: FormDataEntryValue | null }, profileId: string) {
  const namespace = await getDirtyfmKvNamespace();
  const existing = await namespace.get<KvPostSubmission>(keyFor("post-submissions", id), "json");
  if (!existing) throw new SignalControlFormError("Dirty News submission not found.");
  const postId = reviewedPostId(id);
  const [file, draft] = await Promise.all([
    namespace.get<KvPostFile>(keyFor("posts", postId), "json"),
    namespace.get<KvDirtyNewsPost>(`${reviewDraftPrefix}${postId}`, "json")
  ]);
  if (file || draft || !isPendingPostReview(existing.status)) {
    throw new SignalControlFormError("This submission has already moved to Review History.");
  }
  const validated = validatePostSubmission(input);
  if (!validated.ok) throw new SignalControlFormError(Object.values(validated.errors).join(" "));
  await writeJsonKey(keyFor("post-submissions", id), {
    ...existing,
    admin_notes: cleanAdminNotes(input.adminNotes ?? null),
    body: validated.data.body,
    category: validated.data.category,
    email: validated.data.email,
    name: validated.data.name,
    reviewed_at: nowIso(),
    reviewed_by: profileId,
    source_url: validated.data.sourceUrl ?? null,
    status,
    title: validated.data.title,
    updated_at: nowIso()
  });
}

export async function publishKvPostSubmission(id: string, intent: "draft" | "publish", input: PostSubmissionInput & { adminNotes?: FormDataEntryValue | null; author: string; excerpt?: string | null }, profileId: string) {
  const namespace = await getDirtyfmKvNamespace();
  const postId = reviewedPostId(id);
  const fileKey = keyFor("posts", postId);
  const draftKey = `${reviewDraftPrefix}${postId}`;
  const [submission, file, draft] = await Promise.all([
    namespace.get<KvPostSubmission>(keyFor("post-submissions", id), "json"),
    namespace.get<KvPostFile>(fileKey, "json"),
    namespace.get<KvDirtyNewsPost>(draftKey, "json")
  ]);
  if (!submission) throw new SignalControlFormError("Dirty News submission not found.");
  if (file || (draft && intent === "draft") || !isPendingPostReview(submission.status)) {
    return { alreadyReviewed: true, post: file && "deleted" in file ? null : file ?? draft };
  }

  const validated = validatePostSubmission(input);
  if (!validated.ok) throw new SignalControlFormError(Object.values(validated.errors).join(" "));
  const timestamp = nowIso();
  const postStatus = intent === "publish" ? "published" : "draft";
  const post: KvDirtyNewsPost = {
    author: input.author.slice(0, 120),
    body: validated.data.body,
    category: validated.data.category,
    created_at: draft?.created_at ?? timestamp,
    excerpt: createDirtyNewsExcerpt(validated.data.body, input.excerpt ?? null),
    featured_image_url: null,
    id: postId,
    published_at: postStatus === "published" ? timestamp : null,
    review_notes: cleanAdminNotes(input.adminNotes),
    review_source_url: validated.data.sourceUrl ?? null,
    reviewed_by: profileId,
    slug: draft?.slug ?? newPostSlug(validated.data.title, postId),
    status: postStatus,
    title: validated.data.title,
    updated_at: timestamp
  };
  // Draft approval never writes the public key. A delayed draft cannot hide a published file.
  const targetKey = intent === "publish" ? fileKey : draftKey;
  try {
    await namespace.put(targetKey, JSON.stringify(post));
  } catch (error) {
    const current = await namespace.get<KvPostFile>(targetKey, "json");
    if (!current) throw error;
    return { alreadyReviewed: true, post: "deleted" in current ? null : current };
  }
  return { alreadyReviewed: false, post };
}

export async function upsertKvPost(formData: FormData) {
  const existingId = String(formData.get("id") ?? "").trim();
  const requestId = String(formData.get("request_id") ?? "");
  const id = existingId || (/^file-[\da-f-]{36}$/i.test(requestId) ? requestId : createId("file"));
  const timestamp = nowIso();
  const namespace = await getDirtyfmKvNamespace();
  const current = await namespace.get<KvPostFile>(keyFor("posts", id), "json");
  if (current && "deleted" in current) throw new SignalControlFormError("This file was deleted.");
  const existing = current ?? (id.startsWith(reviewedPostPrefix)
    ? await namespace.get<KvDirtyNewsPost>(`${reviewDraftPrefix}${id}`, "json")
    : null);
  if (!existingId && existing) return existing;
  if (existingId && !existing) throw new SignalControlFormError("Dirty News file not found.");
  const body = String(formData.get("body") ?? existing?.body ?? "").trim();
  const title = String(formData.get("title") ?? existing?.title ?? "").trim();
  if (!body || !title) throw new SignalControlFormError("Post title and body are required.");
  const status = String(formData.get("status") ?? existing?.status ?? "draft") as KvPostStatus;
  if (status !== "published" && status !== "draft" && status !== "archived") {
    throw new SignalControlFormError("Choose draft, published, or archived.");
  }
  const date = String(formData.get("published_at") ?? existing?.published_at ?? "").trim();
  if (status === "published" && date && !Number.isFinite(Date.parse(date))) {
    throw new SignalControlFormError("Enter a valid publication date or leave it blank to publish now.");
  }
  const slug = String(formData.get("slug") ?? existing?.slug ?? newPostSlug(title, id)).trim();
  if (slug !== existing?.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new SignalControlFormError("Use lowercase letters, numbers, and single hyphens in the post URL.");
  }
  const post: KvDirtyNewsPost = {
    ...existing,
    author: String(formData.get("author") ?? existing?.author ?? "DirtyFM Desk").trim(),
    body,
    category: String(formData.get("category") ?? existing?.category ?? "Dirty News").trim(),
    created_at: existing?.created_at ?? timestamp,
    excerpt: createDirtyNewsExcerpt(body, String(formData.get("excerpt") ?? existing?.excerpt ?? "")),
    featured_image_url: String(formData.get("featured_image_url") ?? existing?.featured_image_url ?? "").trim() || null,
    id,
    published_at:
      status === "published" ? date ? new Date(date).toISOString() : timestamp : null,
    slug,
    status,
    title,
    updated_at: timestamp
  };
  await namespace.put(keyFor("posts", id), JSON.stringify(post));
  return post;
}

export async function deleteKvPost(id: string) {
  if (id.startsWith(postFilePrefix)) {
    await writeJsonKey<KvPostFile>(keyFor("posts", id), { id, deleted: true });
    if (id.startsWith(reviewedPostPrefix)) await deleteJsonKey(`${reviewDraftPrefix}${id}`);
    return;
  }
  await deleteJsonKey(keyFor("posts", id));
  await removeFromIndex(keys.postsIndex, id);
}

export function getKvPostTitleMap(posts: KvDirtyNewsPost[]) {
  return new Map([
    ...getPublishedPosts().map((post) => [
      post.id,
      {
        slug: post.slug,
        title: post.title
      }
    ] as const),
    ...posts.map((post) => [
      post.id,
      {
        slug: post.slug,
        title: post.title
      }
    ] as const)
  ]);
}
