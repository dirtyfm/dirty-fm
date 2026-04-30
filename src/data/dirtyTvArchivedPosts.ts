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

export type ArchivedDirtyTvHomePreviewItem = {
  slug: string;
  caption: string | null;
};

// Archive text intentionally preserves original titles, dates, descriptions,
// legacy URLs, providers, embed source paths, and original comment counts.
export const archivedDirtyTvPosts: ArchivedDirtyTvPost[] = [
  {
    title: "Drunk In Druglesville",
    slug: "drunk-in-druglesville",
    sourceUrl: "https://www.youtube.com/watch?v=0iX43v-lIGg",
    postedAtOriginal: "6/27/2017",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal: "Drift, Rhino, Ak47 bring it down",
    videos: [
      {
        provider: "youtube",
        videoId: "0iX43v-lIGg",
        url: "https://www.youtube.com/watch?v=0iX43v-lIGg"
      }
    ],
    comments: []
  },
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
    title: "Victims Of The War On Drugs Part 1",
    slug: "victims-of-the-war-on-drugs-part-1-2",
    sourceUrl: "https://www.youtube.com/watch?v=NwFAh1FLh9c",
    postedAtOriginal: "4/18/2017",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "An in-depth interview with Roxy Davis a victim of the war on drugs. Here we touch on topics such as rehab, jail, personal issues, policy and more. Check back for Part 3.",
    videos: [
      {
        provider: "youtube",
        videoId: "NwFAh1FLh9c",
        url: "https://www.youtube.com/watch?v=NwFAh1FLh9c"
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
    title: "11016 Morning Show",
    slug: "11016-morning-show",
    sourceUrl: "https://www.youtube.com/watch?v=LQ2eBjYI93o",
    postedAtOriginal: "1/22/2016",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "Jay & Dirty start the show without drift. Hear about their wild adventure! Drift shows up at the end with Dirty to talk about nothing! Keep tuning in and Subscribe!",
    videos: [
      {
        provider: "youtube",
        videoId: "LQ2eBjYI93o",
        url: "https://www.youtube.com/watch?v=LQ2eBjYI93o"
      }
    ],
    comments: []
  },
  {
    title: "The Morning Show 12/4/15",
    slug: "the-morning-show-12-4-15",
    sourceUrl: "https://www.youtube.com/watch?v=EyV6hZiMUco",
    postedAtOriginal: "12/9/2015",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "Today we talk about childhood memories. Dirtys show up and says almost nothing. Drift is his normal crazy",
    videos: [
      {
        provider: "youtube",
        videoId: "EyV6hZiMUco",
        url: "https://www.youtube.com/watch?v=EyV6hZiMUco"
      }
    ],
    comments: []
  },
  {
    title: "The morning show 112715",
    slug: "the-morning-show-112715",
    sourceUrl: "https://www.youtube.com/watch?v=45P-7mNiWwo",
    postedAtOriginal: "12/4/2015",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "Politics & Loud mouth bullshit. We are always DIRTY! Never Duplicated! (because we are crazy). Listen if you dare. Drift and Mag are recording the most ridiculous morning show to date. S_U_B_S_C_R_I_B_E. Like DirtyFM on Facebook. Visit the Webpage www.DirtyFM.com",
    videos: [
      {
        provider: "youtube",
        videoId: "45P-7mNiWwo",
        url: "https://www.youtube.com/watch?v=45P-7mNiWwo"
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
    title: "The Best Of The Best (Sneak Peek)",
    slug: "the-best-of-the-best-sneak-peek",
    sourceUrl: "https://www.youtube.com/watch?v=0vkXGJ7zGgA",
    postedAtOriginal: "12/16/2013",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "When all hope is lost and our nation has no where else to go. Our last chance of survival is only one man...",
    videos: [
      {
        provider: "youtube",
        videoId: "0vkXGJ7zGgA",
        url: "https://www.youtube.com/watch?v=0vkXGJ7zGgA"
      }
    ],
    comments: []
  },
  {
    title: "Teddy Burrr",
    slug: "teddy-burrr",
    sourceUrl: "https://www.youtube.com/watch?v=oR4FROF7j5Y",
    postedAtOriginal: "12/16/2013",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "Keeping up with this shit is annoying, but shit is about to go down.\nSo ya'll hold on too ya dingdongs and peanut butter.",
    videos: [
      {
        provider: "youtube",
        videoId: "oR4FROF7j5Y",
        url: "https://www.youtube.com/watch?v=oR4FROF7j5Y"
      }
    ],
    comments: []
  },
  {
    title: "We're Gettin' Dirty",
    slug: "we-re-gettin-dirty",
    sourceUrl: "https://www.youtube.com/watch?v=mpzXGFFBbZc",
    postedAtOriginal: "12/11/2013",
    author: "DirtyTV",
    commentCountOriginal: 0,
    descriptionOriginal:
      "Dirty FM is coming back with full hard on and completely drenched panties, With your host, Drift!  Featuring Co-host Grim. Although, FM is during the AM and you know you're too busy sleeping your lazy ass off! So The Dirty is getting Dirtier with DIRTY TV! \n\nComing Soon",
    videos: [
      {
        provider: "youtube",
        videoId: "mpzXGFFBbZc",
        url: "https://www.youtube.com/watch?v=mpzXGFFBbZc"
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
      }
    ],
    comments: []
  }
];

export const archivedDirtyTvYouTubeChannelUrl =
  "https://www.youtube.com/channel/UCLPUDXewLMdJEq9oWRn1JOg";

// Home.html DirtyTV references. Captions are preserved exactly when present.
export const archivedDirtyTvHomePreviewItems: ArchivedDirtyTvHomePreviewItem[] = [
  {
    slug: "missed-the-libertarian-debate",
    caption: "If you missed the libertarian debate..."
  },
  {
    slug: "the-motivation",
    caption: "Check out The Motivation"
  },
  {
    slug: "the-most-interesting-man-in-the-world-running-for-president",
    caption: null
  },
  {
    slug: "morning-show-drug-legalization",
    caption: "Drug Legalization Morning Show"
  },
  {
    slug: "victims-of-the-war-on-drugs-part-1",
    caption: "Victims Of The War On Drugs Part 1"
  }
];

export function getArchivedDirtyTvPosts() {
  return archivedDirtyTvPosts.map((post) => ({
    ...post,
    videos: [...post.videos],
    comments: [] as []
  }));
}

export function getArchivedDirtyTvPostAnchorId(post: Pick<ArchivedDirtyTvPost, "slug">) {
  return post.slug;
}

export function getArchivedDirtyTvHomePreviewCards() {
  return archivedDirtyTvHomePreviewItems.map((item) => {
    const post = archivedDirtyTvPosts.find((candidate) => candidate.slug === item.slug);

    if (!post) {
      throw new Error(`Missing archived DirtyTV post for Home.html preview: ${item.slug}`);
    }

    return {
      title: item.caption ?? post.title,
      href: `/dirty-tv#${getArchivedDirtyTvPostAnchorId(post)}`,
      category: "Archived Home.html",
      runtime: `Posted ${post.postedAtOriginal}`,
      status: post.videos[0]?.provider === "vimeo" ? "Vimeo File" : "YouTube File"
    };
  });
}

export function getArchivedVideoEmbedUrl(video: ArchivedVideoEmbed) {
  if (video.provider === "youtube") {
    return `https://www.youtube.com/embed/${video.videoId}`;
  }

  return `https://player.vimeo.com/video/${video.videoId}`;
}
