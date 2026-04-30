import { SectionStamp, TickerBar } from "@/components/dirty";

export default function DirtyNewsLoading() {
  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "DIRTY NEWS: pulling files from the drawer",
          "STATUS: static in transit",
          "NOTICE: published files only"
        ]}
        label="Loading"
      />
      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div className="relative grid gap-5">
          <SectionStamp label="Loading Dirty News" kicker="Stand By" tone="yellow" />
          <div className="loading-slab h-20 max-w-3xl" />
          <div className="loading-slab h-16 max-w-2xl" />
        </div>
      </section>
      <div className="grid gap-4 min-[860px]:grid-cols-3">
        <div className="loading-slab h-64" />
        <div className="loading-slab h-64" />
        <div className="loading-slab h-64" />
      </div>
    </div>
  );
}
