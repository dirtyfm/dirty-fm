import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  archivedDirtyTvPosts,
  getArchivedDirtyTvPostAnchorId,
  getArchivedDirtyTvPosts,
  getArchivedVideoEmbedUrl
} from "./dirtyTvArchivedPosts.ts";

describe("archived Dirty TV posts", () => {
  it("preserves the extracted post and embed counts", () => {
    assert.equal(archivedDirtyTvPosts.length, 6);
    assert.equal(
      archivedDirtyTvPosts.reduce((count, post) => count + post.videos.length, 0),
      8
    );
  });

  it("preserves all known embedded video IDs", () => {
    const videoIds = archivedDirtyTvPosts.flatMap((post) =>
      post.videos.map((video) => video.videoId)
    );

    assert.deepEqual(videoIds, [
      "Gn9GQDXHBwo",
      "171365175",
      "bKgf5PaBzyg",
      "n9M69LpV2I4",
      "PXUFGaZ8T2U",
      "QQPWiCgAjDo",
      "yGQ4htj4V78",
      "LQ2eBjYI93o"
    ]);
  });

  it("exposes all exact archived titles for the Dirty TV route", () => {
    assert.deepEqual(
      getArchivedDirtyTvPosts().map((post) => post.title),
      [
        "Victims of the war on drugs Part 1",
        "Morning Show Drug Legalization",
        "The Most Interesting Man In The World Running For President",
        "The Motivation",
        "Missed the libertarian debate?",
        "New Morning show"
      ]
    );
  });

  it("preserves original date strings exactly", () => {
    assert.deepEqual(
      archivedDirtyTvPosts.map((post) => post.postedAtOriginal),
      ["4/18/2017", "6/20/2016", "4/19/2016", "4/13/2016", "4/12/2016", "4/12/2016"]
    );
  });

  it("uses exact archived slugs as Dirty TV anchor IDs", () => {
    assert.deepEqual(
      archivedDirtyTvPosts.map((post) => getArchivedDirtyTvPostAnchorId(post)),
      [
        "victims-of-the-war-on-drugs-part-1",
        "morning-show-drug-legalization",
        "the-most-interesting-man-in-the-world-running-for-president",
        "the-motivation",
        "missed-the-libertarian-debate",
        "new-morning-show"
      ]
    );
  });

  it("keeps Vimeo embeds distinct from YouTube embeds", () => {
    const vimeoPost = archivedDirtyTvPosts.find(
      (post) => post.slug === "morning-show-drug-legalization"
    );

    assert.equal(vimeoPost?.videos[0]?.provider, "vimeo");
    assert.equal(vimeoPost?.videos[0]?.videoId, "171365175");
    assert.equal(vimeoPost?.videos[0]?.url, "https://vimeo.com/171365175");
    assert.equal(
      vimeoPost?.videos[0] && getArchivedVideoEmbedUrl(vimeoPost.videos[0]),
      "https://player.vimeo.com/video/171365175"
    );
  });

  it("builds safe live embed URLs from archived video IDs", () => {
    const embedUrls = archivedDirtyTvPosts.flatMap((post) =>
      post.videos.map((video) => getArchivedVideoEmbedUrl(video))
    );

    assert.deepEqual(embedUrls, [
      "https://www.youtube.com/embed/Gn9GQDXHBwo",
      "https://player.vimeo.com/video/171365175",
      "https://www.youtube.com/embed/bKgf5PaBzyg",
      "https://www.youtube.com/embed/n9M69LpV2I4",
      "https://www.youtube.com/embed/PXUFGaZ8T2U",
      "https://www.youtube.com/embed/QQPWiCgAjDo",
      "https://www.youtube.com/embed/yGQ4htj4V78",
      "https://www.youtube.com/embed/LQ2eBjYI93o"
    ]);
  });
});
