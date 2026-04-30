import { getPublishedPosts } from "../../data/posts.ts";
import { validateComment, type CommentInput } from "../contentValidation.ts";
import { mapVisiblePublicComments } from "../db/commentMapping.ts";
import { readJsonKey, writeJsonKey, deleteJsonKey } from "./store.ts";
import type { KvComment, KvDirtyNewsPost } from "./types.ts";
import { addToIndex, readMany, removeFromIndex } from "./indexes.ts";
import { createId, keyFor, keys, nowIso } from "./keys.ts";

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

export async function getKvPostSlugForComment(commentId: string) {
  const comment = await readJsonKey<KvComment | null>(keyFor("comments", commentId), null);
  if (!comment) return null;

  const post = await readJsonKey<KvDirtyNewsPost | null>(keyFor("posts", comment.post_id), null);
  if (post) return post.slug;

  return getPublishedPosts().find((item) => item.id === comment.post_id)?.slug ?? null;
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
