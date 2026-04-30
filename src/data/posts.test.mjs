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

  it("exposes archived posts as published Dirty News files", () => {
    const post = getPostBySlug("tales-from-the-drunk-tank");

    assert.ok(post);
    assert.equal(post.id, "blog-post-757562674475278705");
    assert.equal(post.title, "Tales From The Drunk Tank");
    assert.equal(post.author, "Veloschka Raptore");
    assert.equal(post.publishedAt, "2017-06-06T00:00:00.000Z");
    assert.equal(post.status, "published");
    assert.equal(post.category, "Dirty News");
  });

  it("preserves archive metadata without inventing missing comments", () => {
    const post = getPostBySlug("7-reasons-not-to-get-married-young");

    assert.ok(post?.archive);
    assert.equal(post.archive.legacyUrl, "http://www.dirtyfm.com/dirtynews/7-reasons-not-to-get-married-young");
    assert.equal(post.archive.sourceFile, "Blog Posts.html");
    assert.equal(post.archive.commentCountOriginal, 5);
    assert.equal(post.archive.comments.length, 0);
    assert.ok(post.archive.bodyText.includes("BY: Drift & Dustin"));
    assert.ok(post.archive.bodyHtmlPreserved.includes("BY: Drift &amp; Dustin"));
    assert.ok(post.body.join("\n\n").includes("BY: Drift & Dustin"));
  });
});
