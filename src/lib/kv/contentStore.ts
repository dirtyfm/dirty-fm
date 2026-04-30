import "server-only";
import { dirtyVideos } from "@/data/videos";
import { getPublishedPosts } from "@/data/posts";
import {
  validateComment,
  validateContactSubmission,
  validatePostSubmission,
  type CommentInput,
  type ContactSubmissionInput,
  type PostSubmissionInput
} from "@/lib/contentValidation";
import { mapVisiblePublicComments } from "@/lib/db/commentMapping";
import {
  cleanAdminNotes,
  createDirtyNewsExcerpt,
  createDirtyNewsSlug
} from "@/lib/submissionWorkflows";
import type { ContactSubmissionStatus, PostSubmissionStatus } from "@/lib/db/types";
import { deleteJsonKey, readJsonKey, writeJsonKey } from "@/lib/kv/store";
import type {
  KvComment,
  KvContactSubmission,
  KvDirtyNewsPost,
  KvHomeSettings,
  KvPostSubmission,
  KvVideo,
  KvVideoStatus
} from "@/lib/kv/types";
import type { DirtyNewsPost } from "@/data/posts";
import type { DirtyVideo, VideoStatus } from "@/data/videos";
import { createKvContactSubmissionRecord } from "@/lib/kv/contactSubmissionCore";
import { mergeStoredVideosWithStaticSeeds } from "@/lib/kv/contentStoreCore";

const keys = {
  commentsIndex: "content:comments:index",
  contactIndex: "content:contact-submissions:index",
  home: "content:settings:home",
  postSubmissionsIndex: "content:post-submissions:index",
  postsIndex: "content:posts:index",
  videosDeletedIndex: "content:videos:deleted:index",
  videosIndex: "content:videos:index"
};

