"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { DIRTYFM_ACCESS_TOKEN_COOKIE } from "@/lib/authSession";
import { isKvContentBackend } from "@/lib/contentBackend";
import { createDirtyNewsDraftFromContact } from "@/lib/contactToDirtyNews";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { requireAdmin } from "@/lib/db/admin";
import { validatePostSubmission } from "@/lib/contentValidation";
import { SignalControlFormError, type SignalControlFeedback } from "@/lib/signalControlFeedback";
import type { KvDirtyNewsPost } from "@/lib/kv/types";
import {
  convertKvContactToPostSubmission,
  deleteKvComment,
  deleteKvContactSubmission,
  deleteKvPost,
  deleteKvPostSubmission,
  deleteKvVideo,
  getKvPostSlugForComment,
  publishKvPostSubmission,
  setKvCommentHidden,
  updateKvContactSubmission,
  updateKvHomeSettings,
  updateKvPostSubmission,
  upsertKvPost,
  upsertKvVideo
} from "@/lib/kv/contentStore";
import {
  cleanAdminNotes,
  createDirtyNewsExcerpt,
  createDirtyNewsSlug,
  isContactSubmissionStatus,
  isPendingPostReview,
  isPostSubmissionStatus
} from "@/lib/submissionWorkflows";
import { getVideoSource, withVideoAttachmentFooter } from "@/lib/videoAttachments";

function throwAdminMutationError(label: string, error: unknown): never {
  console.error(label, error);
  throw new Error("Signal Control could not complete that protected action.");
}

async function getAdminContext() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DIRTYFM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new SignalControlFormError("Your session ended. Sign in to Signal Control and try again.");
  }

  const profile = await requireAdmin(accessToken).catch(() => {
    throw new SignalControlFormError("Your Signal Control session could not be verified. Sign in again.");
  });
  // KV production keeps Supabase action code retained but inactive until the backend mode changes.
  const supabase = isKvContentBackend() ? null : createSupabaseServerClient(accessToken);

  return { profile, supabase };
}

function getRequiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || !value.trim()) {
    throw new SignalControlFormError(`${name[0].toUpperCase()}${name.slice(1)} is required.`);
  }

  return value.trim();
}

async function updateContactSubmission(formData: FormData) {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const status = formData.get("status");

  if (!isContactSubmissionStatus(status)) {
    throw new Error("Invalid contact submission status.");
  }

  if (isKvContentBackend()) {
    await updateKvContactSubmission(id, status, formData.get("admin_notes"), profile.user_id);
    revalidatePath("/signal-control");
    return;
  }

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const { error } = await supabase
    .from("contact_submissions")
    .update({
      admin_notes: cleanAdminNotes(formData.get("admin_notes")),
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.user_id,
      status
    })
    .eq("id", id);

  if (error) {
    throwAdminMutationError("Contact update failed", error);
  }

  revalidatePath("/signal-control");
}

async function convertContactToDirtyNewsSubmission(formData: FormData): Promise<SignalControlFeedback> {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const category = formData.get("category");

  if (isKvContentBackend()) {
    const { submission, alreadyConverted } = await convertKvContactToPostSubmission(id, category);
    revalidatePath("/signal-control");
    const pending = isPendingPostReview(submission.status);
    return {
      message: alreadyConverted ? "This signal already has a Dirty News review file." : "Signal copied to Pending Dirty News.",
      href: pending ? "#pending-dirty-news" : "#review-history",
      linkLabel: pending ? "Open pending queue" : "Open Review History"
    };
  }

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const { data: contact, error: contactError } = await supabase
    .from("contact_submissions")
    .select("id, name, email, subject, submission_type, message, attachment_url, can_read_on_air")
    .eq("id", id)
    .single();

  if (contactError || !contact) {
    throwAdminMutationError("Contact conversion lookup failed", contactError);
  }

  const draft = createDirtyNewsDraftFromContact(contact, category);
  const validated = validatePostSubmission(draft);

  if (!validated.ok) {
    throw new SignalControlFormError(Object.values(validated.errors).join(" "));
  }

  const { error: submissionError } = await supabase.from("post_submissions").insert({
    admin_notes: draft.adminNotes,
    body: validated.data.body,
    category: validated.data.category,
    email: validated.data.email,
    name: validated.data.name,
    source_url: validated.data.sourceUrl ?? null,
    status: "pending",
    title: validated.data.title
  });

  if (submissionError) {
    throwAdminMutationError("Contact conversion insert failed", submissionError);
  }

  const { error: contactUpdateError } = await supabase
    .from("contact_submissions")
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.user_id,
      status: "approved"
    })
    .eq("id", id);

  if (contactUpdateError) {
    throwAdminMutationError("Contact conversion status update failed", contactUpdateError);
  }

  revalidatePath("/signal-control");
  return { message: "Signal copied to Pending Dirty News.", href: "#pending-dirty-news", linkLabel: "Open pending queue" };
}

