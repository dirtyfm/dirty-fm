"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { createComment, createPostSubmission } from "@/lib/db/submissions";
import type { CommentInput, PostSubmissionInput } from "@/lib/contentValidation";

export type DirtyNewsSubmissionActionState = {
  errors?: Record<string, string>;
  ok: boolean;
};

export type DirtyNewsCommentActionState = DirtyNewsSubmissionActionState;

export async function submitDirtyNewsSignal(
  input: PostSubmissionInput
): Promise<DirtyNewsSubmissionActionState> {
  const supabase = createSupabaseServerClient();
  const result = await createPostSubmission(supabase, input);

  if (!result.ok) {
    return { errors: result.errors, ok: false };
  }

  return { ok: true };
}

export async function submitDirtyNewsComment(
  input: CommentInput & { honeypot?: string; postSlug: string }
): Promise<DirtyNewsCommentActionState> {
  if (input.honeypot?.trim()) {
    return { errors: { body: "The static tripped the spam wire." }, ok: false };
  }

  const supabase = createSupabaseServerClient();
  const result = await createComment(supabase, input);

  if (!result.ok) {
    return { errors: result.errors, ok: false };
  }

  revalidatePath(`/dirty-news/${input.postSlug}`);
  revalidatePath("/signal-control");

  return { ok: true };
}
