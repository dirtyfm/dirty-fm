"use client";

import { DirtyButton, StaticPanel, TickerBar } from "@/components/dirty";

export default function DirtyTVError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid gap-8">
      <TickerBar
        items={[
          "DIRTY TV: tape got chewed",
          "RECOVERY: kick the player",
          "ARCHIVE: still intact somewhere in the static"
        ]}
        label="Error"
      />
      <StaticPanel label="Tape Jam" title="Dirty TV Lost the Picture." tone="blue">
        <div className="grid gap-4">
          <p className="max-w-2xl text-lg leading-snug">
            The video archive failed to load. Try again, or jump back to Dirty
            News while the tape cools off.
          </p>
          <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:flex-wrap">
            <button className="button button-primary" onClick={reset} type="button">
              Retry Dirty TV
            </button>
            <DirtyButton href="/dirty-news" variant="secondary">
              Read Dirty News
            </DirtyButton>
          </div>
        </div>
      </StaticPanel>
    </div>
  );
}
