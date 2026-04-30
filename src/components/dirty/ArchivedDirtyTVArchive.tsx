import type { ArchivedDirtyTvPost } from "@/data/dirtyTvArchivedPosts";
import { getArchivedVideoEmbedUrl } from "@/data/dirtyTvArchivedPosts";
import { SectionStamp } from "./SectionStamp";

export type ArchivedDirtyTVArchiveProps = {
  posts: ArchivedDirtyTvPost[];
};

function getProviderLabel(provider: ArchivedDirtyTvPost["videos"][number]["provider"]) {
  return provider === "youtube" ? "YouTube Embed" : "Vimeo Embed";
}

export function ArchivedDirtyTVArchive({ posts }: ArchivedDirtyTVArchiveProps) {
  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
        <SectionStamp label="Archived DirtyTV" kicker="Transmission Log" tone="blue" />
        <p className="max-w-xl font-utility text-xs font-black uppercase leading-relaxed text-dirty-gray">
          Pulled from the old tape shelf. Dates, titles, authors, and ugly little
          spellings stay exactly where the archive left them.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((post, postIndex) => (
          <article
            className="overflow-hidden border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-red bg-dirty-purple/70 shadow-signal"
            key={post.slug}
          >
            <div className="grid gap-5 p-5 min-[760px]:p-6">
              <div className="grid gap-4 min-[900px]:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="grid gap-3">
                  <p className="font-utility text-xs font-black uppercase tracking-[0.08em] text-dirty-blue">
                    Archive File #{String(postIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-display text-[clamp(2.2rem,8vw,5rem)] font-black uppercase leading-none text-dirty-ash">
                    {post.title}
                  </h2>
                  {post.descriptionOriginal ? (
                    <p className="max-w-3xl whitespace-pre-line text-lg leading-snug text-dirty-gray">
                      {post.descriptionOriginal}
                    </p>
                  ) : null}
                </div>

                <dl className="grid content-start gap-2 border border-dirty-yellow bg-dirty-black/35 p-4 font-utility text-xs font-black uppercase text-dirty-yellow">
                  <div>
                    <dt className="text-dirty-gray">Posted</dt>
                    <dd>{post.postedAtOriginal}</dd>
                  </div>
                  <div>
                    <dt className="text-dirty-gray">Author</dt>
                    <dd>{post.author}</dd>
                  </div>
                  <div>
                    <dt className="text-dirty-gray">Archived Comments</dt>
                    <dd>{post.commentCountOriginal}</dd>
                  </div>
                  <div>
                    <dt className="text-dirty-gray">Source</dt>
                    <dd>
                      <a
                        className="text-dirty-blue underline decoration-dirty-red decoration-2 underline-offset-4 hover:text-dirty-yellow"
                        href={post.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open Original File
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4">
                {post.videos.map((video, videoIndex) => (
                  <div className="grid gap-2" key={`${post.slug}-${video.videoId}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 font-utility text-xs font-black uppercase text-dirty-gray">
                      <span className="text-dirty-yellow">
                        {getProviderLabel(video.provider)}
                      </span>
                      <span>
                        Clip {videoIndex + 1} / {video.videoId}
                      </span>
                    </div>
                    <div className="relative aspect-video w-full overflow-hidden border border-[rgba(183,178,168,0.24)] bg-dirty-black">
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
                        src={getArchivedVideoEmbedUrl(video)}
                        title={`${post.title} - ${getProviderLabel(video.provider)} ${videoIndex + 1}`}
                      />
                    </div>
                    <a
                      className="w-fit font-utility text-xs font-black uppercase text-dirty-blue underline decoration-dirty-red decoration-2 underline-offset-4 hover:text-dirty-yellow"
                      href={video.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open Video Source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
