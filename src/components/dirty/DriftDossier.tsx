import { StaticPanel } from "./StaticPanel";

export type DossierItem = {
  label: string;
  value: string;
};

export type DriftDossierProps = {
  name?: string;
  summary?: string;
  items?: DossierItem[];
};

const defaultItems: DossierItem[] = [
  { label: "Role", value: "Host. Loudmouth. Government problem." },
  { label: "Known For", value: "Raw talk, bad decisions, no permission." },
  { label: "Threat Level", value: "Respectability allergy confirmed." }
];

export function DriftDossier({
  name = "Drift",
  summary = "The dirty signal's main problem: loud, funny, hostile to control, and not applying for your approval.",
  items = defaultItems
}: DriftDossierProps) {
  return (
    <StaticPanel label="The Drift Files" title={name} tone="green">
      <div className="grid gap-5">
        <p className="text-lg leading-snug text-dirty-ash">{summary}</p>
        <dl className="grid gap-3">
          {items.map((item) => (
            <div
              className="border-l-4 border-dirty-green bg-dirty-black/35 px-4 py-3"
              key={`${item.label}-${item.value}`}
            >
              <dt className="font-utility text-xs font-black uppercase tracking-[0.08em] text-dirty-yellow">
                {item.label}
              </dt>
              <dd className="text-dirty-ash">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </StaticPanel>
  );
}
