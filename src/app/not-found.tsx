import { DirtyButton, SectionStamp, StaticPanel, TickerBar } from "@/components/dirty";

export default function NotFound() {
  return (
    <div className="grid gap-8">
      <TickerBar
        items={[
          "404: file drawer came up empty",
          "SIGNAL: missing, buried, or never aired",
          "RECOVERY: get back to the public wire"
        ]}
        label="Dead Air"
      />
      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div className="relative grid gap-5">
          <SectionStamp label="File Missing" kicker="404" tone="red" />
          <h1 className="max-w-[9ch] font-display text-[clamp(3.4rem,14vw,8rem)] font-black uppercase leading-[0.86] text-dirty-ash">
            The Signal Fell Through the Floor.
          </h1>
          <p className="max-w-3xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
            This file is not in the DirtyFM archive. Maybe it got moved, maybe
            it never existed, maybe the tape shelf finally bit back.
          </p>
          <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:flex-wrap">
            <DirtyButton href="/">Back to Signal</DirtyButton>
            <DirtyButton href="/dirty-news" variant="secondary">
              Open Dirty News
            </DirtyButton>
            <DirtyButton href="/dirty-tv" variant="ghost">
              Watch the Damage
            </DirtyButton>
          </div>
        </div>
      </section>
      <StaticPanel label="Archive Note" title="No Generic Dead End." tone="yellow">
        <p className="max-w-2xl text-lg leading-snug">
          DirtyFM keeps the ugly stuff readable. Even the missing pages get a
          warning label.
        </p>
      </StaticPanel>
    </div>
  );
}
