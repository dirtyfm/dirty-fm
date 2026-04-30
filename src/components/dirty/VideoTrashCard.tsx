import Link from "next/link";
import { cx } from "./shared";

export type VideoTrashCardProps = {
  title: string;
  href: string;
  category?: string;
  runtime?: string;
  status?: string;
  thumbnailUrl?: string;
};

export function VideoTrashCard({
  title,
  href,
  category = "Video Trash",
  runtime = "Runtime Unknown",
  status = "Unapproved Clip",
  thumbnailUrl
}: VideoTrashCardProps) {
  return (
    <article className="group overflow-hidden border border-[rgba(183,178,168,0.24)] bg-dirty-purple/70 shadow-signal">
      <Link className="block no-underline" href={href} aria-label={`Watch ${title}`}>
        <div
          className={cx(
            "relative aspect-video bg-dirty-black bg-cover bg-center",
            !thumbnailUrl &&
              "bg-[linear-gradient(135deg,rgba(45,79,115,0.65),rgba(8,8,7,0.15)),repeating-linear-gradient(0deg,rgba(183,178,168,0.18)_0,rgba(183,178,168,0.18)_1px,transparent_1px,transparent_7px)]"
          )}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
        >
          <div className="absolute left-3 top-3 bg-dirty-red px-2 py-1 font-utility text-xs font-black uppercase leading-none text-dirty-black">
            {status}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-dirty-black via-dirty-black/70 to-transparent p-3">
            <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
              {runtime}
            </span>
            <span className="font-display text-3xl font-black uppercase leading-none text-dirty-red">
              Play
            </span>
          </div>
        </div>
        <div className="grid gap-2 p-4">
          <p className="font-utility text-xs font-black uppercase tracking-[0.08em] text-dirty-blue">
            {category}
          </p>
          <h3 className="font-display text-[clamp(1.6rem,6vw,2.7rem)] font-black uppercase leading-none text-dirty-ash group-hover:text-dirty-yellow">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
