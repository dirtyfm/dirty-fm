import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  archivedDirtyTvPosts,
  archivedDirtyTvYouTubeChannelUrl,
  getArchivedDirtyTvHomePreviewCards,
  getArchivedDirtyTvPostAnchorId,
  getArchivedDirtyTvPosts,
  getArchivedVideoEmbedUrl
} from "./dirtyTvArchivedPosts.ts";

describe("archived Dirty TV posts", () => {
  it("preserves the extracted post and embed counts", () => {
    assert.equal(archivedDirtyTvPosts.length, 13);
    assert.equal(
      archivedDirtyTvPosts.reduce((count, post) => count + post.videos.length, 0),
      14
    );
  });

  it("preserves all known embedded video IDs", () => {
    const videoIds = archivedDirtyTvPosts.flatMap((post) =>
      post.videos.map((video) => video.videoId)
    );

    assert.deepEqual(videoIds, [
      "0iX43v-lIGg",
      "Gn9GQDXHBwo",
      "NwFAh1FLh9c",
      "171365175",
      "LQ2eBjYI93o",
      "EyV6hZiMUco",
      "45P-7mNiWwo",
      "bKgf5PaBzyg",
      "n9M69LpV2I4",
      "PXUFGaZ8T2U",
      "0vkXGJ7zGgA",
      "oR4FROF7j5Y",
      "mpzXGFFBbZc",
      "QQPWiCgAjDo"
    ]);
  });

  it("exposes all exact archived titles for the Dirty TV route", () => {
    assert.deepEqual(
      getArchivedDirtyTvPosts().map((post) => post.title),
      [
        "Drunk In Druglesville",
        "Victims of the war on drugs Part 1",
        "Victims Of The War On Drugs Part 1",
        "Morning Show Drug Legalization",
        "11016 Morning Show",
        "The Morning Show 12/4/15",
        "The morning show 112715",
        "The Most Interesting Man In The World Running For President",
        "The Motivation",
        "The Best Of The Best (Sneak Peek)",
        "Teddy Burrr",
        "We're Gettin' Dirty",
        "Missed the libertarian debate?"
      ]
    );
  });

  it("preserves original date strings exactly", () => {
    assert.deepEqual(
      archivedDirtyTvPosts.map((post) => post.postedAtOriginal),
      [
        "6/27/2017",
        "4/18/2017",
        "4/18/2017",
        "6/20/2016",
        "1/22/2016",
        "12/9/2015",
        "12/4/2015",
        "4/19/2016",
        "4/13/2016",
        "12/16/2013",
        "12/16/2013",
        "12/11/2013",
        "4/12/2016"
      ]
    );
  });

  it("uses exact archived slugs as Dirty TV anchor IDs", () => {
    assert.deepEqual(
      archivedDirtyTvPosts.map((post) => getArchivedDirtyTvPostAnchorId(post)),
      [
        "drunk-in-druglesville",
        "victims-of-the-war-on-drugs-part-1",
        "victims-of-the-war-on-drugs-part-1-2",
        "morning-show-drug-legalization",
        "11016-morning-show",
        "the-morning-show-12-4-15",
        "the-morning-show-112715",
        "the-most-interesting-man-in-the-world-running-for-president",
        "the-motivation",
        "the-best-of-the-best-sneak-peek",
        "teddy-burrr",
        "we-re-gettin-dirty",
        "missed-the-libertarian-debate"
      ]
    );
  });

  it("keeps duplicate YouTube titles as distinct archive files", () => {
    const duplicateTitlePosts = archivedDirtyTvPosts.filter((post) =>
      post.title.toLowerCase() === "victims of the war on drugs part 1".toLowerCase()
    );

    assert.deepEqual(
      duplicateTitlePosts.map((post) => post.slug),
      [
        "victims-of-the-war-on-drugs-part-1",
        "victims-of-the-war-on-drugs-part-1-2"
      ]
    );
    assert.deepEqual(
      duplicateTitlePosts.flatMap((post) =>
        post.videos.map((video) => video.videoId)
      ),
      ["Gn9GQDXHBwo", "NwFAh1FLh9c"]
    );
  });

  it("builds Home.html preview cards against current Dirty TV route anchors", () => {
    assert.deepEqual(
      getArchivedDirtyTvHomePreviewCards().map((card) => card.href),
      [
        "/dirty-tv#missed-the-libertarian-debate",
        "/dirty-tv#the-motivation",
        "/dirty-tv#the-most-interesting-man-in-the-world-running-for-president",
        "/dirty-tv#morning-show-drug-legalization",
        "/dirty-tv#victims-of-the-war-on-drugs-part-1"
      ]
    );
  });

  it("preserves Home.html DirtyTV captions exactly when displayed", () => {
    assert.deepEqual(
      getArchivedDirtyTvHomePreviewCards().map((card) => card.title),
      [
        "If you missed the libertarian debate...",
        "Check out The Motivation",
        "The Most Interesting Man In The World Running For President",
        "Drug Legalization Morning Show",
        "Victims Of The War On Drugs Part 1"
      ]
    );
  });

  it("preserves the Home.html YouTube channel CTA URL", () => {
    assert.equal(
      archivedDirtyTvYouTubeChannelUrl,
      "https://www.youtube.com/channel/UCLPUDXewLMdJEq9oWRn1JOg"
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
      "https://www.youtube.com/embed/0iX43v-lIGg",
      "https://www.youtube.com/embed/Gn9GQDXHBwo",
      "https://www.youtube.com/embed/NwFAh1FLh9c",
      "https://player.vimeo.com/video/171365175",
      "https://www.youtube.com/embed/LQ2eBjYI93o",
      "https://www.youtube.com/embed/EyV6hZiMUco",
      "https://www.youtube.com/embed/45P-7mNiWwo",
      "https://www.youtube.com/embed/bKgf5PaBzyg",
      "https://www.youtube.com/embed/n9M69LpV2I4",
      "https://www.youtube.com/embed/PXUFGaZ8T2U",
      "https://www.youtube.com/embed/0vkXGJ7zGgA",
      "https://www.youtube.com/embed/oR4FROF7j5Y",
      "https://www.youtube.com/embed/mpzXGFFBbZc",
      "https://www.youtube.com/embed/QQPWiCgAjDo"
    ]);
  });
});
