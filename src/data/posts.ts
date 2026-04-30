export type PostStatus = "draft" | "published";

export type DirtyNewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  category: string;
  author: string;
  featuredImageUrl?: string;
  publishedAt: string;
  status: PostStatus;
};

export const dirtyNewsPosts: DirtyNewsPost[] = [
  {
    id: "dn-001",
    title: "The Machine Found Another Clipboard",
    slug: "machine-found-another-clipboard",
    excerpt:
      "A dirty little dispatch about rule-makers, nervous memos, and the magical belief that every loudmouth needs a handler.",
    body: [
      "The machinery woke up hungry again. New forms. New warnings. New people in soft chairs explaining why the rest of us need to talk like we are filing insurance claims.",
      "Dirty News is not here to pretend the memo is sacred. It is here to read the memo, smell the panic on it, and ask why the hall monitors always sound like they are one joke away from calling security.",
      "The signal remains simple: say the thing, keep it human, and do not confuse paperwork with morality."
    ],
    category: "Government Bullshit",
    author: "Drift",
    publishedAt: "2026-04-30T06:00:00.000Z",
    status: "published"
  },
  {
    id: "dn-002",
    title: "Public Access Hell Has Better Standards",
    slug: "public-access-hell-has-better-standards",
    excerpt:
      "Culture commentary from the wrong side of the broadcast, where the lighting is bad and the opinions have not been house-trained.",
    body: [
      "Everybody wants a clean feed until the clean feed starts sounding like an airport announcement trapped inside a human body.",
      "Public Access Hell had the decency to look cheap. Modern media wants to be fake-dangerous, fake-friendly, and fake-improvised while seventeen managers hold the leash off camera.",
      "DirtyFM prefers the bad lighting. At least you can see the fingerprints."
    ],
    category: "Public Access Hell",
    author: "Erik Woods",
    publishedAt: "2026-04-28T14:30:00.000Z",
    status: "published"
  },
  {
    id: "dn-003",
    title: "Open Mic Degeneracy Report: Static Edition",
    slug: "open-mic-degeneracy-report-static-edition",
    excerpt:
      "Listener noise, cracked complaints, half-useful rants, and the kind of ideas that should arrive wrapped in caution tape.",
    body: [
      "The open mic slot produced another pile of sparks. Some of them were funny. Some of them were legally shaped smoke. A few were almost useful, which is suspicious.",
      "This is the point of the door being kicked open: the archive gets stranger, the signal gets less obedient, and nobody gets to pre-approve the weather inside your skull.",
      "Send the rant. Keep it readable. Do not paste raw HTML like a cursed intern."
    ],
    category: "Open Mic",
    author: "DirtyFM Desk",
    publishedAt: "2026-04-25T19:15:00.000Z",
    status: "published"
  },
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
