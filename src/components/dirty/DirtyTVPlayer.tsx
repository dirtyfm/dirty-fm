"use client";

import { useRef, useState } from "react";
import type { DirtyVideo } from "@/data/videos";
import {
  formatVideoDate,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl
} from "@/data/videos";
import { DirtyButton } from "./DirtyButton";
import { SectionStamp } from "./SectionStamp";
import { StaticPanel } from "./StaticPanel";
import { VideoTrashCard } from "./VideoTrashCard";

export type DirtyTVPlayerProps = {
  featuredVideo: DirtyVideo | null;
  selectedCategory?: string;
  videos: DirtyVideo[];
};

export function DirtyTVPlayer({
  featuredVideo,
  selectedCategory,
  videos
}: DirtyTVPlayerProps) {
  const playerRef = useRef<HTMLElement>(null);
  const firstVideo = featuredVideo ?? videos[0] ?? null;
  const [selectedVideoId, setSelectedVideoId] = useState(firstVideo?.id);
  const selectedVideo =
    videos.find((video) => video.id === selectedVideoId) ?? firstVideo;

  function playVideo(video: DirtyVideo) {
    setSelectedVideoId(video.id);
    window.requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      playerRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      {selectedVideo ? (
        <section
          className="grid scroll-mt-24 gap-5 outline-none"
          ref={playerRef}
          tabIndex={-1}
        >
          <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
            <SectionStamp
              label="Featured Transmission"
              kicker="Now Playing"
              tone="red"
            />
            <dl className="grid gap-2 font-utility text-xs font-black uppercase text-dirty-gray min-[560px]:grid-cols-3 min-[760px]:text-right">
              <div>
                <dt className="text-dirty-yellow">Host</dt>
                <dd>{selectedVideo.host}</dd>
              </div>
              <div>
                <dt className="text-dirty-yellow">Status</dt>
                <dd>{selectedVideo.status}</dd>
              </div>
              <div>
                <dt className="text-dirty-yellow">Filed</dt>
                <dd>{formatVideoDate(selectedVideo.publishedAt)}</dd>
              </div>
            </dl>
          </div>

          <article className="overflow-hidden border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-red bg-dirty-purple/70 shadow-signal">
            <div className="relative aspect-video w-full bg-dirty-black">
              <div
                className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(183,178,168,0.08)_0,rgba(183,178,168,0.08)_1px,transparent_1px,transparent_6px)] opacity-25"
                aria-hidden="true"
              />
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                src={getYoutubeEmbedUrl(selectedVideo.youtubeId)}
                title={selectedVideo.title}
              />
            </div>
            <div className="grid gap-4 p-5 min-[760px]:grid-cols-[minmax(0,1fr)_18rem] min-[760px]:p-6">
              <div className="grid gap-3">
                <p className="font-utility text-xs font-black uppercase tracking-[0.08em] text-dirty-blue">
                  {selectedVideo.category}
                </p>
                <h2 className="font-display text-[clamp(2.2rem,8vw,5rem)] font-black uppercase leading-none text-dirty-ash">
                  {selectedVideo.title}
                </h2>
                <p className="max-w-3xl text-lg leading-snug text-dirty-gray">
                  {selectedVideo.description}
                </p>
              </div>
              <div className="grid content-start gap-2 border border-dirty-yellow bg-dirty-black/35 p-4 font-utility text-xs font-black uppercase text-dirty-yellow">
                <span>File Type: YouTube Embed</span>
                <span>Signal: In-Page Playback</span>
                <span>Channel: Dirty TV</span>
                <span>Archive ID: {selectedVideo.id}</span>
                <a
                  className="text-dirty-blue underline decoration-dirty-red decoration-2 underline-offset-4 hover:text-dirty-yellow"
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Emergency YouTube Exit
                </a>
              </div>
            </div>
          </article>
        </section>
      ) : null}

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
                actionLabel={`Play ${video.title} on Dirty TV`}
                category={video.category}
                isActive={selectedVideo?.id === video.id}
                key={video.id}
                onPlay={() => playVideo(video)}
                runtime={`${video.host} / ${formatVideoDate(video.publishedAt)}`}
                status={video.status}
                thumbnailUrl={getYoutubeThumbnailUrl(video.youtubeId)}
                title={video.title}
              />
            ))}
          </div>
        ) : (
          <StaticPanel label="Empty Tape Shelf" title="No Video Static Yet." tone="yellow">
            <p className="max-w-2xl text-lg leading-snug">
              Nothing is filed under this channel yet. The tape shelf is either
              empty or somebody hid the ugly stuff too well.
            </p>
            <p className="file-tape mt-4 max-w-xl">
              Shelf status: no clip, no embed, no respectable explanation.
            </p>
          </StaticPanel>
        )}
      </section>
    </>
  );
}
