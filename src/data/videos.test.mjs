import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getFeaturedVideo,
  getVideoCategories,
  getVideos,
  getVideosByCategory,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl
} from "./videos.ts";

describe("Dirty TV video helpers", () => {
  it("selects the marked featured video", () => {
    const featured = getFeaturedVideo();

    assert.ok(featured);
    assert.equal(featured.isFeatured, true);
  });

  it("filters videos by category", () => {
    const category = "Prank Archive";
    const videos = getVideosByCategory(category);

    assert.deepEqual(getVideoCategories().includes(category), true);
    assert.ok(videos.length > 0);
    assert.equal(videos.every((video) => video.category === category), true);
  });

  it("sorts newest videos first and formats YouTube URLs", () => {
    const videos = getVideos();

    assert.ok(videos.length > 1);
    assert.ok(
      new Date(videos[0].publishedAt).getTime() >=
        new Date(videos[1].publishedAt).getTime()
    );
    assert.equal(
      getYoutubeThumbnailUrl("abc123"),
      "https://img.youtube.com/vi/abc123/hqdefault.jpg"
    );
    assert.equal(
      getYoutubeEmbedUrl("abc123"),
      "https://www.youtube.com/embed/abc123"
    );
  });
});
