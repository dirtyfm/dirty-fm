"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { DIRTYFM_ACCESS_TOKEN_COOKIE } from "@/lib/authSession";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { requireAdmin } from "@/lib/db/admin";
import { validatePostSubmission } from "@/lib/contentValidation";
import {
  cleanAdminNotes,
  createDirtyNewsExcerpt,
  createDirtyNewsSlug,
  isContactSubmissionStatus,
  isPostSubmissionStatus
} from "@/lib/submissionWorkflows";

function throwAdminMutationError(label: string, error: unknown): never {
  console.error(label, error);
  throw new Error("Signal Control could not complete that protected action.");
}

async function getAdminContext() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DIRTYFM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error("Signal Control session missing.");
  }

  const profile = await requireAdmin(accessToken);
  const supabase = createSupabaseServerClient(accessToken);

  return { profile, supabase };
}

function getRequiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

export async function updateContactSubmission(formData: FormData) {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const status = formData.get("status");

  if (!isContactSubmissionStatus(status)) {
    throw new Error("Invalid contact submission status.");
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

export async function deleteContactSubmission(formData: FormData) {
  const { supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);

  if (error) {
    throwAdminMutationError("Contact delete failed", error);
  }

  revalidatePath("/signal-control");
}

export async function updatePostSubmission(formData: FormData) {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const status = formData.get("status");

  if (!isPostSubmissionStatus(status)) {
    throw new Error("Invalid Dirty News submission status.");
  }

  const validated = validatePostSubmission({
    body: getRequiredString(formData, "body"),
    category: getRequiredString(formData, "category"),
    email: getRequiredString(formData, "email"),
    name: getRequiredString(formData, "name"),
    sourceUrl: (formData.get("source_url") as string | null) ?? undefined,
    title: getRequiredString(formData, "title")
  });

  if (!validated.ok) {
    throw new Error(Object.values(validated.errors).join(" "));
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
    .eq("id", id);

  if (error) {
    throwAdminMutationError("Dirty News submission update failed", error);
  }

  revalidatePath("/signal-control");
}

export async function publishPostSubmission(formData: FormData) {
  const { profile, supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const intent = getRequiredString(formData, "intent");
  const postStatus = intent === "publish" ? "published" : "draft";
  const submissionStatus = intent === "publish" ? "published" : "draft";
  const author = getRequiredString(formData, "author").slice(0, 120);
  const excerpt = createDirtyNewsExcerpt(
    getRequiredString(formData, "body"),
    formData.get("excerpt") as string | null
  );
  const validated = validatePostSubmission({
    body: getRequiredString(formData, "body"),
    category: getRequiredString(formData, "category"),
    email: getRequiredString(formData, "email"),
    name: getRequiredString(formData, "name"),
    sourceUrl: (formData.get("source_url") as string | null) ?? undefined,
    title: getRequiredString(formData, "title")
  });

  if (!validated.ok) {
    throw new Error(Object.values(validated.errors).join(" "));
  }

  const publishedAt = postStatus === "published" ? new Date().toISOString() : null;
  const { error: postError } = await supabase.from("posts").insert({
    author,
    body: validated.data.body,
    category: validated.data.category,
    created_by: profile.user_id,
    excerpt,
    published_at: publishedAt,
    slug: createDirtyNewsSlug(validated.data.title, id),
    status: postStatus,
    title: validated.data.title,
    updated_by: profile.user_id
  });

  if (postError) {
    throwAdminMutationError("Post creation failed", postError);
  }

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
      status: submissionStatus,
      title: validated.data.title
    })
    .eq("id", id);

  if (submissionError) {
    throwAdminMutationError("Submission status update failed", submissionError);
  }

  revalidatePath("/signal-control");
  revalidatePath("/dirty-news");
}

export async function deletePostSubmission(formData: FormData) {
  const { supabase } = await getAdminContext();
  const id = getRequiredString(formData, "id");
  const { error } = await supabase.from("post_submissions").delete().eq("id", id);

  if (error) {
    throwAdminMutationError("Dirty News submission delete failed", error);
  }

  revalidatePath("/signal-control");
}

async function getCommentPostSlug(commentId: string) {
  const { supabase } = await getAdminContext();
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

export async function hideComment(formData: FormData) {
  const { profile } = await getAdminContext();
  const id = getRequiredString(formData, "id");
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

export async function restoreComment(formData: FormData) {
  const id = getRequiredString(formData, "id");
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

export async function deleteComment(formData: FormData) {
  const id = getRequiredString(formData, "id");
  const { slug, supabase } = await getCommentPostSlug(id);
  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    throwAdminMutationError("Comment delete failed", error);
  }

  revalidatePath("/signal-control");
  revalidatePath(`/dirty-news/${slug}`);
}
