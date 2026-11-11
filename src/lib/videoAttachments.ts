import type { DirtyNewsPost } from "../data/posts.ts";
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl, type DirtyVideo } from "../data/videos.ts";

export type VideoSource = {
  key: string;
  kind: "embed" | "file";
  label: string;
  src: string;
  watchUrl: string;
  thumbnailUrl?: string;
};

export type PublicVideo = Omit<DirtyVideo, "youtubeId"> & { source: VideoSource };

const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const vimeoHosts = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const attachmentFooter = /(?:^|\r?\n)Attachment\/source wire: (https?:\/\/\S+)\s*$/i;

export function getYoutubeVideoSource(id: string): VideoSource {
  return {
    key: `youtube:${id}`,
    kind: "embed",
    label: "YouTube",
    src: getYoutubeEmbedUrl(id),
    thumbnailUrl: getYoutubeThumbnailUrl(id),
    watchUrl: `https://www.youtube.com/watch?v=${id}`
  };
}

export function parseAttachmentUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url;
  } catch {
    return null;
  }
  return null;
}

export function getVideoSource(value?: string | null): VideoSource | null {
  const url = parseAttachmentUrl(value);
  if (!url) return null;
  const { hostname, pathname } = url;
  const path = pathname.replace(/\/$/, "");

  if (hostname === "youtu.be" || youtubeHosts.has(hostname)) {
    const id = hostname === "youtu.be" ? path.slice(1) :
      path === "/watch" ? url.searchParams.get("v") :
      path.match(/^\/(?:shorts|live|embed|v)\/([^/]+)$/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? getYoutubeVideoSource(id) : null;
  }

  if (vimeoHosts.has(hostname)) {
    const match = hostname === "player.vimeo.com"
      ? path.match(/^\/video\/(\d+)$/)
      : path.match(/^\/(\d+)(?:\/([a-f\d]+))?$/i);
    if (!match) return null;
    const [, id, pathHash] = match;
    const hash = pathHash ?? url.searchParams.get("h");
    const privacyHash = hash && /^[a-f\d]+$/i.test(hash) ? hash : null;
    return {
      key: `vimeo:${id}`,
      kind: "embed",
      label: "Vimeo",
      src: `https://player.vimeo.com/video/${id}${privacyHash ? `?h=${privacyHash}` : ""}`,
      watchUrl: `https://vimeo.com/${id}${privacyHash ? `/${privacyHash}` : ""}`
    };
  }

  if (url.protocol !== "https:" || !/\.(?:mp4|webm|ogv)$/i.test(pathname)) return null;
  const src = url.href;
  url.hash = "";
  return { key: url.href, kind: "file", label: "Video File", src, watchUrl: src };
}

export function getLegacyAttachmentUrl(body: string) {
  return body.match(attachmentFooter)?.[1];
}

// The alternate backend stores its reviewed video link in the published body.
export function withVideoAttachmentFooter(body: string, sourceUrl?: string) {
  const source = getVideoSource(sourceUrl);
  if (!source && !getVideoSource(getLegacyAttachmentUrl(body))) return body;
  const text = body.replace(attachmentFooter, "").trimEnd();
  return source ? `${text}\n\nAttachment/source wire: ${sourceUrl}` : text;
}

export function getPublishedVideoAttachments(posts: DirtyNewsPost[], existing: PublicVideo[], now = Date.now()) {
  const seen = new Set(existing.map((video) => video.source.key));
  const attachments: PublicVideo[] = [];
  for (const post of posts) {
    const publishedAt = Date.parse(post.publishedAt);
    if (post.status !== "published" || !Number.isFinite(publishedAt) || publishedAt > now) continue;
    const url = post.sourceUrl === undefined ? getLegacyAttachmentUrl(post.body.at(-1) ?? "") : post.sourceUrl;
    const source = getVideoSource(url);
    if (!source || seen.has(source.key)) continue;
    seen.add(source.key);
    attachments.push({
      category: post.category,
      description: post.excerpt,
      host: post.author ?? "DirtyFM Desk",
      id: `attachment-${post.id}`,
      isFeatured: false,
      publishedAt: post.publishedAt,
      source,
      status: "raw clip",
      title: post.title
    });
  }
  return attachments;
}
