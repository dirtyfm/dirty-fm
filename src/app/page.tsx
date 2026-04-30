import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-6">
      <p className="eyebrow">Live Signal / Unauthorized Archive</p>
      <div className="grid items-end gap-8 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(17rem,0.42fr)] min-[760px]:gap-12">
        <div className="grid gap-6">
          <h1 className="max-w-[9ch] font-display text-[clamp(3.5rem,13vw,9rem)] font-black uppercase leading-[0.95] text-dirty-ash min-[760px]:max-w-[11ch]">
            DirtyFM Is the Signal They Forgot to Kill.
          </h1>
          <p className="max-w-3xl text-[clamp(1.1rem,2.5vw,1.45rem)] leading-snug text-dirty-ash">
            Raw radio, prank-call chaos, dark comedy, anti-control noise, and
            random fucking bullshit from Erik Woods, Drift, and whoever gets
            close enough to the mic.
          </p>
          <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:flex-wrap">
            <Link className="button button-primary w-full min-[440px]:w-auto" href="/tv">
              Watch the Damage
            </Link>
            <Link
              className="button button-secondary w-full min-[440px]:w-auto"
              href="/news"
            >
              Read Dirty News
            </Link>
          </div>
        </div>
        <aside className="archive-card" aria-label="Current signal">
          <p className="card-label">Signal Status</p>
          <h2 className="my-2 font-display text-[clamp(2rem,6vw,3.4rem)] font-black uppercase leading-none text-dirty-ash">
            The Dirty Signal Still Gets Through.
          </h2>
          <p className="text-dirty-ash">
            Layout shell online. Archive doors marked. Static present, but the
            words still punch through.
          </p>
        </aside>
      </div>
    </section>
  );
}
