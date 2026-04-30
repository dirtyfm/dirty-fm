import Link from "next/link";

const navItems = [
  { href: "/", label: "Signal" },
  { href: "/dirty-tv", label: "Dirty TV" },
  { href: "/dirty-news", label: "Dirty News" },
  { href: "/drift-files", label: "The Drift Files" },
  { href: "/prank-archive", label: "Prank Archive" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-[min(calc(100%-2rem),1180px)] flex-col items-stretch gap-4 border-b border-[rgba(183,178,168,0.24)] py-5 min-[760px]:w-[min(calc(100%-4rem),1180px)] min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
      <Link
        className="inline-flex flex-col gap-0.5 text-dirty-ash no-underline"
        href="/"
        aria-label="DirtyFM home"
      >
        <span className="font-display text-[clamp(2.4rem,8vw,4.5rem)] font-black uppercase leading-[0.82] text-dirty-red [text-shadow:0.06em_0.04em_0_rgba(209,42,31,0.28)]">
          DirtyFM
        </span>
        <span className="brand-tag">Raw Signal / No Permission</span>
      </Link>
      <nav
        className="flex max-w-[44rem] flex-wrap justify-start gap-2 min-[760px]:justify-end"
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
