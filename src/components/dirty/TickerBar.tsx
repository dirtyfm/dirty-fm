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

  return (
    <div
      className={cx(
        "flex overflow-hidden border-y border-dirty-red bg-dirty-black text-dirty-yellow",
        className
      )}
      aria-label={label}
    >
      <p className="shrink-0 bg-dirty-red px-3 py-2 font-utility text-xs font-black uppercase leading-none text-dirty-black">
        {label}
      </p>
      <div className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1 px-3 py-2 font-utility text-xs font-bold uppercase leading-none min-[760px]:flex-nowrap">
        {tickerItems.map((item) => (
          <span className="flex min-w-0 items-center gap-4" key={item}>
            <span className="h-2 w-2 shrink-0 bg-dirty-red" aria-hidden="true" />
            <span className="truncate">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
