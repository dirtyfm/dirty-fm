"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isKvContentBackend } from "@/lib/contentBackend";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { createComment, createPostSubmission } from "@/lib/db/submissions";
import { createKvComment, createKvPostSubmission } from "@/lib/kv/contentStore";
import type { CommentInput, PostSubmissionInput } from "@/lib/contentValidation";
import {
  checkHoneypot,
  checkPublicRateLimit,
  getClientIp
} from "@/lib/publicInputGuards";

export type DirtyNewsSubmissionActionState = {
  errors?: Record<string, string>;
  ok: boolean;
};

export type DirtyNewsCommentActionState = DirtyNewsSubmissionActionState;

export async function submitDirtyNewsSignal(
  input: PostSubmissionInput & { honeypot?: string }
): Promise<DirtyNewsSubmissionActionState> {
  if (checkHoneypot(input.honeypot)) {
    return { errors: { body: "The spam wire tripped." }, ok: false };
  }

  const headersList = await headers();
  const rateLimit = checkPublicRateLimit("dirty-news", getClientIp(headersList));

  if (!rateLimit.ok) {
    return { errors: { body: "Too much static too fast. Wait a minute and try again." }, ok: false };
  }

  const result = isKvContentBackend()
    ? await createKvPostSubmission(input)
    : await createPostSubmission(createSupabaseServerClient(), input);

  if (!result.ok) {
    return { errors: result.errors, ok: false };
  }

  return { ok: true };
}

export async function submitDirtyNewsComment(
  input: CommentInput & { honeypot?: string; postSlug: string }
): Promise<DirtyNewsCommentActionState> {
  if (checkHoneypot(input.honeypot)) {
    return { errors: { body: "The static tripped the spam wire." }, ok: false };
  }

  const headersList = await headers();
  const rateLimit = checkPublicRateLimit("comment", getClientIp(headersList));

  if (!rateLimit.ok) {
    return { errors: { body: "Too much static too fast. Wait a minute and try again." }, ok: false };
  }

  const result = isKvContentBackend()
    ? await createKvComment(input)
    : await createComment(createSupabaseServerClient(), input);

  if (!result.ok) {
    return { errors: result.errors, ok: false };
  }

  revalidatePath(`/dirty-news/${input.postSlug}`);
  revalidatePath("/signal-control");

  return { ok: true };
}
