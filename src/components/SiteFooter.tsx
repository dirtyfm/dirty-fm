import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-[min(calc(100%-2rem),1180px)] flex-col items-stretch gap-6 border-t border-[rgba(183,178,168,0.24)] py-6 min-[760px]:w-[min(calc(100%-4rem),1180px)] min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between">
      <div>
        <p className="footer-kicker">End Transmission</p>
        <p className="font-display text-[clamp(1.5rem,4vw,2.8rem)] uppercase leading-none text-dirty-ash">
          Pirate Radio for the Unmanageable.
        </p>
      </div>
      <div
        className="flex flex-wrap justify-start gap-2 min-[760px]:justify-end"
        aria-label="Footer navigation"
      >
        <Link className="nav-link" href="/news">
          Dirty News
        </Link>
        <Link className="nav-link" href="/tv">
          Dirty TV
        </Link>
        <Link className="nav-link" href="/contact">
          Send a Signal
        </Link>
      </div>
    </footer>
  );
}
