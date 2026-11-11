import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getPublishedPosts } from "../data/posts.ts";
import { createKvComment, getKvVisibleCommentsForPost } from "./kv/comments.ts";
import { convertKvContactToPostSubmission, createKvContactSubmission } from "./kv/contactSubmissions.ts";
import { createKvPostSubmission } from "./kv/postSubmissions.ts";
import { mergePublicDirtyNewsPosts } from "./db/publicPostsCore.ts";
import { __test, readJsonKey, writeJsonKey } from "./kv/store.ts";
import { keyFor, keys } from "./kv/keys.ts";
import { getValidatedDirtyfmContentBackend } from "./runtimeConfigCore.ts";
import { getKvAdminDashboardData } from "./kv/dashboard.ts";
import { deleteKvPost, getKvPublicPosts, publishKvPostSubmission, upsertKvPost } from "./kv/posts.ts";
import { getPublishedVideoAttachments, getVideoSource, withVideoAttachmentFooter } from "./videoAttachments.ts";

const envKeys = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_KV_NAMESPACE_ID",
  "DIRTYFM_AUTH_MODE",
  "DIRTYFM_CONTENT_BACKEND",
  "DIRTYFM_OPERATOR_EMAIL",
  "DIRTYFM_OPERATOR_PASSPHRASE_HASH",
  "DIRTYFM_SESSION_SECRET",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VERCEL"
];

const originalEnv = new Map(envKeys.map((key) => [key, process.env[key]]));

