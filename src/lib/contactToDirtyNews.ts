import {
  postSubmissionCategories,
  type PostSubmissionInput
} from "./contentValidation.ts";

type ContactSignalForDirtyNews = {
  attachment_url: string | null;
  can_read_on_air: boolean;
  email: string;
  id: string;
  message: string;
  name: string;
  subject: string;
  submission_type: string;
};

export type ContactToDirtyNewsDraft = PostSubmissionInput & {
  adminNotes: string;
};

export function normalizeDirtyNewsCategory(value: unknown) {
  return postSubmissionCategories.includes(value as (typeof postSubmissionCategories)[number])
    ? (value as (typeof postSubmissionCategories)[number])
    : "Open Mic";
}

export function createContactDirtyNewsAdminNotes(contact: ContactSignalForDirtyNews) {
  const consentNote = contact.can_read_on_air
    ? "Read-on-air consent: yes."
    : "Read-on-air consent: no. Review before airing.";

  return `Converted from contact signal ${contact.id}. ${consentNote}`;
}

export function createContactDirtyNewsBody(contact: ContactSignalForDirtyNews) {
  return [
    `Signal from: ${contact.name}`,
    `Signal type: ${contact.submission_type}`,
    `Original subject: ${contact.subject}`,
    "",
    contact.message,
    contact.attachment_url ? `\nAttachment/source wire: ${contact.attachment_url}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export function createDirtyNewsDraftFromContact(
  contact: ContactSignalForDirtyNews,
  category: unknown
): ContactToDirtyNewsDraft {
  return {
    adminNotes: createContactDirtyNewsAdminNotes(contact),
    body: createContactDirtyNewsBody(contact),
    category: normalizeDirtyNewsCategory(category),
    email: contact.email,
    name: contact.name,
    sourceUrl: contact.attachment_url ?? undefined,
    title: contact.subject
  };
}
