import { readMany, byCreatedDesc, byPublishedDesc } from "@/lib/kv/indexes";
import { keyFor, keys } from "@/lib/kv/keys";
import type { KvComment, KvContactSubmission, KvDirtyNewsPost, KvPostSubmission } from "@/lib/kv/types";
import { getKvPostTitleMap } from "@/lib/kv/posts";

export async function getKvAdminDashboardData() {
  const [contacts, postSubmissions, posts, comments, postTitles] = await Promise.all([
    readMany<KvContactSubmission>(keys.contactIndex, (id) => keyFor("contact-submissions", id)),
    readMany<KvPostSubmission>(keys.postSubmissionsIndex, (id) => keyFor("post-submissions", id)),
    readMany<KvDirtyNewsPost>(keys.postsIndex, (id) => keyFor("posts", id)),
    readMany<KvComment>(keys.commentsIndex, (id) => keyFor("comments", id)),
    getKvPostTitleMap()
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
