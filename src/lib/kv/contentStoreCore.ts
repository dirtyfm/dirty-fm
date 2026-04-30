type StoredVideo = {
  category: string;
  created_at: string;
  description: string;
  host: string;
  id: string;
  is_featured: boolean;
  published_at: string;
  status: string;
  title: string;
  updated_at: string;
  youtube_id: string;
};

type StaticVideo = {
  category: string;
  description: string;
  host: string;
  id: string;
  isFeatured: boolean;
  publishedAt: string;
  status: string;
  title: string;
  youtubeId: string;
};

export function seedVideo(video: StaticVideo): StoredVideo {
  return {
    category: video.category,
    created_at: video.publishedAt,
    description: video.description,
    host: video.host,
    id: video.id,
    is_featured: video.isFeatured,
    published_at: video.publishedAt,
    status: video.status,
    title: video.title,
    updated_at: video.publishedAt,
    youtube_id: video.youtubeId
  };
}

export function mergeStoredVideosWithStaticSeeds<TStored extends StoredVideo, TStatic extends StaticVideo>(
  storedVideos: TStored[],
  staticVideos: TStatic[],
  deletedVideoIds: Set<string>
) {
  return [
    ...storedVideos.filter((video) => !deletedVideoIds.has(video.id)),
    ...staticVideos
      .filter((video) => !deletedVideoIds.has(video.id))
      .filter((video) => !storedVideos.some((item) => item.id === video.id))
      .map(seedVideo)
  ];
}
