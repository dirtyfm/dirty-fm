import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirtyButton, SectionStamp, StaticPanel } from "@/components/dirty";
import { DirtyNewsCommentForm } from "@/components/dirty-news/DirtyNewsCommentForm";
import {
  formatPostDate,
  getPostBySlug,
  getPublishedPosts
} from "@/data/posts";
import {
  getPublicDirtyNewsPosts,
  getVisibleCommentsForPost,
  isUuid
} from "@/lib/db/posts";
import { isKvContentBackend } from "@/lib/contentBackend";

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

export const dynamic = "force-dynamic";

type PublicDirtyNewsPost = Awaited<ReturnType<typeof getPublicDirtyNewsPosts>>[number];

function getPostDateLabel(post: PublicDirtyNewsPost) {
  return post.archive?.publishedAtOriginal ?? formatPostDate(post.publishedAt);
}

export async function generateMetadata({
  params
}: DirtyNewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPublicDirtyNewsPosts();
  const post = posts.find((item) => item.slug === slug) ?? getPostBySlug(slug);

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
  const posts = await getPublicDirtyNewsPosts();
  const post = posts.find((item) => item.slug === slug) ?? getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getVisibleCommentsForPost(post.id);
  const canAcceptComments = isKvContentBackend() || isUuid(post.id);

  return (
    <article className="grid gap-8 min-[760px]:gap-10">
      <header className="broadcast-panel border-l-8 border-l-dirty-red p-5 min-[760px]:p-8">
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
              <dd className="text-dirty-ash">{post.author ?? "Unlisted"}</dd>
            </div>
            <div>
              <dt className="text-dirty-yellow">Published</dt>
              <dd className="text-dirty-ash">
                <time dateTime={post.publishedAt}>
                  {getPostDateLabel(post)}
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
          <p className="file-tape w-fit">Article file / plain text dispatch / no raw HTML</p>
          {post.body.map((paragraph) => (
            <p
              className="max-w-[68ch] text-lg leading-relaxed text-dirty-gray min-[760px]:text-xl"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="grid content-start gap-4">
          <StaticPanel label="File Notes" title="No Raw HTML. No Public Posting." tone="green">
            <p className="text-sm leading-snug">
              This post renders structured text from the active content wire.
              The public can send signals and comments, but they cannot publish
              posts directly.
            </p>
          </StaticPanel>
          {post.archive ? (
            <StaticPanel label="Legacy Archive" title="Original File Preserved." tone="yellow">
              <dl className="grid gap-3 font-utility text-xs font-black uppercase">
                <div>
                  <dt className="text-dirty-yellow">Legacy ID</dt>
                  <dd className="break-words text-dirty-ash">{post.archive.legacyId}</dd>
                </div>
                <div>
                  <dt className="text-dirty-yellow">Source File</dt>
                  <dd className="break-words text-dirty-ash">{post.archive.sourceFile}</dd>
                </div>
                <div>
                  <dt className="text-dirty-yellow">Original Date</dt>
                  <dd className="text-dirty-ash">{post.archive.publishedAtOriginal}</dd>
                </div>
                <div>
                  <dt className="text-dirty-yellow">Original Comments</dt>
                  <dd className="text-dirty-ash">{post.archive.commentCountOriginal}</dd>
                </div>
                <div>
                  <dt className="text-dirty-yellow">Legacy URL</dt>
                  <dd className="break-words text-dirty-ash">{post.archive.legacyUrl}</dd>
                </div>
              </dl>
            </StaticPanel>
          ) : null}
          <DirtyButton href="/dirty-news" variant="secondary" fullWidth>
            Back to Dirty News
          </DirtyButton>
        </aside>
      </div>

      <section className="grid gap-5" id="comments">
        <SectionStamp label="Open Mic Static" kicker="Immediate Comments" tone="yellow" />
        <div className="grid gap-5 border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-yellow bg-dirty-coal/82 p-5 shadow-signal min-[760px]:p-6">
          {canAcceptComments ? (
            <DirtyNewsCommentForm postId={post.id} postSlug={post.slug} />
          ) : (
            <p className="max-w-3xl text-lg leading-snug text-dirty-gray">
              This file is read-only until Signal Control gives it a live
              comment wire.
            </p>
          )}

          <div className="grid gap-3 border-t border-[rgba(183,178,168,0.24)] pt-5">
            <div className="flex flex-col gap-2 min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between">
              <h2 className="font-display text-4xl font-black uppercase leading-none text-dirty-ash">
                Audience Damage
              </h2>
              <p className="font-utility text-xs font-black uppercase text-dirty-yellow">
                {comments.length} visible
              </p>
            </div>
            {comments.length > 0 ? (
              <div className="grid gap-3">
                {comments.map((comment) => (
                  <article
                    className="border border-[rgba(183,178,168,0.24)] border-l-4 border-l-dirty-yellow bg-dirty-black/50 p-4 transition-colors hover:border-l-dirty-red"
                    key={comment.id}
                  >
                    <div className="flex flex-col gap-1 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between">
                      <h3 className="font-display text-2xl font-black uppercase leading-none text-dirty-ash">
                        {comment.authorName}
                      </h3>
                      <time
                        className="font-utility text-xs font-bold uppercase text-dirty-yellow"
                        dateTime={comment.createdAt}
                      >
                        {formatPostDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-dirty-gray">{comment.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[rgba(183,178,168,0.28)] bg-dirty-black/45 p-4">
                <p className="font-display text-3xl font-black uppercase leading-none text-dirty-ash">
                  The vent is quiet.
                </p>
                <p className="mt-2 text-dirty-gray">
                  No public comments on this file yet. Be the first person to
                  yell into it.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
