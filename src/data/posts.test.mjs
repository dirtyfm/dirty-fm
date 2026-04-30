import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDirtyNewsCategories,
  getPostBySlug,
  getPublishedPosts,
  getPublishedPostsByCategory
} from "./posts.ts";
import { dirtyfmArchivedPosts } from "./dirtyfmArchivedPosts.ts";

describe("Dirty News post helpers", () => {
  const removedSeededSlugs = [
    "machine-found-another-clipboard",
    "public-access-hell-has-better-standards",
    "open-mic-degeneracy-report-static-edition"
  ];

  it("only exposes published posts", () => {
    const posts = getPublishedPosts();

    assert.ok(posts.length > 0);
    assert.equal(
      posts.some((post) => post.status !== "published"),
      false
    );
    assert.equal(getPostBySlug("draft-file-the-public-does-not-get"), null);
  });

  it("rejects unknown slugs", () => {
    assert.equal(getPostBySlug("unknown-static-burst"), null);
  });

  it("does not expose removed seeded Dirty News posts", () => {
    for (const slug of removedSeededSlugs) {
      assert.equal(getPostBySlug(slug), null);
    }
  });

  it("resolves every published archived slug", () => {
    const archivedPublishedPosts = dirtyfmArchivedPosts.filter(
      (post) => post.status === "published"
    );

    assert.ok(archivedPublishedPosts.length > 0);

    for (const archivedPost of archivedPublishedPosts) {
      const post = getPostBySlug(archivedPost.slug);

      assert.ok(post, `expected archived slug to resolve: ${archivedPost.slug}`);
      assert.equal(post.id, archivedPost.legacyId);
      assert.equal(post.slug, archivedPost.slug);
      assert.equal(post.status, "published");
    }
  });

  it("preserves archived post titles exactly", () => {
    for (const archivedPost of dirtyfmArchivedPosts) {
      const post = getPostBySlug(archivedPost.slug);

      if (archivedPost.status !== "published") {
        assert.equal(post, null);
        continue;
      }

      assert.equal(post?.title, archivedPost.title);
    }
  });

  it("filters published posts by category", () => {
    const category = "Dirty News";
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

  it("derives archived article bodies mechanically from preserved body text", () => {
    const archivedPost = dirtyfmArchivedPosts.find(
      (post) => post.slug === "tales-from-the-drunk-tank"
    );
    const post = getPostBySlug("tales-from-the-drunk-tank");

    assert.ok(archivedPost);
    assert.ok(post?.archive);
    assert.deepEqual(
      post.body,
      archivedPost.bodyText
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    );
  });

  it("preserves known original spelling and grammar in archived bodies", () => {
    const post = getPostBySlug("the-current-state-of-rock-music");

    assert.ok(post?.archive);
    assert.ok(
      post.archive.bodyText.includes("Don't you think its time to take are music back?")
    );
    assert.ok(
      post.body.join("\n\n").includes("Don't you think its time to take are music back?")
    );
  });

  it("sorts published posts by published date descending", () => {
    const posts = getPublishedPosts();

    for (let index = 1; index < posts.length; index += 1) {
      assert.ok(
        new Date(posts[index - 1].publishedAt).getTime() >=
          new Date(posts[index].publishedAt).getTime(),
        `${posts[index - 1].slug} should not sort before ${posts[index].slug}`
      );
    }
  });
});
