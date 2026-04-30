import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyContactFormValues,
  hasContactValidationErrors,
  submissionTypes,
  validateContactForm
} from "./contactValidation.ts";

const validValues = {
  name: "Static Caller",
  email: "caller@example.com",
  subject: "A public access nightmare",
  submissionType: "Open Mic Rant",
  message: "This is enough usable static to make the form happy.",
  attachmentUrl: "https://example.com/clip",
  canReadOnAir: "yes"
};

describe("contact form validation", () => {
  it("rejects missing required fields", () => {
    const errors = validateContactForm(emptyContactFormValues);

    assert.deepEqual(Object.keys(errors).sort(), [
      "canReadOnAir",
      "email",
      "message",
      "name",
      "subject",
      "submissionType"
    ]);
    assert.equal(hasContactValidationErrors(errors), true);
  });

  it("accepts a valid submission shape", () => {
    const errors = validateContactForm(validValues);

    assert.deepEqual(errors, {});
    assert.equal(hasContactValidationErrors(errors), false);
  });

  it("rejects unsafe or malformed field values", () => {
    const errors = validateContactForm({
      ...validValues,
      email: "not-email",
      submissionType: "Secret Admin Publishing Button",
      message: "too short",
      attachmentUrl: "javascript:alert(1)",
      canReadOnAir: "maybe"
    });

    assert.match(errors.email ?? "", /real email/);
    assert.match(errors.submissionType ?? "", /bucket/);
    assert.match(errors.message ?? "", /20 characters/);
    assert.match(errors.attachmentUrl ?? "", /http or https/);
    assert.match(errors.canReadOnAir ?? "", /read on air/);
  });

  it("keeps the required submission buckets in the expected order", () => {
    assert.deepEqual(submissionTypes, [
      "Show Tip",
      "Open Mic Rant",
      "Guest Request",
      "Hate Mail",
      "Business / Booking",
      "Video Clip",
      "Technical Problem",
      "Other Bullshit"
    ]);
  });
});
