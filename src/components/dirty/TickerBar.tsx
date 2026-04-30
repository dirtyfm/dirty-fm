import { cx } from "./shared";

export type TickerBarProps = {
  items: string[];
  label?: string;
  className?: string;
};

export function TickerBar({
  items,
  label = "Dirty Feed",
  className
}: TickerBarProps) {
  const tickerItems = items.length > 0 ? items : ["Static on the wire"];
  const renderTickerItems = (keyPrefix: string) =>
    tickerItems.map((item) => (
      <span className="inline-flex shrink-0 items-center gap-4" key={`${keyPrefix}-${item}`}>
        <span className="h-2 w-2 shrink-0 bg-dirty-red" aria-hidden="true" />
        <span>{item}</span>
      </span>
    ));

  return (
    <div
      className={cx(
        "flex overflow-hidden border-y border-dirty-red bg-dirty-black text-dirty-yellow shadow-[0_0.4rem_0_rgba(0,0,0,0.28)]",
        className
      )}
      aria-label={label}
    >
      <p className="shrink-0 bg-dirty-red px-3 py-2 font-utility text-xs font-black uppercase leading-none text-dirty-black">
        {label}
      </p>
      <div
        className="dirty-ticker-window min-w-0 flex-1 overflow-hidden px-3 py-2 font-utility text-xs font-bold uppercase leading-none"
        tabIndex={0}
      >
        <div className="dirty-ticker-track flex w-max whitespace-nowrap">
          <div className="dirty-ticker-group flex shrink-0 items-center gap-6 pr-6">
            {renderTickerItems("primary")}
          </div>
          <div
            className="dirty-ticker-copy dirty-ticker-group flex shrink-0 items-center gap-6 pr-6"
            aria-hidden="true"
          >
            {renderTickerItems("copy")}
          </div>
        </div>
      </div>
    </div>
  );
}
