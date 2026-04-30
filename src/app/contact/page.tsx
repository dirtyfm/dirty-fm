import type { Metadata } from "next";
import { ArchiveCard, SectionStamp, StaticPanel, TickerBar } from "@/components/dirty";
import { SendSignalForm } from "@/components/contact/SendSignalForm";

const signalTypes = [
  {
    title: "Show Tip",
    notes: "A lead, clip, headline, or piece of public weirdness worth putting near the mic.",
    tone: "yellow" as const
  },
  {
    title: "Open Mic Rant",
    notes: "Your loud little transmission. Angry, funny, cracked, readable.",
    tone: "red" as const
  },
  {
    title: "Guest Request",
    notes: "Nominate someone with a working mouth and enough static to survive Drift.",
    tone: "green" as const
  },
  {
    title: "Business / Booking",
    notes: "The legitimate drawer. Still DirtyFM, just with fewer sparks on the floor.",
    tone: "blue" as const
  }
];

export const metadata: Metadata = {
  title: "Send a Signal",
  description:
    "Send DirtyFM a show tip, rant, guest request, clip, problem report, or other listener signal."
};

export default function ContactPage() {
  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "CONTACT LINE: open for tips, rants, clips, complaints",
          "PUBLIC INPUT: never a publish button",
          "SAFETY NOTE: no threats, no raw HTML, no client-side email",
          "STATUS: send a signal, don't make it boring"
        ]}
        label="Send a Signal"
      />

      <section className="relative overflow-hidden border border-[rgba(183,178,168,0.24)] bg-dirty-black/55 p-5 shadow-signal min-[760px]:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(214,184,74,0.16),transparent_13rem),repeating-linear-gradient(105deg,rgba(209,42,31,0.1)_0,rgba(209,42,31,0.1)_2px,transparent_2px,transparent_18px)] opacity-70"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_20rem] min-[900px]:items-end">
          <div className="grid gap-5">
            <p className="eyebrow">Contact / DirtyFM Intake</p>
            <h1 className="max-w-[10ch] font-display text-[clamp(3.3rem,13vw,8rem)] font-black uppercase leading-[0.9] text-dirty-ash">
              Send a Signal. Don&apos;t Make It Boring.
            </h1>
            <p className="max-w-3xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
              Got a rant, clip, story, complaint, guest pitch, technical
              problem, or beautiful piece of random bullshit? Throw it into the
              intake slot. Keep it legal enough to survive daylight.
            </p>
          </div>

          <aside className="border-l-8 border-dirty-yellow bg-dirty-purple/75 p-5">
            <SectionStamp label="No Publish Button" kicker="Public Input" tone="yellow" />
            <p className="mt-5 font-utility text-sm font-bold uppercase leading-relaxed text-dirty-ash">
              This is a front-door signal, not Signal Control. Public users do
              not publish posts, moderate comments, or touch admin machinery.
            </p>
          </aside>
        </div>
      </section>

      <section className="grid gap-5">
        <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
          <SectionStamp label="Pick a Wire" kicker="Submission Types" tone="green" />
          <p className="max-w-xl font-utility text-xs font-bold uppercase text-dirty-gray">
            The form has all eight buckets. These are the loudest doors into
            the building.
          </p>
        </div>
        <div className="grid gap-4 min-[760px]:grid-cols-2 min-[1040px]:grid-cols-4">
          {signalTypes.map((type) => (
            <ArchiveCard
              key={type.title}
              label="Signal Type"
              notes={type.notes}
              title={type.title}
              tone={type.tone}
            />
          ))}
        </div>
      </section>

      <StaticPanel
        label="Boundary Copy"
        title="Bring the Noise. Leave the Liability Outside."
        tone="yellow"
      >
        <div className="grid gap-4 text-lg leading-snug text-dirty-ash min-[860px]:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
          <div className="grid gap-4">
            <p>
              DirtyFM wants tips, rants, clips, weird stories, guest pitches,
              complaints, and hostile little love letters. It does not need
              threats, doxxing, instructions for illegal acts, spam sludge, or
              anything pretending this form is a public publishing system.
            </p>
            <p>
              Submitted text is treated like plain public input. No raw HTML is
              rendered. No secrets belong here. If this gets backend wiring
              later, server-side validation and moderation tools come with it.
            </p>
          </div>
          <div className="border border-dirty-red bg-dirty-red/15 p-4 font-utility text-sm font-bold uppercase text-dirty-yellow">
            Can we read it on air? Say yes or no. Dirty does not mean unclear.
          </div>
        </div>
      </StaticPanel>

      <SendSignalForm />
    </div>
  );
}
