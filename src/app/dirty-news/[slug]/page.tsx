import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirtyButton, SectionStamp, StaticPanel } from "@/components/dirty";
import {
  formatPostDate,
  getPostBySlug,
  getPublishedPosts
} from "@/data/posts";

type DirtyNewsPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({
  params
}: DirtyNewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Dirty News File Missing"
    };
  }

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function DirtyNewsPostPage({
  params
}: DirtyNewsPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="grid gap-8 min-[760px]:gap-10">
      <header className="relative overflow-hidden border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-red bg-dirty-purple/70 p-5 shadow-signal min-[760px]:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(214,184,74,0.16),transparent_12rem),repeating-linear-gradient(0deg,rgba(183,178,168,0.07)_0,rgba(183,178,168,0.07)_1px,transparent_1px,transparent_7px)] opacity-60"
          aria-hidden="true"
        />
        <div className="relative grid gap-5">
          <SectionStamp label={post.category} kicker="Dirty News File" tone="red" />
          <h1 className="max-w-4xl font-display text-[clamp(3rem,11vw,7rem)] font-black uppercase leading-[0.9] text-dirty-ash">
            {post.title}
          </h1>
          <dl className="grid gap-2 border-y border-[rgba(183,178,168,0.24)] py-4 font-utility text-xs font-black uppercase text-dirty-gray min-[640px]:grid-cols-3">
            <div>
              <dt className="text-dirty-yellow">Author</dt>
              <dd className="text-dirty-ash">{post.author}</dd>
            </div>
            <div>
              <dt className="text-dirty-yellow">Published</dt>
              <dd className="text-dirty-ash">
                <time dateTime={post.publishedAt}>
                  {formatPostDate(post.publishedAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-dirty-yellow">Status</dt>
              <dd className="text-dirty-ash">Published</dd>
            </div>
          </dl>
          <p className="max-w-3xl text-xl leading-snug text-dirty-ash">
            {post.excerpt}
          </p>
        </div>
      </header>

      <div className="grid gap-8 min-[920px]:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-5 border border-[rgba(183,178,168,0.24)] bg-dirty-coal/82 p-5 shadow-signal min-[760px]:p-8">
          {post.body.map((paragraph) => (
            <p
              className="text-lg leading-relaxed text-dirty-gray min-[760px]:text-xl"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="grid content-start gap-4">
          <StaticPanel label="File Notes" title="No Raw HTML. No Public Posting." tone="green">
            <p className="text-sm leading-snug">
              This post renders structured text from local content. The public
              can send signals, but they cannot publish posts directly.
            </p>
          </StaticPanel>
          <DirtyButton href="/dirty-news" variant="secondary" fullWidth>
            Back to Dirty News
          </DirtyButton>
        </aside>
      </div>

      <StaticPanel label="Comments" title="Static From the Audience Goes Here." tone="yellow">
        <p className="max-w-3xl text-lg leading-snug">
          Comments are not wired up yet. When they are, the public can talk
          back without getting a publish button for Dirty News posts.
        </p>
      </StaticPanel>
    </article>
  );
}
