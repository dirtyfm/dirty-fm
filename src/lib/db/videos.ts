import "server-only";
import {
  getFeaturedVideo as getStaticFeaturedVideo,
  getVideoCategories as getStaticVideoCategories,
  getVideos as getStaticVideos,
  getVideosByCategory as getStaticVideosByCategory
} from "@/data/videos";
import { isKvContentBackend } from "@/lib/contentBackend";
import { getKvVideos } from "@/lib/kv/contentStore";

export async function getPublicVideos() {
  if (isKvContentBackend()) {
    return getKvVideos();
  }

  return getStaticVideos();
}

export async function getPublicFeaturedVideo() {
  const videos = await getPublicVideos();
  return videos.find((video) => video.isFeatured) ?? videos[0] ?? getStaticFeaturedVideo();
}

export async function getPublicVideoCategories() {
  if (!isKvContentBackend()) {
    return getStaticVideoCategories();
  }

  return Array.from(new Set((await getPublicVideos()).map((video) => video.category)));
}

export async function getPublicVideosByCategory(category?: string) {
  if (!isKvContentBackend()) {
    return getStaticVideosByCategory(category);
  }

  const videos = await getPublicVideos();
  return category ? videos.filter((video) => video.category === category) : videos;
}
