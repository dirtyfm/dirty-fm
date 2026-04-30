import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validateComment,
  validateContactSubmission,
  validatePostSubmission,
  type CommentInput,
  type ContactSubmissionInput,
  type PostSubmissionInput
} from "../contentValidation.ts";
import type { Database } from "./types";

type DirtySupabaseClient = SupabaseClient<Database>;

export async function createContactSubmission(
  supabase: DirtySupabaseClient,
  input: ContactSubmissionInput
) {
  const validated = validateContactSubmission(input);

  if (!validated.ok) {
    return validated;
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .insert({
      attachment_url: validated.data.attachmentUrl ?? null,
      can_read_on_air: validated.data.canReadOnAir,
      email: validated.data.email,
      message: validated.data.message,
      name: validated.data.name,
      status: "pending",
      subject: validated.data.subject,
      submission_type: validated.data.submissionType
    })
    .select("id, created_at")
    .single();

  if (error) {
    return { errors: { database: error.message }, ok: false as const };
  }

  return { data, ok: true as const };
}

export async function createPostSubmission(
  supabase: DirtySupabaseClient,
  input: PostSubmissionInput
) {
  const validated = validatePostSubmission(input);

  if (!validated.ok) {
    return validated;
  }

  const { data, error } = await supabase
    .from("post_submissions")
    .insert({
      body: validated.data.body,
      category: validated.data.category,
      email: validated.data.email,
      name: validated.data.name,
      source_url: validated.data.sourceUrl ?? null,
      status: "pending",
      title: validated.data.title
    })
    .select("id, created_at")
    .single();

  if (error) {
    return { errors: { database: error.message }, ok: false as const };
  }

  return { data, ok: true as const };
}

export async function createComment(supabase: DirtySupabaseClient, input: CommentInput) {
  const validated = validateComment(input);

  if (!validated.ok) {
    return validated;
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      author_email: validated.data.authorEmail ?? null,
      author_name: validated.data.authorName,
      body: validated.data.body,
      post_id: validated.data.postId
    })
    .select("id, created_at")
    .single();

  if (error) {
    return { errors: { database: error.message }, ok: false as const };
  }

  return { data, ok: true as const };
}