async function deleteContactSubmission(formData: FormData) {
  const { supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");

  if (isKvContentBackend()) {
    await deleteKvContactSubmission(id);
    revalidatePath("/signal-control");
    return;
  }

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);

  if (error) {
    throwAdminMutationError("Contact delete failed", error);
  }

  revalidatePath("/signal-control");
}

async function updatePostSubmission(formData: FormData) {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const status = formData.get("status");

  if (!isPostSubmissionStatus(status) || status === "draft" || status === "published") {
    throw new SignalControlFormError("Use the review buttons to create a draft or publish a file.");
  }

  const input = {
    body: getRequiredString(formData, "body"),
    category: getRequiredString(formData, "category"),
    email: getRequiredString(formData, "email"),
    name: getRequiredString(formData, "name"),
    sourceUrl: (formData.get("source_url") as string | null) ?? undefined,
    title: getRequiredString(formData, "title")
  };

  if (isKvContentBackend()) {
    await updateKvPostSubmission(
      id,
      status,
      { ...input, adminNotes: formData.get("admin_notes") },
      profile.user_id
    );
    revalidatePath("/signal-control");
    return;
  }

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const validated = validatePostSubmission(input);

  if (!validated.ok) {
    throw new SignalControlFormError(Object.values(validated.errors).join(" "));
  }

  const { error } = await supabase
    .from("post_submissions")
    .update({
      admin_notes: cleanAdminNotes(formData.get("admin_notes")),
      body: validated.data.body,
      category: validated.data.category,
      email: validated.data.email,
      name: validated.data.name,
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.user_id,
      source_url: validated.data.sourceUrl ?? null,
      status,
      title: validated.data.title
    })
    .eq("id", id)
    .in("status", ["pending", "approved"])
    .select("id")
    .single();

  if (error) {
    throwAdminMutationError("Dirty News submission update failed", error);
  }

  revalidatePath("/signal-control");
}

async function publishPostSubmission(intent: "draft" | "publish", formData: FormData): Promise<SignalControlFeedback> {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const postStatus = intent === "publish" ? "published" : "draft";
  const author = getRequiredString(formData, "author").slice(0, 120);
  const excerpt = createDirtyNewsExcerpt(
    getRequiredString(formData, "body"),
    formData.get("excerpt") as string | null
  );
  const input = {
    body: getRequiredString(formData, "body"),
    category: getRequiredString(formData, "category"),
    email: getRequiredString(formData, "email"),
    name: getRequiredString(formData, "name"),
    sourceUrl: (formData.get("source_url") as string | null) ?? undefined,
    title: getRequiredString(formData, "title")
  };

  if (isKvContentBackend()) {
    const result = await publishKvPostSubmission(
      id,
      intent,
      {
        ...input,
        adminNotes: formData.get("admin_notes"),
        author,
        excerpt: formData.get("excerpt") as string | null
      },
      profile.user_id
    );
    revalidateNews();
    return postFeedback(result.post, result.alreadyReviewed, result.post?.review_source_url);
  }

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const validated = validatePostSubmission(input);

  if (!validated.ok) {
    throw new SignalControlFormError(Object.values(validated.errors).join(" "));
  }

  const { data: submission, error: readError } = await supabase.from("post_submissions")
    .select("status").eq("id", id).single();
  if (readError) throwAdminMutationError("Dirty News submission lookup failed", readError);
  if (!isPendingPostReview(submission.status)) return postFeedback(null, true);

  const publishedAt = postStatus === "published" ? new Date().toISOString() : null;
  const { error: postError } = await supabase.from("posts").upsert({
    author,
    body: withVideoAttachmentFooter(validated.data.body, validated.data.sourceUrl),
    category: validated.data.category,
    created_by: profile.user_id,
    excerpt,
    id,
    published_at: publishedAt,
    slug: createDirtyNewsSlug(validated.data.title, id, id.length),
    status: postStatus,
    title: validated.data.title,
    updated_by: profile.user_id
  }, { onConflict: "id", ignoreDuplicates: true });

  if (postError) {
    throwAdminMutationError("Post creation failed", postError);
  }
  const { data: post, error: lookupError } = await supabase.from("posts")
    .select("id, status, slug, published_at").eq("id", id).single();
  if (lookupError) throwAdminMutationError("Dirty News post lookup failed", lookupError);

  const { error: submissionError } = await supabase
    .from("post_submissions")
    .update({
      admin_notes: cleanAdminNotes(formData.get("admin_notes")),
      body: validated.data.body,
      category: validated.data.category,
      email: validated.data.email,
      name: validated.data.name,
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.user_id,
      source_url: validated.data.sourceUrl ?? null,
      status: post.status,
      title: validated.data.title
    })
    .eq("id", id)
    .in("status", ["pending", "approved"]);

  if (submissionError) {
    throwAdminMutationError("Submission status update failed", submissionError);
  }

  revalidateNews();
  return postFeedback(post, post.status !== postStatus, validated.data.sourceUrl);
}

