import type { Metadata } from "next";
import { ArchiveCard, DirtyButton, DirtyNewsCard, SectionStamp, StaticPanel } from "@/components/dirty";
import { DirtyNewsSubmissionForm } from "@/components/dirty-news/DirtyNewsSubmissionForm";
import {
  formatPostDate
} from "@/data/posts";
import {
  getDirtyNewsCategoriesFromPosts,
  getPublicDirtyNewsPosts,
  getPublishedPostsByCategoryFromPosts
} from "@/lib/db/posts";
import type { DirtyTone } from "@/components/dirty/shared";

type DirtyNewsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Dirty News",
  description:
    "Dirty News from DirtyFM: raw commentary, dispatches, rants, and notes from the wrong side of the broadcast."
};

export const dynamic = "force-dynamic";

const cardTones: DirtyTone[] = ["yellow", "red", "green", "blue"];

function getPostDateLabel(post: Awaited<ReturnType<typeof getPublicDirtyNewsPosts>>[number]) {
  return post.archive?.publishedAtOriginal ?? formatPostDate(post.publishedAt);
}

export default async function DirtyNewsPage({
  searchParams
}: DirtyNewsPageProps) {
  const params = await searchParams;
  const activeCategory = params?.category;
  const publishedPosts = await getPublicDirtyNewsPosts();
  const categories = getDirtyNewsCategoriesFromPosts(publishedPosts);
  const posts = getPublishedPostsByCategoryFromPosts(
    publishedPosts,
    categories.includes(activeCategory ?? "") ? activeCategory : undefined
  );
  const featuredPost = publishedPosts[0] ?? null;

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(112deg,rgba(209,42,31,0.1)_0,rgba(209,42,31,0.1)_2px,transparent_2px,transparent_22px)] opacity-50"
          aria-hidden="true"
        />
        <div className="relative grid gap-5">
          <p className="eyebrow">Dirty News / Public Feed</p>
          <h1 className="max-w-[11ch] font-display text-[clamp(3rem,12vw,7.5rem)] font-black uppercase leading-[0.9] text-dirty-ash">
            Notes From the Wrong Side of the Broadcast.
          </h1>
          <p className="max-w-3xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
            Drift&apos;s written output plus whatever the open mic dragged in.
            Archived posts from the old site, new dispatches, arguments without
            a clear winner. Everything here went through Signal Control before
            it got here.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Filter the Static" kicker="Categories" tone="yellow" />
          <p className="max-w-xl font-utility text-xs font-bold uppercase text-dirty-gray">
            Pick a bucket. The signal gets narrower, not cleaner.
          </p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 min-[760px]:mx-0 min-[760px]:flex-wrap min-[760px]:overflow-visible min-[760px]:px-0 min-[760px]:pb-0">
          <DirtyButton
            href="/dirty-news"
            variant={!activeCategory ? "primary" : "ghost"}
          >
            All Dispatches
          </DirtyButton>
          {categories.map((category) => (
            <DirtyButton
              href={`/dirty-news?category=${encodeURIComponent(category)}`}
              key={category}
              variant={activeCategory === category ? "primary" : "ghost"}
            >
              {category}
            </DirtyButton>
          ))}
        </div>
      </section>

      {featuredPost ? (
        <ArchiveCard
          actionLabel="Open the Latest File"
          href={`/dirty-news/${featuredPost.slug}`}
          label="Latest Dirty News"
          meta={[
            { label: "Category", value: featuredPost.category },
            { label: "Author", value: featuredPost.author ?? "Unlisted" },
            { label: "Published", value: getPostDateLabel(featuredPost) },
            ...(featuredPost.archive
              ? [
                  {
                    label: "Original Comments",
                    value: String(featuredPost.archive.commentCountOriginal)
                  }
                ]
              : [])
          ]}
          notes={featuredPost.excerpt}
          title={featuredPost.title}
          tone="red"
        />
      ) : null}

      <section className="grid gap-5">
        <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp
            label={activeCategory ?? "Dirty Feed"}
            kicker="Transmission Log"
            tone="green"
          />
          <DirtyButton href="/contact" variant="secondary">
            Send a Signal
          </DirtyButton>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-4 min-[860px]:grid-cols-3">
            {posts.map((post, index) => (
              <DirtyNewsCard
                category={post.category}
                dateLabel={getPostDateLabel(post)}
                excerpt={post.excerpt}
                href={`/dirty-news/${post.slug}`}
                key={post.id}
                status="Published"
                title={post.title}
                tone={cardTones[index % cardTones.length]}
              />
            ))}
          </div>
        ) : (
          <StaticPanel label="Empty Archive Drawer" title="No Published Static Yet." tone="yellow">
            <p className="max-w-2xl text-lg leading-snug">
              Nothing public is filed under this bucket yet. Either the archive
              is quiet, or the good stuff is still locked behind the studio
              door.
            </p>
            <p className="file-tape mt-4 max-w-xl">
              Drawer status: empty, dusty, still accepting signals.
            </p>
          </StaticPanel>
        )}
      </section>

      <StaticPanel
        label="Dirty News Submission"
        title="Got a Rant, Clip, Complaint, or Bad Idea?"
        tone="red"
        footer={
          <DirtyButton href="/contact" variant="secondary">
            Send It In
          </DirtyButton>
        }
      >
        <p className="max-w-3xl text-lg leading-snug">
          Submissions go to a review queue, not straight to the site. Write the
          thing, send it in, leave the HTML where it belongs.
        </p>
      </StaticPanel>

      <DirtyNewsSubmissionForm />
    </div>
  );
}
