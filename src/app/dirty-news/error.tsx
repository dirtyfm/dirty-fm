"use client";

import { DirtyButton, SectionStamp, StaticPanel, TickerBar } from "@/components/dirty";

export default function DirtyNewsError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid gap-8">
      <TickerBar
        items={[
          "DIRTY NEWS: wire jammed",
          "RECOVERY: retry the drawer",
          "PUBLIC POSTS: still protected from raw HTML"
        ]}
        label="Error"
      />
      <StaticPanel label="Feed Jam" title="Dirty News Hit Bad Static." tone="red">
        <div className="grid gap-4">
          <p className="max-w-2xl text-lg leading-snug">
            Dirty News couldn&apos;t load. Hit retry or go back to the main feed.
          </p>
          <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:flex-wrap">
            <button className="button button-primary" onClick={reset} type="button">
              Retry Feed
            </button>
            <DirtyButton href="/" variant="secondary">
              Back to Signal
            </DirtyButton>
          </div>
        </div>
      </StaticPanel>
      <SectionStamp label="No Panic" kicker="Operator Note" tone="yellow" />
    </div>
  );
}
