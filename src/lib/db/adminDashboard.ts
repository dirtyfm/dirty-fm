import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isKvContentBackend } from "@/lib/contentBackend";
import { createSupabaseServerClient } from "@/lib/db/supabase";
import type { Database } from "@/lib/db/types";
import { getExactCount, mapCommentsToPostTitles } from "@/lib/db/adminDashboardUtils";
import { getKvAdminDashboardData } from "@/lib/kv/contentStore";

export type AdminDashboardContact = Pick<
  Database["public"]["Tables"]["contact_submissions"]["Row"],
  | "id"
  | "name"
  | "email"
  | "subject"
  | "submission_type"
  | "message"
  | "status"
  | "admin_notes"
  | "can_read_on_air"
  | "created_at"
>;

export type AdminDashboardPostSubmission = Pick<
  Database["public"]["Tables"]["post_submissions"]["Row"],
  | "id"
  | "name"
  | "email"
  | "title"
  | "category"
  | "body"
  | "source_url"
  | "status"
  | "admin_notes"
  | "created_at"
>;

export type AdminDashboardPost = Pick<
  Database["public"]["Tables"]["posts"]["Row"],
  | "author"
  | "body"
  | "category"
  | "created_at"
  | "excerpt"
  | "featured_image_url"
  | "id"
  | "published_at"
  | "slug"
  | "status"
  | "title"
>;

export type AdminDashboardComment = Pick<
  Database["public"]["Tables"]["comments"]["Row"],
  "id" | "post_id" | "author_name" | "author_email" | "body" | "is_hidden" | "created_at"
> & {
  postTitle: string;
  postSlug: string | null;
};

export type AdminDashboardData = {
  comments: AdminDashboardComment[];
  contacts: AdminDashboardContact[];
  counts: {
    contactSubmissions: number;
    pendingDirtyNews: number;
    publishedPosts: number;
    recentComments: number;
  };
  postSubmissions: AdminDashboardPostSubmission[];
  posts: AdminDashboardPost[];
};

type DirtySupabaseClient = SupabaseClient<Database>;

async function getCount(
  supabase: DirtySupabaseClient,
  table: keyof Database["public"]["Tables"],
  column: string,
  value: string | boolean
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, value);

  if (error) {
    throw new Error(`Signal Control count failed for ${table}: ${error.message}`);
  }

  return getExactCount(count);
}

async function requireData<T>(
  result: { data: T | null; error: { message: string } | null },
  label: string
) {
  if (result.error) {
    throw new Error(`${label} lookup failed: ${result.error.message}`);
  }

  return result.data ?? ([] as T);
}

export async function getAdminDashboardData(
  accessToken: string
): Promise<AdminDashboardData> {
  if (isKvContentBackend()) {
    return getKvAdminDashboardData();
  }

  const supabase = createSupabaseServerClient(accessToken);

  const [
    contactSubmissions,
    pendingDirtyNews,
    publishedPosts,
    recentComments,
    contactsResult,
    postSubmissionsResult,
    postsResult,
    commentsResult
  ] = await Promise.all([
    getCount(supabase, "contact_submissions", "status", "pending"),
    getCount(supabase, "post_submissions", "status", "pending"),
    getCount(supabase, "posts", "status", "published"),
    getCount(supabase, "comments", "is_hidden", false),
    supabase
      .from("contact_submissions")
      .select(
        "id, name, email, subject, submission_type, message, status, admin_notes, can_read_on_air, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("post_submissions")
      .select("id, name, email, title, category, body, source_url, status, admin_notes, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, body, category, author, featured_image_url, status, published_at, created_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(8),
    supabase
      .from("comments")
      .select("id, post_id, author_name, author_email, body, is_hidden, created_at")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  const contacts = await requireData<AdminDashboardContact[]>(
    contactsResult,
    "Contact submissions"
  );
  const postSubmissions = await requireData<AdminDashboardPostSubmission[]>(
    postSubmissionsResult,
    "Dirty News submissions"
  );
  const posts = await requireData<AdminDashboardPost[]>(postsResult, "Published posts");
  const rawComments = await requireData<
    Pick<
      AdminDashboardComment,
      "id" | "post_id" | "author_name" | "author_email" | "body" | "is_hidden" | "created_at"
    >[]
  >(commentsResult, "Recent comments");
  const commentPostIds = Array.from(new Set(rawComments.map((comment) => comment.post_id)));
  const commentPostsResult =
    commentPostIds.length > 0
      ? await supabase.from("posts").select("id, title, slug").in("id", commentPostIds)
      : { data: [], error: null };
  const commentPostTitles = mapCommentsToPostTitles(
    rawComments,
    await requireData<Pick<AdminDashboardPost, "id" | "slug" | "title">[]>(
      commentPostsResult,
      "Comment post titles"
    )
  );
  const comments = rawComments.map((comment, index) => ({
    ...comment,
    ...commentPostTitles[index]
  }));

  return {
    comments,
    contacts,
    counts: {
      contactSubmissions,
      pendingDirtyNews,
      publishedPosts,
      recentComments
    },
    postSubmissions,
    posts
  };
}
