"use server";

import { createSupabaseServerClient } from "@/lib/db/supabase";
import { createPostSubmission } from "@/lib/db/submissions";
import type { PostSubmissionInput } from "@/lib/contentValidation";

export type DirtyNewsSubmissionActionState = {
  errors?: Record<string, string>;
  ok: boolean;
};

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
