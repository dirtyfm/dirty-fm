import "server-only";
import { getPublishedPosts, type DirtyNewsPost } from "@/data/posts";
import { mapVisiblePublicComments, type PublicDirtyNewsComment } from "@/lib/db/commentMapping";
import { createSupabaseServerClient } from "@/lib/db/supabase";

type DbPost = {
  author: string;
  body: string;
  category: string;
  excerpt: string;
  featured_image_url: string | null;
  id: string;
  published_at: string | null;
  slug: string;
  status: "published";
  title: string;
};

type DbComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  is_hidden?: boolean;
};

function canUseSupabasePublicReads() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function mapDbPost(post: DbPost): DirtyNewsPost {
  return {
    author: post.author,
    body: post.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    category: post.category,
    excerpt: post.excerpt,
    featuredImageUrl: post.featured_image_url ?? undefined,
    id: post.id,
    publishedAt: post.published_at ?? new Date(0).toISOString(),
    slug: post.slug,
    status: "published",
    title: post.title
  };
}

export async function getPublicDirtyNewsPosts() {
  const fallbackPosts = getPublishedPosts();

  if (!canUseSupabasePublicReads()) {
    return fallbackPosts;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, body, category, author, featured_image_url, status, published_at")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error || !data) {
    return fallbackPosts;
  }

  const dbPosts = (data as DbPost[]).map(mapDbPost);
  const dbSlugs = new Set(dbPosts.map((post) => post.slug));
  const staticPostsNotInDb = fallbackPosts.filter((post) => !dbSlugs.has(post.slug));

  return [...dbPosts, ...staticPostsNotInDb].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getVisibleCommentsForPost(
  postId: string
): Promise<PublicDirtyNewsComment[]> {
  if (!canUseSupabasePublicReads() || !isUuid(postId)) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return mapVisiblePublicComments(data as DbComment[]);
}

export function getDirtyNewsCategoriesFromPosts(posts: DirtyNewsPost[]) {
  return Array.from(new Set(posts.map((post) => post.category)));
}

export function getPublishedPostsByCategoryFromPosts(
  posts: DirtyNewsPost[],
  category?: string
) {
  if (!category) {
    return posts;
  }

  return posts.filter((post) => post.category === category);
}
