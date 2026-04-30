import type { Metadata } from "next";
import { ArchivedDirtyTVArchive, SendSignalCTA } from "@/components/dirty";
import { getArchivedDirtyTvPosts } from "@/data/dirtyTvArchivedPosts";

export const metadata: Metadata = {
  title: "Dirty TV",
  description:
    "Dirty TV from DirtyFM: YouTube video trash, public-access chaos, raw clips, and unapproved transmissions from Drift."
};

export default function DirtyTVPage() {
  const posts = getArchivedDirtyTvPosts();
  const videoCount = posts.reduce((count, post) => count + post.videos.length, 0);

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
            Old DirtyTV files from the dirty signal: {posts.length} posts,
            {" "}
            {videoCount} embedded clips, no rewritten dates, no cleaned-up titles,
            no fake comment bodies.
          </p>
        </div>
      </section>

      <ArchivedDirtyTVArchive posts={posts} />

      <SendSignalCTA
        actionLabel="Send a Signal"
        body="Got a clip, guest idea, rant, complaint, or cursed little tape for Dirty TV? Send it in. Manual archive only for now. No YouTube API machinery yet."
        href="/contact"
        title="Got Video Trash for the Dirty Signal?"
      />
    </div>
  );
}
