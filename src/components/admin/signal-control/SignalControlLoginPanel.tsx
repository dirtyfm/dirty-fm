import { SignalControlLogin } from "@/components/admin/SignalControlLogin";
import { TickerBar } from "@/components/dirty";

export function SignalControlLoginPanel({ message }: { message?: string }) {
  return (
    <div className="grid gap-8">
      <TickerBar
        items={[
          "SIGNAL CONTROL: protected admin wire",
          "PUBLIC USERS: no dashboard data",
          "CLEARANCE: local operator session or Supabase admin profile",
          "STATUS: locked until verified"
        ]}
        label="Signal Control"
      />
      <section className="broadcast-panel p-5 min-[860px]:p-8">
        <div className="relative grid gap-6 min-[860px]:grid-cols-[minmax(0,1fr)_24rem] min-[860px]:items-end">
          <div className="grid gap-4">
            <p className="eyebrow">Protected Console / No Public Wire</p>
            <h1 className="max-w-[10ch] font-display text-[clamp(3.2rem,12vw,7.5rem)] font-black uppercase leading-[0.9] text-dirty-ash">
              Signal Control
            </h1>
            <p className="max-w-2xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
              Operator room for incoming messages, Dirty News submissions, live
              files, and open mic comments. No clearance, no archive guts.
            </p>
            {message ? (
              <p className="max-w-2xl border-l-8 border-dirty-red bg-dirty-red/15 p-4 font-utility text-xs font-bold uppercase text-dirty-yellow">
                {message}
              </p>
            ) : null}
          </div>
          <SignalControlLogin />
        </div>
      </section>
    </div>
  );
}
