import "server-only";
import { dirtyNewsPosts, type DirtyNewsPost } from "@/data/posts";
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

function canUseSupabasePublicReads() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
  const fallbackPosts = dirtyNewsPosts.filter((post) => post.status === "published");

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

  return (data as DbPost[]).map(mapDbPost);
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