async function deletePostSubmission(formData: FormData) {
  const { supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");

  if (isKvContentBackend()) {
    await deleteKvPostSubmission(id);
    revalidatePath("/signal-control");
    return;
  }

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const { error } = await supabase.from("post_submissions").delete().eq("id", id);

  if (error) {
    throwAdminMutationError("Dirty News submission delete failed", error);
  }

  revalidatePath("/signal-control");
}

async function getCommentPostSlug(commentId: string) {
  const { supabase } = await getAdminContext();

  if (!supabase) {
    throw new Error("Supabase admin client missing.");
  }

  const { data, error } = await supabase
    .from("comments")
    .select("post_id")
    .eq("id", commentId)
    .single();

  if (error) {
    throwAdminMutationError("Comment lookup failed", error);
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", data.post_id)
    .single();

  if (postError) {
    throwAdminMutationError("Comment post lookup failed", postError);
  }

  return { slug: post.slug, supabase };
}

async function hideComment(formData: FormData) {
  const { profile } = await getAdminContext();
  const id = getRequiredString(formData, "id");

  if (isKvContentBackend()) {
    await setKvCommentHidden(id, true, profile.user_id);
    const slug = await getKvPostSlugForComment(id);
    revalidatePath("/signal-control");
    revalidatePath("/dirty-news");
    if (slug) revalidatePath(`/dirty-news/${slug}`);
    return;
  }

  const { slug, supabase } = await getCommentPostSlug(id);
  const { error } = await supabase
    .from("comments")
    .update({
      hidden_at: new Date().toISOString(),
      hidden_by: profile.user_id,
      is_hidden: true
    })
    .eq("id", id);

  if (error) {
    throwAdminMutationError("Comment hide failed", error);
  }

  revalidatePath("/signal-control");
  revalidatePath(`/dirty-news/${slug}`);
}

async function restoreComment(formData: FormData) {
  const id = getRequiredString(formData, "id");

  if (isKvContentBackend()) {
    await setKvCommentHidden(id, false);
    const slug = await getKvPostSlugForComment(id);
    revalidatePath("/signal-control");
    revalidatePath("/dirty-news");
    if (slug) revalidatePath(`/dirty-news/${slug}`);
    return;
  }

  const { slug, supabase } = await getCommentPostSlug(id);
  const { error } = await supabase
    .from("comments")
    .update({
      hidden_at: null,
      hidden_by: null,
      is_hidden: false
    })
    .eq("id", id);

  if (error) {
    throwAdminMutationError("Comment restore failed", error);
  }

  revalidatePath("/signal-control");
  revalidatePath(`/dirty-news/${slug}`);
}

async function deleteComment(formData: FormData) {
  await getAdminContext();
  const id = getRequiredString(formData, "id");

  if (isKvContentBackend()) {
    const slug = await getKvPostSlugForComment(id);
    await deleteKvComment(id);
    revalidatePath("/signal-control");
    revalidatePath("/dirty-news");
    if (slug) revalidatePath(`/dirty-news/${slug}`);
    return;
  }

  const { slug, supabase } = await getCommentPostSlug(id);
  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    throwAdminMutationError("Comment delete failed", error);
  }

  revalidatePath("/signal-control");
  revalidatePath(`/dirty-news/${slug}`);
}

async function updateHomeSettings(formData: FormData) {
  await getAdminContext();
  await updateKvHomeSettings(formData);
  revalidatePath("/");
  revalidatePath("/signal-control");
}

async function savePost(formData: FormData) {
  await getAdminContext();
  const post = await upsertKvPost(formData);
  revalidateNews();
  return postFeedback(post, false, post.review_source_url);
}

async function deletePost(formData: FormData) {
  await getAdminContext();
  await deleteKvPost(getRequiredString(formData, "id"));
  revalidateNews();
}

async function saveVideo(formData: FormData) {
  await getAdminContext();
  await upsertKvVideo(formData);
  revalidatePath("/");
  revalidatePath("/dirty-tv");
  revalidatePath("/signal-control");
}

async function deleteVideo(formData: FormData) {
  await getAdminContext();
  await deleteKvVideo(getRequiredString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/dirty-tv");
  revalidatePath("/signal-control");
}

function revalidateNews() {
  revalidatePath("/");
  revalidatePath("/dirty-news");
  revalidatePath("/dirty-news/[slug]", "page");
  revalidatePath("/dirty-tv");
  revalidatePath("/signal-control");
}

function postFeedback(
  post: Pick<KvDirtyNewsPost, "id" | "status" | "slug" | "published_at"> | null,
  alreadyReviewed: boolean,
  sourceUrl?: string | null
): SignalControlFeedback {
  if (!post) {
    return { message: "This submission has already been reviewed.", href: "#review-history", linkLabel: "Open Review History" };
  }
  if (post.status === "published" && post.published_at && Date.parse(post.published_at) <= Date.now()) {
    const message = alreadyReviewed ? "Already published. The existing post is still live." : "Published to Dirty News.";
    return {
      message: getVideoSource(sourceUrl) ? `${message} Clip filed in Video Trash.` : message,
      href: `/dirty-news/${encodeURIComponent(post.slug)}`,
      linkLabel: "View public post"
    };
  }
  const message = post.status === "draft" ? "Draft saved in Live Files." :
    post.status === "archived" ? "File archived and removed from the public feed." : "Publication scheduled.";
  return { message, href: `#post-${post.id}`, linkLabel: "Find in Live Files" };
}

const adminActions = new Map<string, [(formData: FormData) => Promise<void>, string]>([
  ["save-signal", [updateContactSubmission, "Signal saved."]],
  ["delete-signal", [deleteContactSubmission, "Signal deleted."]],
  ["delete-submission", [deletePostSubmission, "Submission deleted."]],
  ["hide-comment", [hideComment, "Comment hidden from the public thread."]],
  ["restore-comment", [restoreComment, "Comment restored to the public thread."]],
  ["delete-comment", [deleteComment, "Comment deleted."]],
  ["save-home", [updateHomeSettings, "Homepage copy saved."]],
  ["delete-post", [deletePost, "Dirty News file deleted."]],
  ["save-video", [saveVideo, "Video saved."]],
  ["delete-video", [deleteVideo, "Video removed from the active shelf."]]
]);

export async function submitSignalControlAction(_previous: SignalControlFeedback | null, formData: FormData): Promise<SignalControlFeedback> {
  try {
    const operation = getRequiredString(formData, "operation");
    if (operation === "review-news") {
      const intent = formData.get("intent");
      if (intent === "draft" || intent === "publish") return await publishPostSubmission(intent, formData);
      await updatePostSubmission(formData);
      const moved = formData.get("status") === "rejected" || formData.get("status") === "archived";
      return moved ? { message: "Review saved and moved to Review History.", href: "#review-history", linkLabel: "Open Review History" } :
        { message: "Submission edits saved in the queue." };
    }
    if (operation === "convert-signal") return await convertContactToDirtyNewsSubmission(formData);
    if (operation === "save-post") return await savePost(formData);
    const action = adminActions.get(operation);
    if (!action) throw new SignalControlFormError("That Signal Control action is unavailable.");
    if (operation.startsWith("delete-") && formData.get("confirmed") !== "yes") {
      throw new SignalControlFormError("Confirm the deletion before continuing.");
    }
    await action[0](formData);
    return { message: action[1] };
  } catch (error) {
    if (error instanceof SignalControlFormError) return { error: true, message: error.message };
    console.error("Signal Control action failed.", error);
    return { error: true, message: "Signal Control could not confirm the change. Check the record before retrying." };
  }
}
