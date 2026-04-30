import type { DirtyNewsPost } from "../../data/posts.ts";

export function mergePublicDirtyNewsPosts(
  primaryPosts: DirtyNewsPost[],
  fallbackPosts: DirtyNewsPost[]
) {
  const primarySlugs = new Set(primaryPosts.map((post) => post.slug));
  const fallbackPostsNotInPrimary = fallbackPosts.filter(
    (post) => !primarySlugs.has(post.slug)
  );

  return [...primaryPosts, ...fallbackPostsNotInPrimary].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
