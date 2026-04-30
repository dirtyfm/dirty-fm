import { DirtyButton } from "./DirtyButton";
import { StaticPanel } from "./StaticPanel";

export type LatestTransmissionProps = {
  title: string;
  description: string;
  href: string;
  eyebrow?: string;
  primaryActionLabel?: string;
  secondaryHref?: string;
  secondaryActionLabel?: string;
  meta?: string[];
};

export function LatestTransmission({
  title,
  description,
  href,
  eyebrow = "Latest Transmission",
  primaryActionLabel = "Watch the Damage",
  secondaryHref = "/tv",
  secondaryActionLabel = "Enter the Archive",
  meta = ["File Type: Video", "Status: Unapproved", "Host: Drift"]
}: LatestTransmissionProps) {
  return (
    <StaticPanel
      label={eyebrow}
      title={title}
      tone="red"
      footer={
        <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:flex-wrap">
          <DirtyButton href={href}>{primaryActionLabel}</DirtyButton>
          <DirtyButton href={secondaryHref} variant="secondary">
            {secondaryActionLabel}
          </DirtyButton>
        </div>
      }
    >
      <div className="grid gap-5">
        <p className="max-w-3xl text-lg leading-snug text-dirty-ash">
          {description}
        </p>
        <ul className="grid gap-2 font-utility text-xs font-black uppercase text-dirty-yellow min-[560px]:grid-cols-3">
          {meta.map((item) => (
            <li
              className="border border-[rgba(183,178,168,0.24)] bg-dirty-black/35 px-3 py-2"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </StaticPanel>
  );
}
