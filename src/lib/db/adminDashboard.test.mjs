import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getExactCount, mapCommentsToPostTitles } from "./adminDashboardUtils.ts";

describe("admin dashboard helpers", () => {
  it("normalizes missing exact counts to zero", () => {
    assert.equal(getExactCount(7), 7);
    assert.equal(getExactCount(null), 0);
  });

  it("maps recent comments to their post file labels", () => {
    const mapped = mapCommentsToPostTitles(
      [{ post_id: "post-1" }, { post_id: "post-404" }],
      [{ id: "post-1", slug: "dirty-file", title: "Dirty File" }]
    );

    assert.deepEqual(mapped, [
      { postSlug: "dirty-file", postTitle: "Dirty File" },
      { postSlug: null, postTitle: "Unknown dirty file" }
    ]);
  });
});
