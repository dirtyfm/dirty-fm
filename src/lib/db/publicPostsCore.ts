import type { DirtyNewsPost } from "../../data/posts.ts";

export function mergePublicDirtyNewsPosts(
  primaryPosts: DirtyNewsPost[],
  fallbackPosts: DirtyNewsPost[]
) {
  const postsBySlug = new Map<string, DirtyNewsPost>();
  for (const post of [...primaryPosts, ...fallbackPosts]) {
    if (!postsBySlug.has(post.slug)) postsBySlug.set(post.slug, post);
  }
  return [...postsBySlug.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
