import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapVisiblePublicComments } from "./commentMapping.ts";

describe("public post comment helpers", () => {
  it("keeps hidden comments out of the public render payload", () => {
    const comments = mapVisiblePublicComments([
      {
        author_name: "Live Caller",
        body: "Put this on the file.",
        created_at: "2026-04-30T00:00:00.000Z",
        id: "comment-live",
        is_hidden: false
      },
      {
        author_name: "Hidden Caller",
        body: "Signal Control pulled this one.",
        created_at: "2026-04-30T00:01:00.000Z",
        id: "comment-hidden",
        is_hidden: true
      }
    ]);

    assert.deepEqual(comments, [
      {
        authorName: "Live Caller",
        body: "Put this on the file.",
        createdAt: "2026-04-30T00:00:00.000Z",
        id: "comment-live"
      }
    ]);
  });
});
