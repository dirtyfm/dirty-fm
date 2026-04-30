"use client";

import { DirtyButton, StaticPanel, TickerBar } from "@/components/dirty";

export default function SignalControlError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid gap-8">
      <TickerBar
        items={[
          "SIGNAL CONTROL: console fault",
          "SECURITY: no public dashboard fallback",
          "RECOVERY: verify the session again"
        ]}
        label="Error"
      />
      <StaticPanel label="Console Fault" title="Signal Control Hit Static." tone="red">
        <div className="grid gap-4">
          <p className="max-w-2xl text-lg leading-snug">
            Signal Control hit an error. Retry or go back to the public side.
          </p>
          <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:flex-wrap">
            <button className="button button-primary" onClick={reset} type="button">
              Retry Console
            </button>
            <DirtyButton href="/" variant="secondary">
              Public Signal
            </DirtyButton>
          </div>
        </div>
      </StaticPanel>
    </div>
  );
}
