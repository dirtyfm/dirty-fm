"use server";

import { createSupabaseServerClient } from "@/lib/db/supabase";
import { createContactSubmission } from "@/lib/db/submissions";
import {
  normalizeContactFormForSubmission,
  type ContactSubmissionInput
} from "@/lib/contentValidation";
import type { ContactFormValues } from "@/lib/contactValidation";

export type ContactSubmissionActionState = {
  errors?: Record<string, string>;
  ok: boolean;
};

export async function submitContactSignal(
  values: ContactFormValues
): Promise<ContactSubmissionActionState> {
  const input: ContactSubmissionInput = normalizeContactFormForSubmission(values);
  const supabase = createSupabaseServerClient();
  const result = await createContactSubmission(supabase, input);

  if (!result.ok) {
    return { errors: result.errors, ok: false };
  }

  return { ok: true };
}
