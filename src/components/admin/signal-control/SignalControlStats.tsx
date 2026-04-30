function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="border border-[rgba(183,178,168,0.24)] border-l-4 border-l-dirty-yellow bg-dirty-coal/80 p-5">
      <p className="font-utility text-xs font-black uppercase text-dirty-yellow">{label}</p>
      <p className="mt-3 font-display text-5xl font-black uppercase leading-none text-dirty-red">
        {value}
      </p>
    </article>
  );
}

export function SignalControlStats({
  counts
}: {
  counts: {
    contactSubmissions: number;
    pendingDirtyNews: number;
    publishedPosts: number;
    recentComments: number;
  };
}) {
  return (
    <div className="grid gap-4 min-[620px]:grid-cols-2 min-[980px]:grid-cols-4">
      <StatCard label="Incoming Signals" value={counts.contactSubmissions} />
      <StatCard label="Pending Dirty News" value={counts.pendingDirtyNews} />
      <StatCard label="Published Posts" value={counts.publishedPosts} />
      <StatCard label="Recent Comments" value={counts.recentComments} />
    </div>
  );
}
