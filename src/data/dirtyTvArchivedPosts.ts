export type ArchivedVideoProvider = "youtube" | "vimeo";

export type ArchivedVideoEmbed = {
  provider: ArchivedVideoProvider;
  videoId: string;
  url: string;
  embedSrcOriginal?: string | null;
};

export type ArchivedDirtyTvPost = {
  title: string;
  slug: string;
  sourceUrl: string;
  postedAtOriginal: string;
  author: string;
  commentCountOriginal: number;
  descriptionOriginal: string;
  videos: ArchivedVideoEmbed[];
  comments: [];
};

// Archive text intentionally preserves original titles, dates, descriptions,
// legacy URLs, providers, embed source paths, and original comment counts.
export const archivedDirtyTvPosts: ArchivedDirtyTvPost[] = [
  {
    title: "Victims of the war on drugs Part 1",
    slug: "victims-of-the-war-on-drugs-part-1",
    sourceUrl: "http://www.dirtyfm.com/dirtytv/victims-of-the-war-on-drugs-part-1",
    postedAtOriginal: "4/18/2017",
    author: "Drift",
    commentCountOriginal: 0,
    descriptionOriginal: "",
    videos: [
      {
        provider: "youtube",
        videoId: "Gn9GQDXHBwo",
        url: "https://www.youtube.com/watch?v=Gn9GQDXHBwo",
        embedSrcOriginal: "./DirtyTV_files/Gn9GQDXHBwo.html"
      }
    ],
    comments: []
  },
  {
    title: "Morning Show Drug Legalization",
    slug: "morning-show-drug-legalization",
    sourceUrl: "http://www.dirtyfm.com/dirtytv/morning-show-drug-legalization",
    postedAtOriginal: "6/20/2016",
    author: "Drift",
    commentCountOriginal: 0,
    descriptionOriginal: "The Morning Show\nfrom\nDirtyTV\non\nVimeo\n.",
    videos: [
      {
        provider: "vimeo",
        videoId: "171365175",
        url: "https://vimeo.com/171365175",
        embedSrcOriginal: "./DirtyTV_files/171365175.html"
      }
    ],
    comments: []
  },
  {
    title: "The Most Interesting Man In The World Running For President",
    slug: "the-most-interesting-man-in-the-world-running-for-president",
    sourceUrl:
      "http://www.dirtyfm.com/dirtytv/the-most-interesting-man-in-the-world-running-for-president",
    postedAtOriginal: "4/19/2016",
    author: "Drift",
    commentCountOriginal: 0,
    descriptionOriginal:
      "This guy is running for president! Can you believe it? Will he get your vote?",
    videos: [
      {
        provider: "youtube",
        videoId: "bKgf5PaBzyg",
        url: "https://www.youtube.com/watch?v=bKgf5PaBzyg",
        embedSrcOriginal: "./DirtyTV_files/bKgf5PaBzyg.html"
      },
      {
        provider: "youtube",
        videoId: "n9M69LpV2I4",
        url: "https://www.youtube.com/watch?v=n9M69LpV2I4",
        embedSrcOriginal: "./DirtyTV_files/n9M69LpV2I4.html"
      }
    ],
    comments: []
  },
  {
    title: "The Motivation",
    slug: "the-motivation",
    sourceUrl: "http://www.dirtyfm.com/dirtytv/the-motivation",
    postedAtOriginal: "4/13/2016",
    author: "Drift",
    commentCountOriginal: 0,
    descriptionOriginal:
      "This is an old skit Drift and Grim did a few years ago. Check it out below",
    videos: [
      {
        provider: "youtube",
        videoId: "PXUFGaZ8T2U",
        url: "https://www.youtube.com/watch?v=PXUFGaZ8T2U",
        embedSrcOriginal: "./DirtyTV_files/PXUFGaZ8T2U.html"
      }
    ],
    comments: []
  },
  {
    title: "Missed the libertarian debate?",
    slug: "missed-the-libertarian-debate",
    sourceUrl: "http://www.dirtyfm.com/dirtytv/missed-the-libertarian-debate",
    postedAtOriginal: "4/12/2016",
    author: "Drift",
    commentCountOriginal: 0,
    descriptionOriginal: "Part 1\nPart 2",
    videos: [
      {
        provider: "youtube",
        videoId: "QQPWiCgAjDo",
        url: "https://www.youtube.com/watch?v=QQPWiCgAjDo",
        embedSrcOriginal: "./DirtyTV_files/QQPWiCgAjDo.html"
      },
      {
        provider: "youtube",
        videoId: "yGQ4htj4V78",
        url: "https://www.youtube.com/watch?v=yGQ4htj4V78",
        embedSrcOriginal: "./DirtyTV_files/yGQ4htj4V78.html"
      }
    ],
    comments: []
  },
  {
    title: "New Morning show",
    slug: "new-morning-show",
    sourceUrl: "http://www.dirtyfm.com/dirtytv/new-morning-show",
    postedAtOriginal: "4/12/2016",
    author: "Drift",
    commentCountOriginal: 0,
    descriptionOriginal: "",
    videos: [
      {
        provider: "youtube",
        videoId: "LQ2eBjYI93o",
        url: "https://www.youtube.com/watch?v=LQ2eBjYI93o",
        embedSrcOriginal: "./DirtyTV_files/LQ2eBjYI93o.html"
      }
    ],
    comments: []
  }
];

export function getArchivedDirtyTvPosts() {
  return archivedDirtyTvPosts.map((post) => ({
    ...post,
    videos: [...post.videos],
    comments: [] as []
  }));
}

export function getArchivedVideoEmbedUrl(video: ArchivedVideoEmbed) {
  if (video.provider === "youtube") {
    return `https://www.youtube.com/embed/${video.videoId}`;
  }

  return `https://player.vimeo.com/video/${video.videoId}`;
}
