import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeStoredVideosWithStaticSeeds,
  seedVideo
} from "./contentStoreCore.ts";

const staticVideo = {
  category: "Video Trash",
  description: "Static seed from the bundled archive.",
  host: "Drift",
  id: "dtv-001",
  isFeatured: true,
  publishedAt: "2026-04-30T08:00:00.000Z",
  status: "featured",
  title: "Dirty Signal Test: Do Not Sanitize",
  youtubeId: "dQw4w9WgXcQ"
};

describe("KV video content store merging", () => {
  it("keeps bundled videos available until Signal Control deletes them", () => {
    const videos = mergeStoredVideosWithStaticSeeds([], [staticVideo], new Set());

    assert.deepEqual(videos, [seedVideo(staticVideo)]);
  });

  it("keeps admin video deletes durable for bundled static seeds", () => {
    const videos = mergeStoredVideosWithStaticSeeds([], [staticVideo], new Set(["dtv-001"]));

    assert.deepEqual(videos, []);
  });

  it("lets KV records override bundled static seeds with the same id", () => {
    const storedVideo = {
      ...seedVideo(staticVideo),
      title: "Edited in Signal Control",
      updated_at: "2026-04-30T09:00:00.000Z"
    };
    const videos = mergeStoredVideosWithStaticSeeds([storedVideo], [staticVideo], new Set());

    assert.deepEqual(videos, [storedVideo]);
  });
});
