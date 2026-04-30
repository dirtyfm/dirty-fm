import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateContactSubmission } from "../contentValidation.ts";
import { createKvContactSubmissionRecord } from "./contactSubmissionCore.ts";

const validContact = {
  attachmentUrl: "https://example.com/static",
  canReadOnAir: true,
  email: "caller@example.com",
  message: "This is enough usable static to make Signal Control care.",
  name: "Static Caller",
  subject: "A useful piece of noise",
  submissionType: "Open Mic Rant"
};

describe("KV contact submission records", () => {
  it("creates a pending Signal Control record for valid contact input", () => {
    const validated = validateContactSubmission(validContact);
    assert.equal(validated.ok, true);

    const record = createKvContactSubmissionRecord(
      validated.data,
      "contact-test",
      "2026-04-30T12:00:00.000Z"
    );

    assert.deepEqual(record, {
      admin_notes: null,
      attachment_url: "https://example.com/static",
      can_read_on_air: true,
      created_at: "2026-04-30T12:00:00.000Z",
      email: "caller@example.com",
      id: "contact-test",
      message: "This is enough usable static to make Signal Control care.",
      name: "Static Caller",
      reviewed_at: null,
      reviewed_by: null,
      status: "pending",
      subject: "A useful piece of noise",
      submission_type: "Open Mic Rant",
      updated_at: "2026-04-30T12:00:00.000Z"
    });
  });

  it("keeps invalid public contact input out of KV record creation", () => {
    const validated = validateContactSubmission({
      ...validContact,
      email: "not-email",
      message: "too short"
    });

    assert.equal(validated.ok, false);
    assert.match(validated.errors.email, /real email/);
    assert.match(validated.errors.message, /20 characters/);
  });
});
