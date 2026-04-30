import Link from "next/link";
import { cx } from "./shared";

type VideoTrashCardBaseProps = {
  title: string;
  category?: string;
  runtime?: string;
  status?: string;
  thumbnailUrl?: string;
};

type VideoTrashCardLinkProps = VideoTrashCardBaseProps & {
  href: string;
  onPlay?: never;
  isActive?: never;
  actionLabel?: string;
};

type VideoTrashCardButtonProps = VideoTrashCardBaseProps & {
  href?: never;
  onPlay: () => void;
  isActive?: boolean;
  actionLabel?: string;
};

export type VideoTrashCardProps =
  | VideoTrashCardLinkProps
  | VideoTrashCardButtonProps;

export function VideoTrashCard(props: VideoTrashCardProps) {
  const {
    title,
    category = "Video Trash",
    runtime = "Runtime Unknown",
    status = "Unapproved Clip",
    thumbnailUrl,
    actionLabel
  } = props;
  const isButton = "onPlay" in props;
  const isActive = isButton ? props.isActive : false;
  const content = (
    <>
      <div
        className={cx(
          "relative aspect-video bg-dirty-black bg-cover bg-center",
          !thumbnailUrl &&
            "bg-[linear-gradient(135deg,rgba(45,79,115,0.65),rgba(8,8,7,0.15)),repeating-linear-gradient(0deg,rgba(183,178,168,0.18)_0,rgba(183,178,168,0.18)_1px,transparent_1px,transparent_7px)]"
        )}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      >
        <div className="absolute left-3 top-3 border border-dirty-red bg-dirty-red px-2 py-1 font-utility text-xs font-black uppercase leading-none text-dirty-black shadow-[0.18rem_0.18rem_0_rgba(0,0,0,0.4)]">
          {status}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(183,178,168,0.12)_0,rgba(183,178,168,0.12)_1px,transparent_1px,transparent_6px)] opacity-20"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-dirty-black via-dirty-black/70 to-transparent p-3">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            {runtime}
          </span>
          <span className="font-display text-3xl font-black uppercase leading-none text-dirty-red transition-colors group-hover:text-dirty-yellow">
            {isActive ? "On Air" : "Play"}
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
    </>
  );

  return (
    <article
      className={cx(
        "group overflow-hidden border border-[rgba(183,178,168,0.24)] bg-dirty-purple/70 shadow-signal transition-colors hover:border-dirty-blue focus-within:border-dirty-yellow",
        isActive && "border-dirty-yellow"
      )}
    >
      {isButton ? (
        <button
          aria-label={actionLabel ?? `Play ${title} on Dirty TV`}
          aria-pressed={isActive}
          className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left no-underline"
          onClick={props.onPlay}
          type="button"
        >
          {content}
        </button>
      ) : (
        <Link
          aria-label={actionLabel ?? `Watch ${title}`}
          className="block no-underline"
          href={props.href}
        >
          {content}
        </Link>
      )}
    </article>
  );
}
