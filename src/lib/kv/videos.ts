import { dirtyVideos, type DirtyVideo, type VideoStatus } from "@/data/videos";
import { readJsonKey, writeJsonKey, deleteJsonKey } from "@/lib/kv/store";
import type { KvVideo, KvVideoStatus } from "@/lib/kv/types";
import { addToIndex, byPublishedDesc, getIndex, readMany, removeFromIndex } from "@/lib/kv/indexes";
import { createId, keyFor, keys, nowIso } from "@/lib/kv/keys";
import { mergeStoredVideosWithStaticSeeds } from "@/lib/kv/contentStoreCore";

function videoToPublic(video: KvVideo): DirtyVideo {
  return {
    category: video.category,
    description: video.description,
    host: video.host,
    id: video.id,
    isFeatured: video.is_featured,
    publishedAt: video.published_at,
    status: video.status as VideoStatus,
    title: video.title,
    youtubeId: video.youtube_id
  };
}

export async function getKvVideos() {
  const videos = await readMany<KvVideo>(keys.videosIndex, (id) => keyFor("videos", id));
  const deletedVideoIds = new Set(await getIndex(keys.videosDeletedIndex));
  return mergeStoredVideosWithStaticSeeds(videos, dirtyVideos, deletedVideoIds)
    .sort(byPublishedDesc)
    .map((video) => videoToPublic(video as KvVideo));
}

export async function getKvAdminVideos() {
  const videos = await getKvVideos();
  return videos.map((video) => ({
    category: video.category,
    description: video.description,
    host: video.host,
    id: video.id,
    is_featured: video.isFeatured,
    published_at: video.publishedAt,
    status: video.status,
    title: video.title,
    youtube_id: video.youtubeId
  }));
}

export async function upsertKvVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || createId("video");
  const timestamp = nowIso();
  const existing = await readJsonKey<KvVideo | null>(keyFor("videos", id), null);
  const title = String(formData.get("title") ?? existing?.title ?? "").trim();
  const youtubeId = String(formData.get("youtube_id") ?? existing?.youtube_id ?? "").trim();
  if (!title || !youtubeId) throw new Error("Video title and YouTube ID are required.");
  const video: KvVideo = {
    category: String(formData.get("category") ?? existing?.category ?? "Video Trash").trim(),
    created_at: existing?.created_at ?? timestamp,
    description: String(formData.get("description") ?? existing?.description ?? "").trim(),
    host: String(formData.get("host") ?? existing?.host ?? "Drift").trim(),
    id,
    is_featured: formData.get("is_featured") === "on",
    published_at: String(formData.get("published_at") ?? existing?.published_at ?? timestamp).trim(),
    status: String(formData.get("status") ?? existing?.status ?? "archive file") as KvVideoStatus,
    title,
    updated_at: timestamp,
    youtube_id: youtubeId
  };
  await writeJsonKey(keyFor("videos", id), video);
  await removeFromIndex(keys.videosDeletedIndex, id);
  await addToIndex(keys.videosIndex, id);
}

export async function deleteKvVideo(id: string) {
  try {
    await deleteJsonKey(keyFor("videos", id));
  } catch (error) {
    console.error(`KV video record delete failed for ${id}; writing tombstone anyway.`, error);
  }
  await removeFromIndex(keys.videosIndex, id);
  await addToIndex(keys.videosDeletedIndex, id);
}
