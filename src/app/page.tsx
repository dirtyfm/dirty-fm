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

const newsPosts = [
  {
    title: "Today's Bullshit, Dragged Into the Light",
    excerpt:
      "Notes from the dirty signal: bad rules, worse explanations, and Drift asking why everyone sounds like a nervous memo.",
    href: "/dirty-news/machine-found-another-clipboard",
    category: "Government Bullshit",
    dateLabel: "Latest Drop"
  },
  {
    title: "The Culture Police Need a Worse Job",
    excerpt:
      "A dirty little dispatch about fake politeness, managed speech, and why every sentence does not need a safety helmet.",
    href: "/dirty-news/public-access-hell-has-better-standards",
    category: "Fuck the Machine",
    dateLabel: "Signal Log"
  },
  {
    title: "Open Mic Degeneracy Report",
    excerpt:
      "Listener noise, bad ideas, cracked jokes, complaints, and whatever else crawled out of the broadcast slot.",
    href: "/dirty-news/open-mic-degeneracy-report-static-edition",
    category: "Open Mic",
    dateLabel: "Archive Note"
  }
];

const videos = [
  {
    title: "Dirty Signal Test: Do Not Sanitize",
    href: "/dirty-tv",
    category: "Video Trash",
    runtime: "12:08",
    status: "Unapproved Clip"
  },
  {
    title: "Public Access Hell With Drift",
    href: "/dirty-tv",
    category: "Dirty TV",
    runtime: "08:44",
    status: "Banned Vibe"
  },
  {
    title: "Bad Calls. Worse Judgment.",
    href: "/dirty-tv",
    category: "Prank Archive",
    runtime: "16:20",
    status: "Raw Clip"
  }
];

export default function Home() {
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
              and random fucking bullshit from Erik Woods, Drift, and whoever
              gets close enough to the mic.
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
                <dd className="text-right text-dirty-ash">Drift / Erik Woods</dd>
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
        <div className="grid gap-4 min-[860px]:grid-cols-3">
          {newsPosts.map((post, index) => (
            <DirtyNewsCard
              key={post.title}
              {...post}
              tone={index === 0 ? "red" : index === 1 ? "yellow" : "green"}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5">
        <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Video Trash" kicker="Dirty TV" tone="blue" />
          <DirtyButton href="/dirty-tv" variant="secondary">
            Open Dirty TV
          </DirtyButton>
        </div>
        <div className="grid gap-4 min-[760px]:grid-cols-3">
          {videos.map((video) => (
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
