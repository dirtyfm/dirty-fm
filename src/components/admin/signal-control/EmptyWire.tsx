export function EmptyWire({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-[rgba(183,178,168,0.28)] bg-dirty-black/45 p-4">
      <p className="font-display text-2xl font-black uppercase leading-none text-dirty-ash">
        Stack Clear.
      </p>
      <p className="mt-2 font-utility text-xs font-bold uppercase text-dirty-gray">
        No {label} in the stack right now.
      </p>
    </div>
  );
}
