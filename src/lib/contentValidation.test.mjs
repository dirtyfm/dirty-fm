import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  postSubmissionCategories,
  validateComment,
  validateContactSubmission,
  validatePostSubmission
} from "./contentValidation.ts";

const validContact = {
  attachmentUrl: "https://example.com/static",
  canReadOnAir: true,
  email: "CALLER@EXAMPLE.COM",
  message: "This is enough usable static to make Signal Control care.",
  name: " Static Caller ",
  subject: "A useful piece of noise",
  submissionType: "Open Mic Rant"
};

describe("server-side content validation", () => {
  it("normalizes valid contact submissions for database insert", () => {
    const result = validateContactSubmission(validContact);

    assert.equal(result.ok, true);
    assert.equal(result.data.email, "caller@example.com");
    assert.equal(result.data.name, "Static Caller");
    assert.equal(result.data.attachmentUrl, "https://example.com/static");
  });

  it("rejects status-shaped public contact submission tricks by ignoring them", () => {
    const result = validateContactSubmission({
      ...validContact,
      status: "approved"
    });

    assert.equal(result.ok, true);
    assert.equal("status" in result.data, false);
  });

  it("rejects malformed post submissions", () => {
    const result = validatePostSubmission({
      body: "short",
      category: "Secret Publish Button",
      email: "not-email",
      name: "",
      sourceUrl: "javascript:alert(1)",
      title: "No"
    });

    assert.equal(result.ok, false);
    assert.match(result.errors.body, /80 characters/);
    assert.match(result.errors.category, /DirtyFM/);
    assert.match(result.errors.email, /real email/);
    assert.match(result.errors.sourceUrl, /http or https/);
    assert.match(result.errors.title, /6 characters/);
  });

  it("accepts visible-by-default comment input without moderation fields", () => {
    const result = validateComment({
      authorEmail: "",
      authorName: "Wire Caller",
      body: "Let the dirty signal through.",
      postId: "123e4567-e89b-12d3-a456-426614174000"
    });

    assert.equal(result.ok, true);
    assert.equal(result.data.authorEmail, undefined);
    assert.equal("isHidden" in result.data, false);
  });

  it("rejects comments that blow past the public length limit", () => {
    const result = validateComment({
      authorName: "Wire Caller",
      body: "x".repeat(4001),
      postId: "123e4567-e89b-12d3-a456-426614174000"
    });

    assert.equal(result.ok, false);
    assert.match(result.errors.body, /4000 characters/);
  });

  it("rejects public form fields above server-side max lengths instead of silently truncating", () => {
    const contact = validateContactSubmission({
      ...validContact,
      message: "x".repeat(6001),
      name: "x".repeat(121),
      subject: "x".repeat(161)
    });
    const post = validatePostSubmission({
      body: "x".repeat(20001),
      category: "Dirty News",
      email: "caller@example.com",
      name: "Caller",
      title: "x".repeat(181)
    });

    assert.equal(contact.ok, false);
    assert.match(contact.errors.message, /6000 characters/);
    assert.match(contact.errors.name, /120 characters/);
    assert.match(contact.errors.subject, /160 characters/);
    assert.equal(post.ok, false);
    assert.match(post.errors.body, /20000 characters/);
    assert.match(post.errors.title, /180 characters/);
  });

  it("preserves script-looking comment text as plain submitted text", () => {
    const result = validateComment({
      authorName: "Wire Caller",
      body: "<script>alert('static')</script>",
      postId: "123e4567-e89b-12d3-a456-426614174000"
    });

    assert.equal(result.ok, true);
    assert.equal(result.data.body, "<script>alert('static')</script>");
  });

  it("keeps post submission categories aligned with DirtyFM buckets", () => {
    assert.deepEqual(postSubmissionCategories, [
      "Dirty News",
      "Rants",
      "Prank Calls",
      "The Drift Files",
      "Fuck the Machine",
      "Open Mic",
      "Video Drops",
      "Public Access Hell",
      "Government Bullshit",
      "Random Fucking Bullshit"
    ]);
  });
});
