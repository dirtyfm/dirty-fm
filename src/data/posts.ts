import { dirtyfmArchivedPosts } from "./dirtyfmArchivedPosts.ts";

export type PostStatus = "draft" | "published";

export type ArchivedPostComment = {
  author?: string | null;
  body?: string | null;
  createdAt?: string | null;
};

export type ArchivedPostImage = {
  alt: string;
  src: string;
};

export type DirtyNewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  category: string;
  author: string | null;
  featuredImageUrl?: string;
  publishedAt: string;
  status: PostStatus;
  archive?: {
    legacyId: string;
    sourceFile: string;
    sourceArchiveUrl: string;
    legacyUrl: string;
    publishedAtOriginal: string;
    commentCountOriginal: number;
    comments: readonly ArchivedPostComment[];
    bodyText: string;
    bodyHtmlPreserved: string;
    images: readonly ArchivedPostImage[];
    archiveNote: string;
  };
};

function toParagraphs(bodyText: string) {
  return bodyText.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function toExcerpt(bodyText: string) {
  const text = bodyText.replace(/\s+/g, " ").trim();

  if (text.length <= 180) {
    return text;
  }

  return `${text.slice(0, 177).trimEnd()}...`;
}

// Archive text intentionally preserves original spelling, grammar, dates,
// bylines, legacy URLs, source files, HTML, and original comment counts.
const archivedDirtyNewsPosts: DirtyNewsPost[] = dirtyfmArchivedPosts.map((post) => ({
  archive: {
    archiveNote: post.archiveNote,
    bodyHtmlPreserved: post.bodyHtmlPreserved,
    bodyText: post.bodyText,
    commentCountOriginal: post.commentCountOriginal,
    comments: post.comments,
    images: post.images,
    legacyId: post.legacyId,
    legacyUrl: post.legacyUrl,
    publishedAtOriginal: post.publishedAtOriginal,
    sourceArchiveUrl: post.sourceArchiveUrl,
    sourceFile: post.sourceFile
  },
  author: post.author,
  body: toParagraphs(post.bodyText),
  category: "Dirty News",
  excerpt: toExcerpt(post.bodyText),
  id: post.legacyId,
  publishedAt: `${post.publishedAt}T00:00:00.000Z`,
  slug: post.slug,
  status: post.status,
  title: post.title
}));

const seededDirtyNewsPosts: DirtyNewsPost[] = [
  {
    id: "dn-004",
    title: "Draft File the Public Does Not Get",
    slug: "draft-file-the-public-does-not-get",
    excerpt: "This draft exists to prove unpublished posts stay off the public wire.",
    body: ["Draft copy should not render on public Dirty News pages."],
    category: "The Drift Files",
    author: "Signal Control",
    publishedAt: "2026-05-01T12:00:00.000Z",
    status: "draft"
  }
];

export const dirtyNewsPosts: DirtyNewsPost[] = [
  ...seededDirtyNewsPosts,
  ...archivedDirtyNewsPosts
];

function byNewestPublished(a: DirtyNewsPost, b: DirtyNewsPost) {
  return (
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPublishedPosts() {
  return dirtyNewsPosts
    .filter((post) => post.status === "published")
    .sort(byNewestPublished);
}

export function getFeaturedPost() {
  return getPublishedPosts()[0] ?? null;
}

export function getPostBySlug(slug: string) {
  return getPublishedPosts().find((post) => post.slug === slug) ?? null;
}

export function getDirtyNewsCategories() {
  return Array.from(new Set(getPublishedPosts().map((post) => post.category)));
}

export function getPublishedPostsByCategory(category?: string) {
  const posts = getPublishedPosts();

  if (!category) {
    return posts;
  }

  return posts.filter((post) => post.category === category);
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}
