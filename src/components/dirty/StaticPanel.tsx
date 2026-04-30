import { cx, type DirtyTone, toneStyles } from "./shared";

export type StaticPanelProps = {
  children: React.ReactNode;
  title?: string;
  label?: string;
  footer?: React.ReactNode;
  tone?: DirtyTone;
  className?: string;
};

export function StaticPanel({
  children,
  title,
  label = "Static Report",
  footer,
  tone = "red",
  className
}: StaticPanelProps) {
  return (
    <section
      className={cx(
        "relative overflow-hidden border bg-dirty-coal/88 p-5 shadow-signal min-[760px]:p-6",
        toneStyles[tone].border,
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(183,178,168,0.08)_0,rgba(183,178,168,0.08)_1px,transparent_1px,transparent_6px)] opacity-35"
        aria-hidden="true"
      />
      <div className="relative grid gap-4">
        <p className={cx("font-utility text-xs font-black uppercase tracking-[0.08em]", toneStyles[tone].text)}>
          {label}
        </p>
        {title ? (
          <h2 className="font-display text-[clamp(2rem,7vw,3.8rem)] font-black uppercase leading-none text-dirty-ash">
            {title}
          </h2>
        ) : null}
        <div className="text-dirty-gray">{children}</div>
        {footer ? (
          <div className="border-t border-[rgba(183,178,168,0.24)] pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
