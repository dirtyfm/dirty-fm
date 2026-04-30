import type { ContactSubmissionStatus, PostSubmissionStatus } from "@/lib/db/types";

export type KvPostStatus = "archived" | "draft" | "published";

export type KvDirtyNewsPost = {
  author: string;
  body: string;
  category: string;
  created_at: string;
  excerpt: string;
  featured_image_url: string | null;
  id: string;
  published_at: string | null;
  slug: string;
  status: KvPostStatus;
  title: string;
  updated_at: string;
};

export type KvContactSubmission = {
  admin_notes: string | null;
  attachment_url: string | null;
  can_read_on_air: boolean;
  created_at: string;
  email: string;
  id: string;
  message: string;
  name: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  status: ContactSubmissionStatus;
  subject: string;
  submission_type: string;
  updated_at: string;
};

export type KvPostSubmission = {
  admin_notes: string | null;
  body: string;
  category: string;
  created_at: string;
  email: string;
  id: string;
  name: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  source_url: string | null;
  status: PostSubmissionStatus;
  title: string;
  updated_at: string;
};

export type KvComment = {
  author_email: string | null;
  author_name: string;
  body: string;
  created_at: string;
  hidden_at: string | null;
  hidden_by: string | null;
  id: string;
  is_hidden: boolean;
  post_id: string;
  updated_at: string;
};

export type KvVideoStatus = "archive file" | "featured" | "raw clip" | "unapproved";

export type KvVideo = {
  category: string;
  created_at: string;
  description: string;
  host: string;
  id: string;
  is_featured: boolean;
  published_at: string;
  status: KvVideoStatus;
  title: string;
  updated_at: string;
  youtube_id: string;
};

export type KvHomeSettings = {
  hero_aside: string;
  hero_body: string;
  hero_eyebrow: string;
  hero_title: string;
  id: "home";
  updated_at: string;
};
