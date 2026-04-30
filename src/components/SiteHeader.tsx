import Link from "next/link";

const navItems = [
  { href: "/", label: "Signal" },
  { href: "/dirty-tv", label: "Video Trash" },
  { href: "/dirty-news", label: "Dirty News" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-[min(calc(100%-2rem),1180px)] flex-col items-stretch gap-4 border-b border-[rgba(183,178,168,0.24)] py-5 min-[760px]:w-[min(calc(100%-4rem),1180px)] min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
      <Link
        className="group inline-flex flex-col gap-0.5 text-dirty-ash no-underline"
        href="/"
        aria-label="DirtyFM home"
      >
        <span className="relative w-fit font-display text-[clamp(2.4rem,8vw,4.5rem)] font-black uppercase leading-[0.82] text-dirty-red [text-shadow:0.06em_0.04em_0_rgba(209,42,31,0.28)] after:absolute after:inset-x-0 after:top-1/2 after:h-1 after:-translate-y-1/2 after:bg-dirty-black/70 group-hover:text-dirty-yellow">
          DirtyFM
        </span>
        <span className="brand-tag">Raw Signal / No Permission / 24 Hour Static</span>
      </Link>
      <nav
        className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 min-[760px]:mx-0 min-[760px]:max-w-[36rem] min-[760px]:flex-wrap min-[760px]:justify-end min-[760px]:overflow-visible min-[760px]:px-0 min-[760px]:pb-0"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <Link className="nav-link" key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
