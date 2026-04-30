export function getExactCount(count: number | null) {
  return count ?? 0;
}

export function mapCommentsToPostTitles<
  TComment extends { post_id: string },
  TPost extends { id: string; slug: string; title: string }
>(comments: TComment[], posts: TPost[]) {
  const postsById = new Map(posts.map((post) => [post.id, post]));

  return comments.map((comment) => {
    const post = postsById.get(comment.post_id);

    return {
      postSlug: post?.slug ?? null,
      postTitle: post?.title ?? "Unknown dirty file"
    };
  });
}
