import { SectionStamp, TickerBar } from "@/components/dirty";

export default function SignalControlLoading() {
  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "SIGNAL CONTROL: checking clearance",
          "STATUS: loading operator console",
          "PUBLIC WIRE: no dashboard data exposed"
        ]}
        label="Loading"
      />
      <section className="broadcast-panel p-5 min-[760px]:p-8">
        <div className="relative grid gap-5">
          <SectionStamp label="Checking Clearance" kicker="Signal Control" tone="green" />
          <div className="loading-slab h-20 max-w-3xl" />
          <div className="grid gap-4 min-[620px]:grid-cols-2 min-[980px]:grid-cols-4">
            <div className="loading-slab h-32" />
            <div className="loading-slab h-32" />
            <div className="loading-slab h-32" />
            <div className="loading-slab h-32" />
          </div>
        </div>
      </section>
    </div>
  );
}
