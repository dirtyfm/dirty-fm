import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { archivedDirtyTvPosts } from "./dirtyTvArchivedPosts.ts";

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

  it("preserves original date strings exactly", () => {
    assert.deepEqual(
      archivedDirtyTvPosts.map((post) => post.postedAtOriginal),
      ["4/18/2017", "6/20/2016", "4/19/2016", "4/13/2016", "4/12/2016", "4/12/2016"]
    );
  });

  it("keeps Vimeo embeds distinct from YouTube embeds", () => {
    const vimeoPost = archivedDirtyTvPosts.find(
      (post) => post.slug === "morning-show-drug-legalization"
    );

    assert.equal(vimeoPost?.videos[0]?.provider, "vimeo");
    assert.equal(vimeoPost?.videos[0]?.videoId, "171365175");
    assert.equal(vimeoPost?.videos[0]?.url, "https://vimeo.com/171365175");
  });
});