function keyFor(type: "comments" | "contact-submissions" | "post-submissions" | "posts" | "videos", id: string) {
  return `content:${type}:${id}`;
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function getIndex(key: string) {
  return readJsonKey<string[]>(key, []);
}

async function saveIndex(key: string, ids: string[]) {
  await writeJsonKey(key, Array.from(new Set(ids)));
}

async function addToIndex(key: string, id: string) {
  await saveIndex(key, [id, ...(await getIndex(key)).filter((item) => item !== id)]);
}

async function removeFromIndex(key: string, id: string) {
  await saveIndex(
    key,
    (await getIndex(key)).filter((item) => item !== id)
  );
}

async function readMany<T>(indexKey: string, itemKey: (id: string) => string) {
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

function byCreatedDesc<T extends { created_at: string }>(a: T, b: T) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function byPublishedDesc<T extends { published_at: string | null }>(a: T, b: T) {
  return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
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

function videoToPublic(video: KvVideo): DirtyVideo {
  return {
    category: video.category,
    description: video.description,
    host: video.host,
    id: video.id,
    isFeatured: video.is_featured,
    publishedAt: video.published_at,
    status: video.status as VideoStatus,
    title: video.title,
    youtubeId: video.youtube_id
  };
}

export async function getKvPublicPosts() {
  const posts = await readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id));
  return posts
    .filter((post) => post.status === "published" && post.published_at && post.published_at <= nowIso())
    .sort(byPublishedDesc)
    .map(postToPublic);
}

export async function getKvVisibleCommentsForPost(postId: string) {
  const comments = await readMany<KvComment>(keys.commentsIndex, (id) => keyFor("comments", id));
  return mapVisiblePublicComments(
    comments
      .filter((comment) => comment.post_id === postId && !comment.is_hidden)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((comment) => ({
        author_name: comment.author_name,
        body: comment.body,
        created_at: comment.created_at,
        id: comment.id,
        is_hidden: comment.is_hidden
      }))
  );
}

export async function getKvVideos() {
  const videos = await readMany<KvVideo>(keys.videosIndex, (id) => keyFor("videos", id));
  const deletedVideoIds = new Set(await getIndex(keys.videosDeletedIndex));
  return mergeStoredVideosWithStaticSeeds(videos, dirtyVideos, deletedVideoIds)
    .sort(byPublishedDesc)
    .map((video) => videoToPublic(video as KvVideo));
}

export async function getKvHomeSettings(): Promise<KvHomeSettings> {
  return readJsonKey<KvHomeSettings>(keys.home, {
    hero_aside: "Pirate radio for the unmanageable.",
    hero_body:
      "Raw radio, prank-call chaos, dark comedy, anti-control noise, and random fucking bullshit from Drift and whoever gets close enough to the mic.",
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

export async function createKvComment(input: CommentInput) {
  const validated = validateComment(input, { allowLocalPostId: true });

  if (!validated.ok) {
    return validated;
  }

  const timestamp = nowIso();
  const data: KvComment = {
    author_email: validated.data.authorEmail ?? null,
    author_name: validated.data.authorName,
    body: validated.data.body,
    created_at: timestamp,
    hidden_at: null,
    hidden_by: null,
    id: createId("comment"),
    is_hidden: false,
    post_id: validated.data.postId,
    updated_at: timestamp
  };
  await writeJsonKey(keyFor("comments", data.id), data);
  await addToIndex(keys.commentsIndex, data.id);
  return { data: { created_at: data.created_at, id: data.id }, ok: true as const };
}

export async function getKvAdminDashboardData() {
  const [contacts, postSubmissions, posts, comments] = await Promise.all([
    readMany<KvContactSubmission>(keys.contactIndex, (id) => keyFor("contact-submissions", id)),
    readMany<KvPostSubmission>(keys.postSubmissionsIndex, (id) => keyFor("post-submissions", id)),
    readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id)),
    readMany<KvComment>(keys.commentsIndex, (id) => keyFor("comments", id))
  ]);
  const staticPosts = getPublishedPosts();
  const postTitles = new Map([
    ...staticPosts.map((post) => [
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

  return {
    comments: comments.sort(byCreatedDesc).slice(0, 8).map((comment) => ({
      ...comment,
      postSlug: postTitles.get(comment.post_id)?.slug ?? null,
      postTitle: postTitles.get(comment.post_id)?.title ?? "Unknown file"
    })),
    contacts: contacts.sort(byCreatedDesc).slice(0, 8),
    counts: {
      contactSubmissions: contacts.filter((item) => item.status === "pending").length,
      pendingDirtyNews: postSubmissions.filter((item) => item.status === "pending").length,
      publishedPosts: posts.filter((item) => item.status === "published").length,
      recentComments: comments.filter((item) => !item.is_hidden).length
    },
    postSubmissions: postSubmissions.sort(byCreatedDesc).slice(0, 8),
    posts: posts.sort(byPublishedDesc).slice(0, 8)
  };
}

export async function getKvPostSlugForComment(commentId: string) {
  const comment = await readJsonKey<KvComment | null>(keyFor("comments", commentId), null);
  if (!comment) return null;

  const post = await readJsonKey<KvDirtyNewsPost | null>(keyFor("posts", comment.post_id), null);
  if (post) return post.slug;

  return getPublishedPosts().find((item) => item.id === comment.post_id)?.slug ?? null;
}

export async function getKvAdminVideos() {
  const videos = await getKvVideos();
  return videos.map((video) => ({
    category: video.category,
    description: video.description,
    host: video.host,
    id: video.id,
    is_featured: video.isFeatured,
    published_at: video.publishedAt,
    status: video.status,
    title: video.title,
    youtube_id: video.youtubeId
  }));
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

export async function deleteKvContactSubmission(id: string) {
  await deleteJsonKey(keyFor("contact-submissions", id));
  await removeFromIndex(keys.contactIndex, id);
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

export async function deleteKvPostSubmission(id: string) {
  await deleteJsonKey(keyFor("post-submissions", id));
  await removeFromIndex(keys.postSubmissionsIndex, id);
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

export async function setKvCommentHidden(id: string, isHidden: boolean, profileId?: string) {
  const existing = await readJsonKey<KvComment | null>(keyFor("comments", id), null);
  if (!existing) throw new Error("Comment not found.");
  await writeJsonKey(keyFor("comments", id), {
    ...existing,
    hidden_at: isHidden ? nowIso() : null,
    hidden_by: isHidden ? profileId ?? "local" : null,
    is_hidden: isHidden,
    updated_at: nowIso()
  });
  return existing.post_id;
}

export async function deleteKvComment(id: string) {
  const existing = await readJsonKey<KvComment | null>(keyFor("comments", id), null);
  await deleteJsonKey(keyFor("comments", id));
  await removeFromIndex(keys.commentsIndex, id);
  return existing?.post_id ?? null;
}

export async function upsertKvVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || createId("video");
  const timestamp = nowIso();
  const existing = await readJsonKey<KvVideo | null>(keyFor("videos", id), null);
  const title = String(formData.get("title") ?? existing?.title ?? "").trim();
  const youtubeId = String(formData.get("youtube_id") ?? existing?.youtube_id ?? "").trim();
  if (!title || !youtubeId) throw new Error("Video title and YouTube ID are required.");
  const video: KvVideo = {
    category: String(formData.get("category") ?? existing?.category ?? "Video Trash").trim(),
    created_at: existing?.created_at ?? timestamp,
    description: String(formData.get("description") ?? existing?.description ?? "").trim(),
    host: String(formData.get("host") ?? existing?.host ?? "Drift").trim(),
    id,
    is_featured: formData.get("is_featured") === "on",
    published_at: String(formData.get("published_at") ?? existing?.published_at ?? timestamp).trim(),
    status: String(formData.get("status") ?? existing?.status ?? "archive file") as KvVideoStatus,
    title,
    updated_at: timestamp,
    youtube_id: youtubeId
  };
  await writeJsonKey(keyFor("videos", id), video);
  await removeFromIndex(keys.videosDeletedIndex, id);
  await addToIndex(keys.videosIndex, id);
}

export async function deleteKvVideo(id: string) {
  try {
    await deleteJsonKey(keyFor("videos", id));
  } catch (error) {
    console.error(`KV video record delete failed for ${id}; writing tombstone anyway.`, error);
  }
  await removeFromIndex(keys.videosIndex, id);
  await addToIndex(keys.videosDeletedIndex, id);
}
