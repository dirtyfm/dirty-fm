export type VideoStatus =
  | "featured"
  | "unapproved"
  | "raw clip"
  | "archive file";

export type DirtyVideo = {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  category: string;
  status: VideoStatus;
  host: string;
  publishedAt: string;
  isFeatured: boolean;
};

export const dirtyVideos: DirtyVideo[] = [
  {
    id: "dtv-001",
    title: "Dirty Signal Test: Do Not Sanitize",
    youtubeId: "dQw4w9WgXcQ",
    description:
      "Drift kicks the wire until the feed coughs up rants, static, and a warning label nobody asked for.",
    category: "Video Trash",
    status: "featured",
    host: "Drift",
    publishedAt: "2026-04-30T08:00:00.000Z",
    isFeatured: true
  },
  {
    id: "dtv-002",
    title: "Public Access Hell With Bad Lighting",
    youtubeId: "ysz5S6PUM-U",
    description:
      "A cheap little broadcast file about fake polish, managed speech, and the strange dignity of looking terrible on purpose.",
    category: "Public Access Hell",
    status: "unapproved",
    host: "Erik Woods",
    publishedAt: "2026-04-27T20:30:00.000Z",
    isFeatured: false
  },
  {
    id: "dtv-003",
    title: "Bad Calls. Worse Judgment.",
    youtubeId: "ScMzIvxBSi4",
    description:
      "A prank archive scrap with the serial numbers filed off and just enough bad judgment to qualify as a DirtyFM file.",
    category: "Prank Archive",
    status: "raw clip",
    host: "Drift",
    publishedAt: "2026-04-25T18:15:00.000Z",
    isFeatured: false
  },
  {
    id: "dtv-004",
    title: "Government Paperwork Ruined the Mood Again",
    youtubeId: "jNQXAC9IVRw",
    description:
      "Control culture, clipboard rituals, and the ancient art of turning human speech into a dead office memo.",
    category: "Government Bullshit",
    status: "archive file",
    host: "Drift",
    publishedAt: "2026-04-22T16:00:00.000Z",
    isFeatured: false
  },
  {
    id: "dtv-005",
    title: "Open Mic Degeneracy Static Check",
    youtubeId: "aqz-KE-bpKQ",
    description:
      "Listener noise, cracked complaints, and a few useful sparks dragged through the late-night basement feed.",
    category: "Open Mic",
    status: "raw clip",
    host: "DirtyFM Desk",
    publishedAt: "2026-04-19T21:45:00.000Z",
    isFeatured: false
  },
  {
    id: "dtv-006",
    title: "Say It Before They Ban It",
    youtubeId: "M7lc1UVf-VE",
    description:
      "Free speech with a hangover: Drift pokes at the speech managers and asks who put the hall monitor in charge.",
    category: "Fuck the Machine",
    status: "unapproved",
    host: "Drift",
    publishedAt: "2026-04-15T15:20:00.000Z",
    isFeatured: false
  }
];

function byNewestVideo(a: DirtyVideo, b: DirtyVideo) {
  return (
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getVideos() {
  return [...dirtyVideos].sort(byNewestVideo);
}

export function getFeaturedVideo() {
  return getVideos().find((video) => video.isFeatured) ?? getVideos()[0] ?? null;
}

export function getVideoCategories() {
  return Array.from(new Set(getVideos().map((video) => video.category)));
}

export function getVideosByCategory(category?: string) {
  const videos = getVideos();

  if (!category) {
    return videos;
  }

  return videos.filter((video) => video.category === category);
}

export function getYoutubeThumbnailUrl(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getYoutubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

export function formatVideoDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}
