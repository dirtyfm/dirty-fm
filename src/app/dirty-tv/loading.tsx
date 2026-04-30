import { SectionStamp, TickerBar } from "@/components/dirty";

export default function DirtyTVLoading() {
  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "DIRTY TV: warming up the tape",
          "STATUS: video static incoming",
          "NOTICE: embeds stay lazy"
        ]}
        label="Loading"
      />
      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div className="relative grid gap-5">
          <SectionStamp label="Loading Dirty TV" kicker="Stand By" tone="blue" />
          <div className="loading-slab aspect-video w-full" />
          <div className="loading-slab h-16 max-w-3xl" />
        </div>
      </section>
      <div className="grid gap-4 min-[760px]:grid-cols-2 min-[1040px]:grid-cols-3">
        <div className="loading-slab h-56" />
        <div className="loading-slab h-56" />
        <div className="loading-slab h-56" />
      </div>
    </div>
  );
}
