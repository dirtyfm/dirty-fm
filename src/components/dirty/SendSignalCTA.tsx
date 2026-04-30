import { DirtyButton } from "./DirtyButton";
import { SectionStamp } from "./SectionStamp";

export type SendSignalCTAProps = {
  title?: string;
  body?: string;
  href?: string;
  actionLabel?: string;
};

export function SendSignalCTA({
  title = "Got a rant, clip, story, complaint, conspiracy, insult, or bad idea?",
  body = "Send it in. Keep it readable. Do not make it boring.",
  href = "/contact",
  actionLabel = "Send a Signal"
}: SendSignalCTAProps) {
  return (
    <section className="grid gap-5 border-2 border-dirty-red bg-dirty-red/10 p-5 shadow-[0.5rem_0.5rem_0_rgba(0,0,0,0.42)] min-[760px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[760px]:items-center min-[760px]:p-6">
      <SectionStamp label="Send a Signal" tone="red" />
      <div className="grid gap-2">
        <h2 className="font-display text-[clamp(2rem,7vw,3.6rem)] font-black uppercase leading-none text-dirty-ash">
          {title}
        </h2>
        <p className="max-w-2xl text-dirty-gray">{body}</p>
      </div>
      <DirtyButton href={href} variant="primary">
        {actionLabel}
      </DirtyButton>
    </section>
  );
}
