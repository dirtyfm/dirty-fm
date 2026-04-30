"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isKvContentBackend } from "@/lib/contentBackend";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import { createContactSubmission } from "@/lib/db/submissions";
import { createKvContactSubmission } from "@/lib/kv/contentStore";
import {
  normalizeContactFormForSubmission,
  type ContactSubmissionInput
} from "@/lib/contentValidation";
import {
  hasContactValidationErrors,
  validateContactForm,
  type ContactFormValues
} from "@/lib/contactValidation";
import {
  checkHoneypot,
  checkPublicRateLimit,
  getClientIp
} from "@/lib/publicInputGuards";

export type ContactSubmissionActionState = {
  errors?: Record<string, string>;
  ok: boolean;
};

export async function submitContactSignal(
  values: ContactFormValues & { website?: string }
): Promise<ContactSubmissionActionState> {
  const validationErrors = validateContactForm(values);

  if (hasContactValidationErrors(validationErrors)) {
    return { errors: validationErrors, ok: false };
  }

  if (checkHoneypot(values.website)) {
    return { errors: { message: "The spam wire tripped." }, ok: false };
  }

  const headersList = await headers();
  const rateLimit = checkPublicRateLimit("contact", getClientIp(headersList));

  if (!rateLimit.ok) {
    return { errors: { message: "Too much static too fast. Wait a minute and try again." }, ok: false };
  }

  const input: ContactSubmissionInput = normalizeContactFormForSubmission(values);
  if (isKvContentBackend()) {
    const result = await createKvContactSubmission(input);

    if (!result.ok) {
      return { errors: result.errors, ok: false };
    }

    revalidatePath("/signal-control");

    return { ok: true };
  }

  const supabase = createSupabaseServerClient();
  const result = await createContactSubmission(supabase, input);

  if (!result.ok) {
    return { errors: result.errors, ok: false };
  }

  revalidatePath("/signal-control");

  return { ok: true };
}
