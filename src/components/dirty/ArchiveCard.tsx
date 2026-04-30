import Link from "next/link";
import { cx, type DirtyTone, toneStyles } from "./shared";

export type ArchiveMeta = {
  label: string;
  value: string;
};

export type ArchiveCardProps = {
  title: string;
  label?: string;
  notes?: string;
  meta?: ArchiveMeta[];
  href?: string;
  actionLabel?: string;
  tone?: DirtyTone;
  className?: string;
};

export function ArchiveCard({
  title,
  label = "Archive File",
  notes,
  meta = [],
  href,
  actionLabel = "Open the File",
  tone = "red",
  className
}: ArchiveCardProps) {
  return (
    <article
      className={cx(
        "group relative grid gap-4 overflow-hidden border border-[rgba(183,178,168,0.24)] border-l-8 bg-dirty-purple/70 bg-[linear-gradient(135deg,rgba(78,107,74,0.22),transparent_55%)] p-5 shadow-signal transition-colors hover:border-dirty-yellow",
        toneStyles[tone].border,
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,rgba(214,184,74,0.38)_0,rgba(214,184,74,0.38)_10px,transparent_10px,transparent_18px)] opacity-60"
        aria-hidden="true"
      />
      <p className={cx("font-utility text-xs font-black uppercase tracking-[0.08em]", toneStyles[tone].text)}>
        {label}
      </p>
      <h3 className="font-display text-[clamp(1.8rem,6vw,3rem)] font-black uppercase leading-none text-dirty-ash">
        {title}
      </h3>
      {notes ? <p className="text-dirty-gray">{notes}</p> : null}
      {meta.length > 0 ? (
        <dl className="grid gap-2 border-y border-[rgba(183,178,168,0.2)] py-3 font-utility text-xs uppercase min-[560px]:grid-cols-2">
          {meta.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <dt className="text-dirty-yellow">{item.label}</dt>
              <dd className="text-dirty-ash">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {href ? (
        <Link
          className="w-fit border-b-2 border-dirty-yellow font-utility text-sm font-black uppercase text-dirty-yellow no-underline transition-colors group-hover:border-dirty-red group-hover:text-dirty-red"
          href={href}
        >
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
