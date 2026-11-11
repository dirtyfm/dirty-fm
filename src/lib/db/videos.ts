import "server-only";
import { cache } from "react";
import { getVideos as getStaticVideos } from "@/data/videos";
import { isKvContentBackend } from "@/lib/contentBackend";
import { getPublicDirtyNewsPosts } from "@/lib/db/posts";
import { getKvVideos } from "@/lib/kv/contentStore";
import { getPublishedVideoAttachments, getYoutubeVideoSource } from "@/lib/videoAttachments";

export const getPublicVideos = cache(async () => {
  const [videos, posts] = await Promise.all([
    isKvContentBackend() ? getKvVideos() : getStaticVideos(),
    getPublicDirtyNewsPosts()
  ]);
  const curated = videos.map(({ youtubeId, ...video }) => ({
    ...video,
    source: getYoutubeVideoSource(youtubeId)
  }));
  return [...curated, ...getPublishedVideoAttachments(posts, curated)].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
});

export async function getPublicFeaturedVideo() {
  const videos = await getPublicVideos();
  return videos.find((video) => video.isFeatured) ?? videos[0] ?? null;
}

export async function getPublicVideoCategories() {
  return Array.from(new Set((await getPublicVideos()).map((video) => video.category)));
}

export async function getPublicVideosByCategory(category?: string) {
  const videos = await getPublicVideos();
  return category ? videos.filter((video) => video.category === category) : videos;
}
