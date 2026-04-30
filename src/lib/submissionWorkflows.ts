import type { ContactSubmissionStatus, PostSubmissionStatus } from "./db/types";

export const contactSubmissionStatuses = [
  "pending",
  "approved",
  "rejected",
  "archived",
  "read_on_air"
] as const satisfies readonly ContactSubmissionStatus[];

export const postSubmissionStatuses = [
  "pending",
  "approved",
  "rejected",
  "draft",
  "published",
  "archived"
] as const satisfies readonly PostSubmissionStatus[];

export function isContactSubmissionStatus(
  value: unknown
): value is ContactSubmissionStatus {
  return (
    typeof value === "string" &&
    contactSubmissionStatuses.includes(value as ContactSubmissionStatus)
  );
}

export function isPostSubmissionStatus(value: unknown): value is PostSubmissionStatus {
  return (
    typeof value === "string" &&
    postSubmissionStatuses.includes(value as PostSubmissionStatus)
  );
}

export function cleanAdminNotes(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 4000) || null : null;
}

export function createDirtyNewsSlug(title: string, fallbackId: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");

  return `${base || "dirty-news-file"}-${fallbackId.slice(0, 8)}`;
}

export function createDirtyNewsExcerpt(body: string, providedExcerpt?: string | null) {
  const cleanedProvided = providedExcerpt?.trim().replace(/\s+/g, " ");

  if (cleanedProvided) {
    return cleanedProvided.slice(0, 320);
  }

  return body.trim().replace(/\s+/g, " ").slice(0, 240);
}
