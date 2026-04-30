import {
  ArchiveCard,
  DirtyButton,
  DirtyNewsCard,
  DriftDossier,
  LatestTransmission,
  SectionStamp,
  SendSignalCTA,
  StaticPanel,
  TickerBar,
  VideoTrashCard
} from "@/components/dirty";
import {
  archivedDirtyTvYouTubeChannelUrl,
  getArchivedDirtyTvHomePreviewCards
} from "@/data/dirtyTvArchivedPosts";
import { formatPostDate } from "@/data/posts";
import {
  formatVideoDate,
  getYoutubeThumbnailUrl
} from "@/data/videos";
import { getPublicDirtyNewsPosts } from "@/lib/db/posts";
import { getPublicFeaturedVideo, getPublicVideos } from "@/lib/db/videos";
import { getKvHomeSettings } from "@/lib/kv/contentStore";

const dirtyFeed = [
  "DRIFT: still on air, still not asking",
  "FILE STATUS: random bullshit with a signal",
  "NOTE: free speech, dark comedy, and a war on drugs argument from 2016",
  "SIGNAL: the archive is intact and the mic still works"
];

const driftFiles = [
  {
    label: "Role",
    value: "Has been doing this since before it was a website. Will keep doing it regardless."
  },
  {
    label: "Known For",
    value: "Letting it run too long. Usually worth it."
  },
  {
    label: "Hazard",
    value: "Will ask you to explain yourself."
  }
];

export const dynamic = "force-dynamic";

function getPostDateLabel(post: Awaited<ReturnType<typeof getPublicDirtyNewsPosts>>[number]) {
  return post.archive?.publishedAtOriginal ?? formatPostDate(post.publishedAt);
}

