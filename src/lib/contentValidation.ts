import { submissionTypes, type ContactFormValues } from "./contactValidation.ts";

export type ValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      errors: Record<string, string>;
    };

export type ContactSubmissionInput = {
  name: string;
  email: string;
  subject: string;
  submissionType: string;
  message: string;
  attachmentUrl?: string;
  canReadOnAir: boolean;
};

export type PostSubmissionInput = {
  name: string;
  email: string;
  title: string;
  category: string;
  body: string;
  sourceUrl?: string;
};

export type CommentInput = {
  postId: string;
  authorName: string;
  authorEmail?: string;
  body: string;
};

export const postSubmissionCategories = [
  "Dirty News",
  "Rants",
  "Prank Calls",
  "The Drift Files",
  "Fuck the Machine",
  "Open Mic",
  "Video Drops",
  "Public Access Hell",
  "Government Bullshit",
  "Random Fucking Bullshit"
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function cleanLongText(value: string, maxLength: number) {
  return value.trim().replace(/\r\n/g, "\n").slice(0, maxLength);
}

function validateOptionalUrl(value: string | undefined, field: string, errors: Record<string, string>) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (!["http:", "https:"].includes(url.protocol)) {
      errors[field] = "Use an http or https URL.";
      return null;
    }

    return url.toString();
  } catch {
    errors[field] = "Paste a valid URL or leave this empty.";
    return null;
  }
}

export function normalizeContactFormForSubmission(
  values: ContactFormValues
): ContactSubmissionInput {
  return {
    attachmentUrl: values.attachmentUrl,
    canReadOnAir: values.canReadOnAir === "yes",
    email: values.email,
    message: values.message,
    name: values.name,
    subject: values.subject,
    submissionType: values.submissionType
  };
}

export function validateContactSubmission(
  input: ContactSubmissionInput
): ValidationResult<ContactSubmissionInput> {
  const errors: Record<string, string> = {};
  const data = {
    attachmentUrl: validateOptionalUrl(input.attachmentUrl, "attachmentUrl", errors) ?? undefined,
    canReadOnAir: input.canReadOnAir,
    email: cleanText(input.email, 254).toLowerCase(),
    message: cleanLongText(input.message, 6000),
    name: cleanText(input.name, 120),
    subject: cleanText(input.subject, 160),
    submissionType: cleanText(input.submissionType, 80)
  };

  if (!data.name) {
    errors.name = "Name or alias is required.";
  }

  if (!emailPattern.test(data.email)) {
    errors.email = "Use a real email address so the signal can get answered.";
  }

  if (!data.subject) {
    errors.subject = "Subject is required.";
  }

  if (!submissionTypes.includes(data.submissionType as (typeof submissionTypes)[number])) {
    errors.submissionType = "Pick the bucket this mess belongs in.";
  }

  if (data.message.length < 20) {
    errors.message = "Give Drift at least 20 characters of usable static.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, ok: false };
  }

  return { data, ok: true };
}

export function validatePostSubmission(
  input: PostSubmissionInput
): ValidationResult<PostSubmissionInput> {
  const errors: Record<string, string> = {};
  const data = {
    body: cleanLongText(input.body, 20000),
    category: cleanText(input.category, 80),
    email: cleanText(input.email, 254).toLowerCase(),
    name: cleanText(input.name, 120),
    sourceUrl: validateOptionalUrl(input.sourceUrl, "sourceUrl", errors) ?? undefined,
    title: cleanText(input.title, 180)
  };

  if (!data.name) {
    errors.name = "Name or alias is required.";
  }

  if (!emailPattern.test(data.email)) {
    errors.email = "Use a real email address.";
  }

  if (data.title.length < 6) {
    errors.title = "Title needs at least 6 characters.";
  }

  if (!postSubmissionCategories.includes(data.category as (typeof postSubmissionCategories)[number])) {
    errors.category = "Pick a DirtyFM post bucket.";
  }

  if (data.body.length < 80) {
    errors.body = "Give Signal Control at least 80 characters to inspect.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, ok: false };
  }

  return { data, ok: true };
}

export function validateComment(input: CommentInput): ValidationResult<CommentInput> {
  const errors: Record<string, string> = {};
  const trimmedAuthorName = input.authorName.trim();
  const trimmedBody = input.body.trim();
  const data = {
    authorEmail: input.authorEmail ? cleanText(input.authorEmail, 254).toLowerCase() : undefined,
    authorName: cleanText(input.authorName, 120),
    body: cleanLongText(input.body, 4000),
    postId: input.postId.trim()
  };

  if (!uuidPattern.test(data.postId)) {
    errors.postId = "Comments must attach to a real post file.";
  }

  if (!data.authorName) {
    errors.authorName = "Name or alias is required.";
  } else if (trimmedAuthorName.length > 120) {
    errors.authorName = "Name or alias must stay under 120 characters.";
  }

  if (data.authorEmail && !emailPattern.test(data.authorEmail)) {
    errors.authorEmail = "Use a real email address or leave it empty.";
  }

  if (trimmedBody.length < 8) {
    errors.body = "Comment needs at least 8 characters.";
  } else if (trimmedBody.length > 4000) {
    errors.body = "Comment must stay under 4000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, ok: false };
  }

  return { data, ok: true };
}
