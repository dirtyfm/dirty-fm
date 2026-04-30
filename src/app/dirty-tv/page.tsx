import type { Metadata } from "next";
import { DirtyButton, SectionStamp, SendSignalCTA, StaticPanel, VideoTrashCard } from "@/components/dirty";
import {
  formatVideoDate,
  getFeaturedVideo,
  getVideoCategories,
  getVideosByCategory,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl
} from "@/data/videos";

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
  const activeCategory = params?.category;
  const categories = getVideoCategories();
  const selectedCategory = categories.includes(activeCategory ?? "")
    ? activeCategory
    : undefined;
  const featuredVideo = getFeaturedVideo();
  const videos = getVideosByCategory(selectedCategory);

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <section className="relative overflow-hidden border border-[rgba(183,178,168,0.24)] bg-dirty-black/50 p-5 shadow-signal min-[760px]:p-8">
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
            YouTube files from the dirty signal: rants, prank wreckage, public
            access hell, government noise, and whatever Drift dragged in before
            the tape got warm.
          </p>
        </div>
      </section>

      {featuredVideo ? (
        <section className="grid gap-5">
          <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
            <SectionStamp
              label="Featured Transmission"
              kicker="Now Playing"
              tone="red"
            />
            <dl className="grid gap-2 font-utility text-xs font-black uppercase text-dirty-gray min-[560px]:grid-cols-3 min-[760px]:text-right">
              <div>
                <dt className="text-dirty-yellow">Host</dt>
                <dd>{featuredVideo.host}</dd>
              </div>
              <div>
                <dt className="text-dirty-yellow">Status</dt>
                <dd>{featuredVideo.status}</dd>
              </div>
              <div>
                <dt className="text-dirty-yellow">Filed</dt>
                <dd>{formatVideoDate(featuredVideo.publishedAt)}</dd>
              </div>
            </dl>
          </div>

          <article className="overflow-hidden border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-red bg-dirty-purple/70 shadow-signal">
            <div className="relative aspect-video w-full bg-dirty-black">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                src={getYoutubeEmbedUrl(featuredVideo.youtubeId)}
                title={featuredVideo.title}
              />
            </div>
            <div className="grid gap-4 p-5 min-[760px]:grid-cols-[minmax(0,1fr)_18rem] min-[760px]:p-6">
              <div className="grid gap-3">
                <p className="font-utility text-xs font-black uppercase tracking-[0.08em] text-dirty-blue">
                  {featuredVideo.category}
                </p>
                <h2 className="font-display text-[clamp(2.2rem,8vw,5rem)] font-black uppercase leading-none text-dirty-ash">
                  {featuredVideo.title}
                </h2>
                <p className="max-w-3xl text-lg leading-snug text-dirty-gray">
                  {featuredVideo.description}
                </p>
              </div>
              <div className="grid content-start gap-2 border border-dirty-yellow bg-dirty-black/35 p-4 font-utility text-xs font-black uppercase text-dirty-yellow">
                <span>File Type: YouTube Embed</span>
                <span>Signal: Responsive</span>
                <span>Archive ID: {featuredVideo.id}</span>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section className="grid gap-4">
        <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Filter the Static" kicker="Categories" tone="yellow" />
          <p className="max-w-xl font-utility text-xs font-bold uppercase text-dirty-gray">
            Pick a channel. The archive gets narrower, not respectable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DirtyButton
            href="/dirty-tv"
            variant={!selectedCategory ? "primary" : "ghost"}
          >
            All Video Trash
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

      <section className="grid gap-5">
        <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp
            label={selectedCategory ?? "Video Archive"}
            kicker="Transmission Log"
            tone="blue"
          />
          <DirtyButton href="/contact" variant="secondary">
            Send a Clip
          </DirtyButton>
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-4 min-[760px]:grid-cols-2 min-[1040px]:grid-cols-3">
            {videos.map((video) => (
              <VideoTrashCard
                category={video.category}
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                key={video.id}
                runtime={`${video.host} / ${formatVideoDate(video.publishedAt)}`}
                status={video.status}
                thumbnailUrl={getYoutubeThumbnailUrl(video.youtubeId)}
                title={video.title}
              />
            ))}
          </div>
        ) : (
          <StaticPanel label="Empty Tape" title="No Video Static Yet." tone="yellow">
            <p className="max-w-2xl text-lg leading-snug">
              Nothing is filed under this channel yet. The tape shelf is either
              empty or somebody hid the ugly stuff too well.
            </p>
          </StaticPanel>
        )}
      </section>

      <SendSignalCTA
        actionLabel="Send a Signal"
        body="Got a clip, guest idea, rant, complaint, or cursed little tape for Dirty TV? Send it in. Manual archive only for now. No YouTube API machinery yet."
        href="/contact"
        title="Got Video Trash for the Dirty Signal?"
      />
    </div>
  );
}
