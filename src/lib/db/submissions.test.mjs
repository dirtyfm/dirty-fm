import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createComment, createContactSubmission, createPostSubmission } from "./submissions.ts";

function createInsertSpy() {
  const calls = [];

  return {
    calls,
    client: {
      from(table) {
        return {
          insert(payload) {
            calls.push({ payload, table });

            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: { created_at: "2026-04-30T00:00:00.000Z", id: "submission-id" },
                      error: null
                    });
                  }
                };
              }
            };
          }
        };
      }
    }
  };
}

describe("public submission inserts", () => {
  it("forces contact submissions to pending even if the caller sends status-shaped input", async () => {
    const spy = createInsertSpy();
    const result = await createContactSubmission(spy.client, {
      attachmentUrl: "https://example.com/static",
      canReadOnAir: true,
      email: "caller@example.com",
      message: "This is enough usable static for the intake desk.",
      name: "Caller",
      status: "approved",
      subject: "Signal",
      submissionType: "Open Mic Rant"
    });

    assert.equal(result.ok, true);
    assert.equal(spy.calls[0].table, "contact_submissions");
    assert.equal(spy.calls[0].payload.status, "pending");
  });

  it("forces Dirty News submissions to pending and never inserts into posts", async () => {
    const spy = createInsertSpy();
    const result = await createPostSubmission(spy.client, {
      body: "This dirty news lead has enough body copy to survive server validation and land in the approval queue.",
      category: "Dirty News",
      email: "caller@example.com",
      name: "Caller",
      sourceUrl: "https://example.com/source",
      status: "published",
      title: "A Pending Dirty News File"
    });

    assert.equal(result.ok, true);
    assert.equal(spy.calls.length, 1);
    assert.equal(spy.calls[0].table, "post_submissions");
    assert.equal(spy.calls[0].payload.status, "pending");
  });

  it("creates comments as live public comments without accepting hidden flags", async () => {
    const spy = createInsertSpy();
    const result = await createComment(spy.client, {
      authorEmail: "",
      authorName: "Caller",
      body: "This comment goes live right away.",
      is_hidden: true,
      postId: "123e4567-e89b-12d3-a456-426614174000"
    });

    assert.equal(result.ok, true);
    assert.equal(spy.calls[0].table, "comments");
    assert.equal(spy.calls[0].payload.author_email, null);
    assert.equal("is_hidden" in spy.calls[0].payload, false);
  });

  it("returns a generic public error when database inserts fail", async () => {
    const client = {
      from() {
        return {
          insert() {
            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: null,
                      error: { message: "relation contact_submissions leaked detail" }
                    });
                  }
                };
              }
            };
          }
        };
      }
    };

    const result = await createContactSubmission(client, {
      attachmentUrl: "https://example.com/static",
      canReadOnAir: true,
      email: "caller@example.com",
      message: "This is enough usable static for the intake desk.",
      name: "Caller",
      subject: "Signal",
      submissionType: "Open Mic Rant"
    });

    assert.equal(result.ok, false);
    assert.equal(result.errors.database, "Signal Control could not log that file.");
  });
});