function restoreEnv() {
  for (const key of envKeys) {
    const original = originalEnv.get(key);

    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

function forceKvLocalAuthWithoutSupabase() {
  process.env.DIRTYFM_AUTH_MODE = "local";
  process.env.DIRTYFM_CONTENT_BACKEND = "cloudflare-kv";
  process.env.DIRTYFM_OPERATOR_EMAIL = "operator@dirtyfm.test";
  process.env.DIRTYFM_OPERATOR_PASSPHRASE_HASH = "hash-for-test";
  process.env.DIRTYFM_SESSION_SECRET = "test-session-secret-at-least-long-enough";
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.VERCEL;
}

const validDirtyNewsSubmission = {
  body: "This Dirty News public submission has enough body copy to land in Signal Control for review, but it must never publish itself onto the public wire.",
  category: "Dirty News",
  email: "caller@example.com",
  name: "Static Caller",
  sourceUrl: "https://example.com/source",
  title: "Pending Public Dirty News File"
};

const validContactSubmission = {
  attachmentUrl: "https://example.com/static",
  canReadOnAir: true,
  email: "caller@example.com",
  message: "This is a contact intake record with enough static for Signal Control to review later.",
  name: "Static Caller",
  subject: "Useful noise for the desk",
  submissionType: "Open Mic Rant"
};

function kvPost(overrides = {}) {
  const publishedAt = "2026-04-30T12:00:00.000Z";

  return {
    author: "Signal Control",
    body: "KV paragraph one.\n\nKV paragraph two.",
    category: "Dirty News",
    created_at: publishedAt,
    excerpt: "KV public post excerpt.",
    featured_image_url: null,
    id: `post-${crypto.randomUUID()}`,
    published_at: publishedAt,
    slug: `kv-public-${crypto.randomUUID()}`,
    status: "published",
    title: "KV Public Dirty News File",
    updated_at: publishedAt,
    ...overrides
  };
}

describe("active public safety path smoke tests", () => {
  beforeEach(() => {
    forceKvLocalAuthWithoutSupabase();
    __test.resetMemoryKv();
  });

  afterEach(() => {
    __test.resetMemoryKv();
    restoreEnv();
  });

  const reviewInput = { ...validDirtyNewsSubmission, author: "DirtyFM Desk" };

  it("plays a submitted contact clip only while its reviewed post is public", async () => {
    const contact = await createKvContactSubmission({
      ...validContactSubmission,
      attachmentUrl: "https://youtu.be/M7lc1UVf-VE",
      submissionType: "Video Clip"
    });
    const { submission } = await convertKvContactToPostSubmission(contact.data.id, "Video Drops");
    const input = {
      ...reviewInput,
      body: submission.body,
      category: submission.category,
      sourceUrl: submission.source_url,
      title: submission.title
    };
    const { post } = await publishKvPostSubmission(submission.id, "draft", input, "operator");
    assert.deepEqual(getPublishedVideoAttachments(await getKvPublicPosts(), []), []);

    const form = new FormData();
    form.set("id", post.id);
    form.set("status", "published");
    await upsertKvPost(form);
    const [clip] = getPublishedVideoAttachments(await getKvPublicPosts(), []);
    assert.equal(clip.title, submission.title);
    assert.equal(clip.source.src, "https://www.youtube.com/embed/M7lc1UVf-VE");

    form.set("source_url", "");
    await upsertKvPost(form);
    assert.deepEqual(getPublishedVideoAttachments(await getKvPublicPosts(), []), []);
  });

  it("deduplicates legacy attachment links and excludes scheduled clips", async () => {
    const legacy = kvPost({
      body: "Article body.\n\nAttachment/source wire: https://www.youtube.com/shorts/dQw4w9WgXcQ"
    });
    const duplicate = kvPost({ review_source_url: "https://youtu.be/dQw4w9WgXcQ" });
    const scheduled = kvPost({ review_source_url: "https://vimeo.com/76979871", published_at: "2099-01-01T00:00:00Z" });
    for (const post of [legacy, duplicate, scheduled]) await writeJsonKey(keyFor("posts", post.id), post);
    await writeJsonKey(keys.postsIndex, [legacy.id, duplicate.id, scheduled.id]);

    const published = await getKvPublicPosts();
    const clips = getPublishedVideoAttachments(published, []);
    assert.equal(clips.length, 1);
    assert.equal(clips[0].source.key, "youtube:dQw4w9WgXcQ");
    assert.deepEqual(getPublishedVideoAttachments(published, clips), []);
  });

  it("builds playable sources for supported URLs and rejects arbitrary embeds", () => {
    assert.equal(getVideoSource("https://www.youtube.com/live/M7lc1UVf-VE")?.key, "youtube:M7lc1UVf-VE");
    assert.equal(getVideoSource("https://vimeo.com/76979871/a5e2f0")?.src, "https://player.vimeo.com/video/76979871?h=a5e2f0");
    const file = "https://files.example.com/clip.MP4?signature=abc";
    assert.equal(getVideoSource(file)?.src, file);
    assert.equal(getVideoSource(file)?.kind, "file");
    for (const url of [
      "https://www.youtube.com.evil.example/watch?v=M7lc1UVf-VE",
      "https://www.youtube.com/playlist?list=abc",
      "https://vimeo.com/account",
      "https://user:pass@files.example.com/clip.mp4",
      "http://files.example.com/clip.mp4",
      "javascript:alert(1)"
    ]) assert.equal(getVideoSource(url), null);

    const body = "A public article with an attached clip.";
    const withVideo = withVideoAttachmentFooter(body, file);
    assert.match(withVideo, /Attachment\/source wire: https:\/\/files\.example\.com/);
    assert.equal(withVideoAttachmentFooter(withVideo), body);
  });

  it("moves reviewed submissions out of Pending and keeps one post after retries", async () => {
    const submission = await createKvPostSubmission(validDirtyNewsSubmission);
    const id = submission.data.id;
    await Promise.all([
      publishKvPostSubmission(id, "publish", reviewInput, "operator"),
      publishKvPostSubmission(id, "publish", reviewInput, "operator"),
      publishKvPostSubmission(id, "draft", reviewInput, "operator")
    ]);

    const retry = await publishKvPostSubmission(id, "publish", reviewInput, "operator");
    const dashboard = await getKvAdminDashboardData();
    assert.equal(retry.alreadyReviewed, true);
    assert.equal(dashboard.postSubmissions.length, 0);
    assert.equal(dashboard.reviewedSubmissions[0].status, "published");
    assert.equal(dashboard.reviewedSubmissions[0].postId, retry.post.id);
    assert.equal(dashboard.posts.length, 1);
    assert.equal((await getKvPublicPosts()).length, 1);
  });

  it("keeps different same-title submissions separate and does not overwrite their inventory", async () => {
    const first = await createKvPostSubmission(validDirtyNewsSubmission);
    const second = await createKvPostSubmission(validDirtyNewsSubmission);
    await Promise.all([first, second].map((item) =>
      publishKvPostSubmission(item.data.id, "publish", reviewInput, "operator")
    ));
    const posts = await getKvPublicPosts();
    assert.equal(posts.length, 2);
    assert.equal(new Set(posts.map((post) => post.slug)).size, 2);
  });

  it("promotes a saved draft, preserves its identity, and blocks stale republishing after deletion", async () => {
    const submission = await createKvPostSubmission(validDirtyNewsSubmission);
    const id = submission.data.id;
    const { post } = await publishKvPostSubmission(id, "draft", reviewInput, "operator");
    assert.equal((await getKvAdminDashboardData()).reviewedSubmissions[0].status, "draft");
    assert.deepEqual(await getKvPublicPosts(), []);

    const form = new FormData();
    form.set("id", post.id);
    form.set("status", "published");
    await upsertKvPost(form);
    assert.equal((await getKvPublicPosts())[0].id, post.id);
    assert.equal((await getKvPublicPosts())[0].slug, post.slug);

    form.set("status", "archived");
    await upsertKvPost(form);
    assert.deepEqual(await getKvPublicPosts(), []);
    await deleteKvPost(post.id);
    const retry = await publishKvPostSubmission(id, "publish", reviewInput, "operator");
    assert.equal(retry.alreadyReviewed, true);
    assert.equal(retry.post, null);
    assert.equal((await getKvAdminDashboardData()).reviewedSubmissions[0].status, "archived");
    assert.deepEqual(await getKvPublicPosts(), []);
  });

  it("uses one request ID when a new post from Live Files is submitted twice", async () => {
    const form = new FormData();
    form.set("request_id", `file-${crypto.randomUUID()}`);
    form.set("title", reviewInput.title);
    form.set("body", reviewInput.body);
    form.set("status", "published");
    const [first, second] = await Promise.all([upsertKvPost(form), upsertKvPost(form)]);
    assert.equal(first.id, second.id);
    assert.equal((await getKvPublicPosts()).length, 1);
  });

  it("keeps a legacy processed submission out of the queue and never republishes it", async () => {
    const submission = await createKvPostSubmission(validDirtyNewsSubmission);
    const key = keyFor("post-submissions", submission.data.id);
    const original = await readJsonKey(key, null);
    await writeJsonKey(key, { ...original, status: "published" });
    await publishKvPostSubmission(submission.data.id, "publish", reviewInput, "operator");
    assert.deepEqual(await getKvPublicPosts(), []);
    const dashboard = await getKvAdminDashboardData();
    assert.deepEqual(dashboard.postSubmissions, []);
    assert.equal(dashboard.reviewedSubmissions[0].status, "published");
  });

  it("converts an incoming signal into one review file even when requested twice", async () => {
    const contact = await createKvContactSubmission(validContactSubmission);
    const [first, second] = await Promise.all([
      convertKvContactToPostSubmission(contact.data.id, "Open Mic"),
      convertKvContactToPostSubmission(contact.data.id, "Open Mic")
    ]);
    assert.equal(first.submission.id, second.submission.id);
    const dashboard = await getKvAdminDashboardData();
    assert.equal(dashboard.postSubmissions.length, 1);
    assert.equal(dashboard.contacts[0].reviewStatus, "pending");
    assert.equal(dashboard.counts.contactSubmissions, 0);
  });

  it("shows only the canonical card when legacy posts share a public URL", () => {
    const older = { ...getPublishedPosts()[0], id: "legacy-duplicate" };
    const current = { ...older, id: "legacy-current" };
    assert.deepEqual(mergePublicDirtyNewsPosts([current, older], [older]), [current]);
  });

  it("creates Dirty News public submissions as pending KV submissions, not published posts", async () => {
    const result = await createKvPostSubmission({
      ...validDirtyNewsSubmission,
      published_at: "2026-04-30T00:00:00.000Z",
      status: "published"
    });

    assert.equal(result.ok, true);

    const submission = await readJsonKey(
      keyFor("post-submissions", result.data.id),
      null
    );

    assert.equal(submission.status, "pending");
    assert.equal(submission.title, "Pending Public Dirty News File");
    assert.deepEqual(await readJsonKey(keys.postSubmissionsIndex, []), [
      result.data.id
    ]);
    assert.deepEqual(await readJsonKey(keys.postsIndex, []), []);
  });

  it("stores contact submissions as intake records, not public content", async () => {
    const result = await createKvContactSubmission({
      ...validContactSubmission,
      body: "Do not turn this into a post.",
      status: "published",
      title: "Not a public post"
    });

    assert.equal(result.ok, true);

    const contact = await readJsonKey(
      keyFor("contact-submissions", result.data.id),
      null
    );

    assert.equal(contact.status, "pending");
    assert.equal(contact.subject, "Useful noise for the desk");
    assert.equal(contact.message, validContactSubmission.message);
    assert.deepEqual(await readJsonKey(keys.contactIndex, []), [result.data.id]);
    assert.deepEqual(await readJsonKey(keys.postSubmissionsIndex, []), []);
    assert.deepEqual(await readJsonKey(keys.postsIndex, []), []);
  });

  it("keeps submitted comment text plain before React escapes it for public rendering", async () => {
    const post = kvPost({
      id: "post-route-comment",
      slug: "route-comment-plain-text"
    });
    await writeJsonKey(keyFor("posts", post.id), post);
    await writeJsonKey(keys.postsIndex, [post.id]);

    const comment = await createKvComment({
      authorName: "<img src=x onerror=alert('name')>",
      body: "<script>alert('comment')</script>\n<img src=x onerror=alert('body')>",
      postId: post.id
    });

    assert.equal(comment.ok, true);

    const [publicComment] = await getKvVisibleCommentsForPost(post.id);
    const html = renderToStaticMarkup(
      React.createElement(
        "article",
        null,
        React.createElement("h3", null, publicComment.authorName),
        React.createElement("p", null, publicComment.body)
      )
    );

    assert.equal(html.includes("<script>"), false);
    assert.equal(html.includes("<img src=x"), false);
    assert.match(html, /&lt;script&gt;alert/);
    assert.match(html, /&lt;img src=x/);
  });

  it("merges static archive posts with KV published posts without duplicate slugs", async () => {
    const staticPost = getPublishedPosts()[0];
    const overridingKvPost = kvPost({
      id: "post-static-override",
      published_at: "2026-04-30T13:00:00.000Z",
      slug: staticPost.slug,
      title: "KV version of static slug"
    });
    const uniqueKvPost = kvPost({
      id: "post-unique-kv",
      published_at: "2026-04-30T14:00:00.000Z",
      slug: "unique-kv-public-file",
      title: "Unique KV public file"
    });

    await writeJsonKey(keyFor("posts", overridingKvPost.id), overridingKvPost);
    await writeJsonKey(keyFor("posts", uniqueKvPost.id), uniqueKvPost);
    await writeJsonKey(keys.postsIndex, [overridingKvPost.id, uniqueKvPost.id]);

    const kvPosts = [
      {
        author: overridingKvPost.author,
        body: overridingKvPost.body.split(/\n{2,}/),
        category: overridingKvPost.category,
        excerpt: overridingKvPost.excerpt,
        id: overridingKvPost.id,
        publishedAt: overridingKvPost.published_at,
        slug: overridingKvPost.slug,
        status: "published",
        title: overridingKvPost.title
      },
      {
        author: uniqueKvPost.author,
        body: uniqueKvPost.body.split(/\n{2,}/),
        category: uniqueKvPost.category,
        excerpt: uniqueKvPost.excerpt,
        id: uniqueKvPost.id,
        publishedAt: uniqueKvPost.published_at,
        slug: uniqueKvPost.slug,
        status: "published",
        title: uniqueKvPost.title
      }
    ];
    const posts = mergePublicDirtyNewsPosts(kvPosts, getPublishedPosts());
    const matchingStaticSlug = posts.filter((post) => post.slug === staticPost.slug);

    assert.equal(matchingStaticSlug.length, 1);
    assert.equal(matchingStaticSlug[0].title, "KV version of static slug");
    assert.equal(
      posts.some((post) => post.slug === "unique-kv-public-file"),
      true
    );
    assert.equal(
      posts.some((post) => post.id !== overridingKvPost.id && post.archive),
      true
    );
  });

  it("keeps Cloudflare KV public-read mode selectable without Supabase environment variables", () => {
    const post = kvPost({
      id: "post-no-supabase-env",
      slug: "kv-public-without-supabase",
      title: "KV public read without Supabase"
    });

    assert.equal(getValidatedDirtyfmContentBackend(), "cloudflare-kv");
    assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL, undefined);
    assert.equal(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, undefined);
    assert.equal(
      mergePublicDirtyNewsPosts(
        [
          {
            author: post.author,
            body: post.body.split(/\n{2,}/),
            category: post.category,
            excerpt: post.excerpt,
            id: post.id,
            publishedAt: post.published_at,
            slug: post.slug,
            status: "published",
            title: post.title
          }
        ],
        getPublishedPosts()
      ).some((item) => item.slug === "kv-public-without-supabase"),
      true
    );
  });
});
