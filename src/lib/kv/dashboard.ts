import type { AdminDashboardData } from "../db/adminDashboard.ts";
import { createDirtyNewsSlug, isPendingPostReview } from "../submissionWorkflows.ts";
import { readMany, byCreatedDesc, byPublishedDesc } from "./indexes.ts";
import { keyFor, keys } from "./keys.ts";
import { contactReviewId, getKvPostSubmissionRecords } from "./postSubmissions.ts";
import { getKvPostInventory, getKvPostTitleMap, isStoredPost, reviewedPostId } from "./posts.ts";
import type { KvComment, KvContactSubmission } from "./types.ts";

export async function getKvAdminDashboardData(): Promise<AdminDashboardData> {
  const [contacts, submissions, inventory, comments] = await Promise.all([
    readMany<KvContactSubmission>(keys.contactIndex, (id) => keyFor("contact-submissions", id)),
    getKvPostSubmissionRecords(),
    getKvPostInventory(),
    readMany<KvComment>(keys.commentsIndex, (id) => keyFor("comments", id))
  ]);
  const posts = [...inventory.values()].filter(isStoredPost);
  const postTitles = getKvPostTitleMap(posts);
  const reviews = submissions.sort(byCreatedDesc).map((submission) => {
    const file = inventory.get(reviewedPostId(submission.id));
    if (file && "deleted" in file) return { ...submission, status: "archived" as const };

    const post = file ?? (!isPendingPostReview(submission.status)
      ? posts.find((item) => item.slug === createDirtyNewsSlug(submission.title, submission.id) && item.body === submission.body)
      : undefined);
    return post ? {
      ...submission,
      admin_notes: post.review_notes ?? submission.admin_notes,
      postId: post.id,
      postSlug: post.status === "published" && post.published_at && Date.parse(post.published_at) <= Date.now()
        ? post.slug : undefined,
      status: post.status,
      title: post.title
    } : submission;
  });
  const pending = reviews.filter((item) => isPendingPostReview(item.status));
  const reviewById = new Map(reviews.map((item) => [item.id, item]));
  const contactRows = contacts.sort(byCreatedDesc).map((contact) => {
    const review = reviewById.get(contactReviewId(contact.id)) ?? reviews.find((item) =>
      item.admin_notes?.startsWith(`Converted from contact signal ${contact.id}.`)
    );
    return review ? {
      ...contact,
      reviewStatus: review.status,
      status: contact.status === "pending" ? "approved" as const : contact.status
    } : contact;
  });

  return {
    comments: comments.sort(byCreatedDesc).slice(0, 8).map((comment) => ({
      ...comment,
      postSlug: postTitles.get(comment.post_id)?.slug ?? null,
      postTitle: postTitles.get(comment.post_id)?.title ?? "Unknown file"
    })),
    contacts: contactRows.slice(0, 8),
    counts: {
      contactSubmissions: contactRows.filter((item) => item.status === "pending").length,
      pendingDirtyNews: pending.length,
      publishedPosts: posts.filter((item) => item.status === "published").length,
      recentComments: comments.filter((item) => !item.is_hidden).length
    },
    postSubmissions: pending,
    reviewedSubmissions: reviews.filter((item) => !isPendingPostReview(item.status)),
    posts: posts.sort((a, b) => byPublishedDesc(a, b) || byCreatedDesc(a, b))
  };
}
