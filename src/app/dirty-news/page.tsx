import type { Metadata } from "next";
import { ArchiveCard, DirtyButton, DirtyNewsCard, SectionStamp, StaticPanel } from "@/components/dirty";
import {
  formatPostDate,
  getDirtyNewsCategories,
  getFeaturedPost,
  getPublishedPostsByCategory
} from "@/data/posts";

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

export default async function DirtyNewsPage({
  searchParams
}: DirtyNewsPageProps) {
  const params = await searchParams;
  const activeCategory = params?.category;
  const categories = getDirtyNewsCategories();
  const posts = getPublishedPostsByCategory(
    categories.includes(activeCategory ?? "") ? activeCategory : undefined
  );
  const featuredPost = getFeaturedPost();

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <section className="relative overflow-hidden border border-[rgba(183,178,168,0.24)] bg-dirty-black/50 p-5 shadow-signal min-[760px]:p-8">
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
            Rants, clips, arguments, updates, and whatever crawled out of the
            DirtyFM wire. Published files only. Drafts stay locked in Signal
            Control until somebody with keys makes the mess public.
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
        <div className="flex flex-wrap gap-2">
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
            { label: "Author", value: featuredPost.author },
            { label: "Published", value: formatPostDate(featuredPost.publishedAt) }
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
            {posts.map((post) => (
              <DirtyNewsCard
                category={post.category}
                dateLabel={formatPostDate(post.publishedAt)}
                excerpt={post.excerpt}
                href={`/dirty-news/${post.slug}`}
                key={post.id}
                status="Published"
                title={post.title}
              />
            ))}
          </div>
        ) : (
          <StaticPanel label="Empty Wire" title="No Published Static Yet." tone="yellow">
            <p className="max-w-2xl text-lg leading-snug">
              Nothing public is filed under this bucket yet. Either the archive
              is quiet, or the good stuff is still locked behind the studio
              door.
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
          Dirty News submissions are a front-door signal, not a public
          publishing button. Send the lead, keep it readable, and leave raw HTML
          in the dumpster where it belongs.
        </p>
      </StaticPanel>
    </div>
  );
}