export default async function Home() {
  const homeSettings = await getKvHomeSettings();
  const featuredVideo = await getPublicFeaturedVideo();
  const currentVideos = (await getPublicVideos()).slice(0, 3);
  const dirtyTvPreviewCards = getArchivedDirtyTvHomePreviewCards();
  const newsPosts = (await getPublicDirtyNewsPosts()).slice(0, 3).map((post) => ({
    title: post.title,
    excerpt: post.excerpt,
    href: `/dirty-news/${post.slug}`,
    category: post.category,
    dateLabel: getPostDateLabel(post)
  }));

  return (
    <div className="grid gap-10 min-[760px]:gap-14">
      <TickerBar items={dirtyFeed} label="Dirty Feed" />

      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(209,42,31,0.2),transparent_12rem),repeating-linear-gradient(100deg,rgba(214,184,74,0.08)_0,rgba(214,184,74,0.08)_2px,transparent_2px,transparent_18px)] opacity-70"
          aria-hidden="true"
        />
        <div className="relative grid items-end gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-6">
            <p className="eyebrow">{homeSettings.hero_eyebrow}</p>
            <h1 className="max-w-[10ch] font-display text-[clamp(3.3rem,13vw,8.8rem)] font-black uppercase leading-[0.9] text-dirty-ash">
              {homeSettings.hero_title}
            </h1>
            <p className="max-w-3xl text-[clamp(1.1rem,2.5vw,1.5rem)] leading-snug text-dirty-ash">
              {homeSettings.hero_body}
            </p>
            <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:flex-wrap">
              <DirtyButton href="/dirty-tv">Watch Latest Video</DirtyButton>
              <DirtyButton href="/dirty-news" variant="secondary">
                Read Dirty News
              </DirtyButton>
              <DirtyButton href="#drift-files" variant="ghost">
                Open the Dossier
              </DirtyButton>
            </div>
          </div>

          <aside className="grid gap-4 border-l-8 border-dirty-red bg-dirty-purple/80 p-5 shadow-[0.45rem_0.45rem_0_rgba(0,0,0,0.36)]">
            <SectionStamp label="On Air" kicker="No Permission" tone="red" />
            <p className="font-display text-[clamp(2rem,7vw,3.6rem)] font-black uppercase leading-none text-dirty-ash">
              {homeSettings.hero_aside}
            </p>
            <p className="file-tape">Frequency: busted mic / basement wire / no PR handler</p>
            <dl className="grid gap-2 font-utility text-xs font-black uppercase">
              <div className="flex justify-between gap-3 border-t border-[rgba(183,178,168,0.24)] pt-2">
                <dt className="text-dirty-yellow">Host</dt>
                <dd className="text-right text-dirty-ash">Drift</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-[rgba(183,178,168,0.24)] pt-2">
                <dt className="text-dirty-yellow">Format</dt>
                <dd className="text-right text-dirty-ash">Rants / Clips / Chaos</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-[rgba(183,178,168,0.24)] pt-2">
                <dt className="text-dirty-yellow">Signal</dt>
                <dd className="text-right text-dirty-ash">Still getting through</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {featuredVideo ? (
        <LatestTransmission
          title={featuredVideo.title}
          description={featuredVideo.description}
          href="/dirty-tv"
          primaryActionLabel="Watch the Damage"
          secondaryHref={`/dirty-tv?category=${encodeURIComponent(featuredVideo.category)}`}
          secondaryActionLabel="Tune This Bucket"
          meta={[
            `File Type: ${featuredVideo.category}`,
            `Status: ${featuredVideo.status}`,
            `Host: ${featuredVideo.host}`,
            `Filed: ${formatVideoDate(featuredVideo.publishedAt)}`
          ]}
        />
      ) : (
        <LatestTransmission
          title="Latest Transmission: Static Ate the Tape"
          description="The Dirty TV drawer is empty right now. No clip, no embed, no polite explanation. The signal will cough something up when it is good and ready."
          href="/dirty-tv"
          primaryActionLabel="Check Dirty TV"
          secondaryHref="/contact"
          secondaryActionLabel="Send a Clip"
          meta={[
            "File Type: Video",
            "Status: Missing Tape",
            "Host: Drift",
            "Filed: Unknown"
          ]}
        />
      )}

      <StaticPanel
        label="What the Hell Is DirtyFM?"
        title="Random Fucking Bullshit. Live From the Collapse."
        tone="yellow"
      >
        <div className="grid gap-5 text-lg leading-snug text-dirty-ash min-[860px]:grid-cols-[minmax(0,0.95fr)_minmax(16rem,0.55fr)]">
          <div className="grid gap-4">
            <p>
              DirtyFM is Drift&apos;s show. He&apos;s been doing it since before it was
              a website. Prank calls, rants, morning show wreckage, a
              constitutional argument about the war on drugs, and a clip of
              three drunk guys in what appears to be a garage. That&apos;s the
              archive. That&apos;s the show.
            </p>
            <p>
              Sometimes political. Sometimes stupid. Sometimes funny for the
              exact wrong reasons. Nobody pre-chewed it for you.
            </p>
          </div>
          <div className="file-tape">
            No polish. No permission. No corporate-safe opinions. Just Drift,
            the open mic, and whatever the archive coughs up next.
          </div>
        </div>
      </StaticPanel>

      <section id="drift-files" className="scroll-mt-8">
        <DriftDossier
          items={driftFiles}
          summary="Drift runs the show. Has for years. Anti-government, pro-open mic, allergic to the kind of person who thinks speech needs to be approved before it leaves your mouth."
        />
      </section>

      <section className="grid gap-5">
        <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Dirty News" kicker="Preview" tone="yellow" />
          <DirtyButton href="/dirty-news" variant="secondary">
            Enter Dirty News
          </DirtyButton>
        </div>
        {newsPosts.length > 0 ? (
          <div className="grid gap-4 min-[860px]:grid-cols-3">
            {newsPosts.map((post, index) => (
              <DirtyNewsCard
                key={post.href}
                {...post}
                tone={index === 0 ? "red" : index === 1 ? "yellow" : "green"}
              />
            ))}
          </div>
        ) : (
          <StaticPanel label="Empty Archive Drawer" title="No Published Static Yet." tone="yellow">
            <p className="max-w-2xl text-lg leading-snug">
              Dirty News is quiet right now. The archive drawer is empty,
              dusty, and still accepting signals.
            </p>
          </StaticPanel>
        )}
      </section>

      <section className="grid gap-5">
        <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Video Trash" kicker="Dirty TV" tone="blue" />
          <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:flex-wrap">
            <DirtyButton href="/dirty-tv" variant="secondary">
              Open Dirty TV
            </DirtyButton>
            <DirtyButton
              href={archivedDirtyTvYouTubeChannelUrl}
              rel="noreferrer"
              target="_blank"
              variant="ghost"
            >
              YouTube Channel
            </DirtyButton>
          </div>
        </div>
        {currentVideos.length > 0 ? (
          <div className="grid gap-4 min-[760px]:grid-cols-2 min-[1120px]:grid-cols-3">
            {currentVideos.map((video) => (
              <VideoTrashCard
                category={video.category}
                href={`/dirty-tv?category=${encodeURIComponent(video.category)}`}
                key={video.id}
                runtime={`${video.host} / ${formatVideoDate(video.publishedAt)}`}
                status={video.status}
                thumbnailUrl={getYoutubeThumbnailUrl(video.youtubeId)}
                title={video.title}
              />
            ))}
          </div>
        ) : (
          <StaticPanel label="Empty Tape Shelf" title="No Current Video Static Yet." tone="yellow">
            <p className="max-w-2xl text-lg leading-snug">
              The current Dirty TV player has no clips filed. The old archive
              is still below, coughing dust and bad decisions.
            </p>
          </StaticPanel>
        )}

        <div className="grid gap-3">
          <p className="font-utility text-xs font-black uppercase tracking-[0.08em] text-dirty-yellow">
            From the old tape shelf
          </p>
          <div className="grid gap-4 min-[760px]:grid-cols-2 min-[1120px]:grid-cols-3">
            {dirtyTvPreviewCards.slice(0, 3).map((video) => (
              <VideoTrashCard key={video.title} {...video} />
            ))}
          </div>
        </div>
      </section>

      <ArchiveCard
        actionLabel="Send Something Ugly"
        href="/contact"
        label="Open Mic Degeneracy"
        meta={[
          { label: "Accepting", value: "Rants, clips, tips, complaints, weird opinions" },
          { label: "Not interested in", value: "Pre-approved PR copy" }
        ]}
        notes="Got a rant, a clip, a complaint, a tip? Send it in. Don't paste raw HTML and don't try to publish yourself - just write the thing and throw it at the intake."
        title="The Mic Is Open."
        tone="green"
      />

      <SendSignalCTA
        body="Got something? Send it before you talk yourself out of it."
        href="/contact"
        title="Send a Signal Before the Static Eats It."
      />
    </div>
  );
}
