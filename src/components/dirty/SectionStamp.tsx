import { cx, type DirtyTone, toneStyles } from "./shared";

export type SectionStampProps = {
  label: string;
  kicker?: string;
  tone?: DirtyTone;
  className?: string;
};

export function SectionStamp({
  label,
  kicker = "DirtyFM",
  tone = "red",
  className
}: SectionStampProps) {
  return (
    <div
      className={cx(
        "inline-flex max-w-full -rotate-1 flex-col border-2 px-3 py-2 shadow-[0.25rem_0.25rem_0_rgba(0,0,0,0.38)]",
        toneStyles[tone].stamp,
        className
      )}
    >
      <span className="font-utility text-[0.65rem] font-black uppercase leading-none tracking-[0.08em] opacity-80">
        {kicker}
      </span>
      <span className="font-display text-[clamp(1.25rem,7vw,2.5rem)] font-black uppercase leading-none">
        {label}
      </span>
    </div>
  );
}
