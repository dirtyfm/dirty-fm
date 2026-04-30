import { getPublishedPosts, type DirtyNewsPost } from "@/data/posts";
import { validatePostSubmission, type PostSubmissionInput } from "@/lib/contentValidation";
import type { PostSubmissionStatus } from "@/lib/db/types";
import { cleanAdminNotes, createDirtyNewsExcerpt, createDirtyNewsSlug } from "@/lib/submissionWorkflows";
import { readJsonKey, writeJsonKey, deleteJsonKey } from "@/lib/kv/store";
import type { KvDirtyNewsPost, KvPostSubmission } from "@/lib/kv/types";
import { addToIndex, byPublishedDesc, readMany, removeFromIndex } from "@/lib/kv/indexes";
import { createId, keyFor, keys, nowIso } from "@/lib/kv/keys";

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
  const posts = await readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id));
  return posts
    .filter((post) => post.status === "published" && post.published_at && post.published_at <= nowIso())
    .sort(byPublishedDesc)
    .map(postToPublic);
}

export async function updateKvPostSubmission(id: string, status: PostSubmissionStatus, input: PostSubmissionInput & { adminNotes?: FormDataEntryValue | null }, profileId: string) {
  const existing = await readJsonKey<KvPostSubmission | null>(keyFor("post-submissions", id), null);
  if (!existing) throw new Error("Dirty News submission not found.");
  const validated = validatePostSubmission(input);
  if (!validated.ok) throw new Error(Object.values(validated.errors).join(" "));
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

export async function publishKvPostSubmission(id: string, intent: string, input: PostSubmissionInput & { adminNotes?: FormDataEntryValue | null; author: string; excerpt?: string | null }, profileId: string) {
  const postStatus = intent === "publish" ? "published" : "draft";
  const submissionStatus = intent === "publish" ? "published" : "draft";
  const validated = validatePostSubmission(input);
  if (!validated.ok) throw new Error(Object.values(validated.errors).join(" "));
  const timestamp = nowIso();
  const post: KvDirtyNewsPost = {
    author: input.author.slice(0, 120),
    body: validated.data.body,
    category: validated.data.category,
    created_at: timestamp,
    excerpt: createDirtyNewsExcerpt(validated.data.body, input.excerpt ?? null),
    featured_image_url: null,
    id: createId("post"),
    published_at: postStatus === "published" ? timestamp : null,
    slug: createDirtyNewsSlug(validated.data.title, id),
    status: postStatus,
    title: validated.data.title,
    updated_at: timestamp
  };
  await writeJsonKey(keyFor("posts", post.id), post);
  await addToIndex(keys.postsIndex, post.id);
  await updateKvPostSubmission(id, submissionStatus, input, profileId);
}

export async function upsertKvPost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || createId("post");
  const timestamp = nowIso();
  const existing = await readJsonKey<KvDirtyNewsPost | null>(keyFor("posts", id), null);
  const body = String(formData.get("body") ?? existing?.body ?? "").trim();
  const title = String(formData.get("title") ?? existing?.title ?? "").trim();
  if (!body || !title) throw new Error("Post title and body are required.");
  const status = String(formData.get("status") ?? existing?.status ?? "draft") as KvDirtyNewsPost["status"];
  const post: KvDirtyNewsPost = {
    author: String(formData.get("author") ?? existing?.author ?? "DirtyFM Desk").trim(),
    body,
    category: String(formData.get("category") ?? existing?.category ?? "Dirty News").trim(),
    created_at: existing?.created_at ?? timestamp,
    excerpt: createDirtyNewsExcerpt(body, String(formData.get("excerpt") ?? existing?.excerpt ?? "")),
    featured_image_url: String(formData.get("featured_image_url") ?? existing?.featured_image_url ?? "").trim() || null,
    id,
    published_at:
      status === "published"
        ? String(formData.get("published_at") ?? existing?.published_at ?? timestamp).trim() || timestamp
        : null,
    slug: String(formData.get("slug") ?? existing?.slug ?? createDirtyNewsSlug(title, id)).trim(),
    status,
    title,
    updated_at: timestamp
  };
  await writeJsonKey(keyFor("posts", id), post);
  await addToIndex(keys.postsIndex, id);
}

export async function deleteKvPost(id: string) {
  await deleteJsonKey(keyFor("posts", id));
  await removeFromIndex(keys.postsIndex, id);
}

export async function getKvPostTitleMap() {
  const posts = await readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id));
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
