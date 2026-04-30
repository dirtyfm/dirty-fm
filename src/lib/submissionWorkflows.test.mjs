import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cleanAdminNotes,
  createDirtyNewsExcerpt,
  createDirtyNewsSlug,
  isContactSubmissionStatus,
  isPostSubmissionStatus
} from "./submissionWorkflows.ts";

describe("submission workflow helpers", () => {
  it("recognizes allowed contact and Dirty News submission statuses", () => {
    assert.equal(isContactSubmissionStatus("read_on_air"), true);
    assert.equal(isContactSubmissionStatus("published"), false);
    assert.equal(isPostSubmissionStatus("published"), true);
    assert.equal(isPostSubmissionStatus("read_on_air"), false);
  });

  it("normalizes admin notes and post publishing fields", () => {
    assert.equal(cleanAdminNotes("  Keep this for air.  "), "Keep this for air.");
    assert.equal(cleanAdminNotes("   "), null);
    assert.equal(
      createDirtyNewsSlug("Machine Clipboard!!!", "123e4567-e89b-12d3-a456-426614174000"),
      "machine-clipboard-123e4567"
    );
    assert.equal(createDirtyNewsExcerpt("A ".repeat(200)).length, 240);
  });
});
