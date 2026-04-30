import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDirtyNewsCategories,
  getPostBySlug,
  getPublishedPosts,
  getPublishedPostsByCategory
} from "./posts.ts";

describe("Dirty News post helpers", () => {
  it("only exposes published posts", () => {
    const posts = getPublishedPosts();

    assert.ok(posts.length > 0);
    assert.equal(
      posts.some((post) => post.status !== "published"),
      false
    );
    assert.equal(getPostBySlug("draft-file-the-public-does-not-get"), null);
  });

  it("resolves known slugs and rejects unknown slugs", () => {
    assert.equal(
      getPostBySlug("machine-found-another-clipboard")?.id,
      "dn-001"
    );
    assert.equal(getPostBySlug("unknown-static-burst"), null);
  });

  it("filters published posts by category", () => {
    const category = "Open Mic";
    const posts = getPublishedPostsByCategory(category);

    assert.deepEqual(getDirtyNewsCategories().includes(category), true);
    assert.ok(posts.length > 0);
    assert.equal(posts.every((post) => post.category === category), true);
  });
});
