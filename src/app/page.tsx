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
import { getPublicDirtyNewsPosts } from "@/lib/db/posts";

const dirtyFeed = [
  "LIVE WIRE: Drift is still not applying for approval",
  "FILE STATUS: random bullshit with a signal",
  "WARNING: corporate-safe opinions not detected",
  "ARCHIVE NOTE: prank calls, rants, dirty news, video trash"
];

const driftFiles = [
  {
    label: "Broadcast Role",
    value: "Outlaw host, static conductor, and the wrong guy near the mic."
  },
  {
    label: "Operational Habit",
    value: "Insults the machinery, lets the loudmouths talk, keeps moving."
  },
  {
    label: "Control Problem",
    value: "Government overreach, speech managers, and fake politeness."
  }
];

function getPostDateLabel(post: Awaited<ReturnType<typeof getPublicDirtyNewsPosts>>[number]) {
  return post.archive?.publishedAtOriginal ?? formatPostDate(post.publishedAt);
}

export default async function Home() {
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
            <p className="eyebrow">Hero / Dirty Signal</p>
            <h1 className="max-w-[10ch] font-display text-[clamp(3.3rem,13vw,8.8rem)] font-black uppercase leading-[0.9] text-dirty-ash">
              DirtyFM Is the Signal They Forgot to Kill.
            </h1>
            <p className="max-w-3xl text-[clamp(1.1rem,2.5vw,1.5rem)] leading-snug text-dirty-ash">
              Raw radio, prank-call chaos, dark comedy, anti-control noise,
              and random fucking bullshit from Drift and whoever gets close
              enough to the mic.
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
              Pirate radio for the unmanageable.
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

      <LatestTransmission
        title="Latest Transmission: The Mic Is Still Hot"
        description="The newest hit from the dirty signal: rough talk, damaged logic, useful static, and a mic that should probably be supervised by nobody."
        href="/dirty-tv"
        secondaryHref="/dirty-news"
        secondaryActionLabel="Read the Fallout"
        meta={[
          "File Type: Video",
          "Status: Unapproved",
          "Host: Drift",
          "Route: Dirty TV"
        ]}
      />

      <StaticPanel
        label="What the Hell Is DirtyFM?"
        title="Random Fucking Bullshit. Live From the Collapse."
        tone="yellow"
      >
        <div className="grid gap-5 text-lg leading-snug text-dirty-ash min-[860px]:grid-cols-[minmax(0,0.95fr)_minmax(16rem,0.55fr)]">
          <div className="grid gap-4">
            <p>
              DirtyFM is unfiltered comedy radio, video trash, prank-call
              wreckage, Dirty News, and anti-control commentary shoved through a
              busted late-night signal.
            </p>
            <p>
              Sometimes it is political. Sometimes it is stupid. Sometimes it is
              funny for the wrong reasons. The point is that nobody pre-chewed
              it into a polite little content pellet.
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
          summary="Drift is the dirty signal's main problem: loud, funny, hostile to control, curious about other dissenters, and not here to become respectable for your comfort."
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
        <div className="grid gap-4 min-[760px]:grid-cols-2 min-[1120px]:grid-cols-3">
          {dirtyTvPreviewCards.map((video) => (
            <VideoTrashCard key={video.title} {...video} />
          ))}
        </div>
      </section>

      <ArchiveCard
        actionLabel="Send Something Ugly"
        href="/contact"
        label="Open Mic Degeneracy"
        meta={[
          { label: "Accepting", value: "Rants, clips, stories, complaints" },
          { label: "Rejected", value: "Boring sanitized PR sludge" }
        ]}
        notes="Got a signal worth throwing into the archive? Send it in. Do not publish yourself. Do not paste raw HTML. Just bring the noise."
        title="The Door Is Kicked Open."
        tone="green"
      />

      <SendSignalCTA
        body="Got a rant, clip, story, complaint, conspiracy, insult, or bad idea? Send it in. Keep it readable. Do not make it boring."
        href="/contact"
        title="Send a Signal Before the Static Eats It."
      />
    </div>
  );
}
