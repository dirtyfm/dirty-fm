import type { Metadata } from "next";
import {
  ArchivedDirtyTVArchive,
  DirtyButton,
  DirtyTVPlayer,
  SectionStamp,
  SendSignalCTA
} from "@/components/dirty";
import { getArchivedDirtyTvPosts } from "@/data/dirtyTvArchivedPosts";
import {
  getPublicFeaturedVideo,
  getPublicVideoCategories,
  getPublicVideosByCategory
} from "@/lib/db/videos";

type DirtyTVPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Dirty TV",
  description:
    "Dirty TV from DirtyFM: YouTube video trash, public-access chaos, raw clips, and unapproved transmissions from Drift."
};

export default async function DirtyTVPage({ searchParams }: DirtyTVPageProps) {
  const params = await searchParams;
  const categories = await getPublicVideoCategories();
  const requestedCategory = params?.category;
  const selectedCategory = categories.includes(requestedCategory ?? "")
    ? requestedCategory
    : undefined;
  const videos = await getPublicVideosByCategory(selectedCategory);
  const featuredVideo = selectedCategory
    ? videos[0] ?? await getPublicFeaturedVideo()
    : await getPublicFeaturedVideo();
  const posts = getArchivedDirtyTvPosts();
  const archivedVideoCount = posts.reduce((count, post) => count + post.videos.length, 0);

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(45,79,115,0.35),transparent_13rem),repeating-linear-gradient(95deg,rgba(209,42,31,0.12)_0,rgba(209,42,31,0.12)_2px,transparent_2px,transparent_20px)] opacity-70"
          aria-hidden="true"
        />
        <div className="relative grid gap-5">
          <p className="eyebrow">Dirty TV / Video Trash</p>
          <h1 className="max-w-[9ch] font-display text-[clamp(3.4rem,14vw,8.5rem)] font-black uppercase leading-[0.86] text-dirty-ash">
            Watch the Damage.
          </h1>
          <p className="max-w-3xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
            Active clips in the player up top. Below that, the old archive —{" "}
            {posts.length} posts from the original site, {archivedVideoCount}{" "}
            embedded videos, dates and typos preserved as found.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Tune the Garbage" kicker="Categories" tone="yellow" />
          <p className="max-w-xl font-utility text-xs font-bold uppercase text-dirty-gray">
            Pick a clip bucket. The feed gets narrower, not respectable.
          </p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 min-[760px]:mx-0 min-[760px]:flex-wrap min-[760px]:overflow-visible min-[760px]:px-0 min-[760px]:pb-0">
          <DirtyButton
            href="/dirty-tv"
            variant={!selectedCategory ? "primary" : "ghost"}
          >
            All Clips
          </DirtyButton>
          {categories.map((category) => (
            <DirtyButton
              href={`/dirty-tv?category=${encodeURIComponent(category)}`}
              key={category}
              variant={selectedCategory === category ? "primary" : "ghost"}
            >
              {category}
            </DirtyButton>
          ))}
        </div>
      </section>

      <DirtyTVPlayer
        featuredVideo={featuredVideo}
        selectedCategory={selectedCategory}
        videos={videos}
      />

      <ArchivedDirtyTVArchive posts={posts} />

      <SendSignalCTA
        actionLabel="Send a Signal"
        body="Got a clip, guest idea, rant, complaint, or cursed little tape for Dirty TV? Send it in. Signal Control files the good trash into the active video stack."
        href="/contact"
        title="Got Video Trash for the Dirty Signal?"
      />
    </div>
  );
}
