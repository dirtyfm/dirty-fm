import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDirtyNewsDraftFromContact,
  normalizeDirtyNewsCategory
} from "./contactToDirtyNews.ts";
import { validatePostSubmission } from "./contentValidation.ts";

const contact = {
  attachment_url: "https://example.com/source-wire",
  can_read_on_air: false,
  email: "caller@example.com",
  id: "contact-123",
  message: "This tip came through the busted contact wire with enough weird detail to become a file.",
  name: "Static Caller",
  subject: "Noise From the Back Room",
  submission_type: "Open Mic Rant"
};

describe("contact signal to Dirty News draft mapping", () => {
  it("maps a contact signal into a valid pending Dirty News submission shape", () => {
    const draft = createDirtyNewsDraftFromContact(contact, "Government Bullshit");
    const validated = validatePostSubmission(draft);

    assert.equal(validated.ok, true);
    assert.equal(draft.name, "Static Caller");
    assert.equal(draft.email, "caller@example.com");
    assert.equal(draft.title, "Noise From the Back Room");
    assert.equal(draft.category, "Government Bullshit");
    assert.equal(draft.sourceUrl, "https://example.com/source-wire");
    assert.match(draft.adminNotes, /Converted from contact signal contact-123/);
    assert.match(draft.adminNotes, /Read-on-air consent: no/);
  });

  it("keeps email out of public-facing draft fields", () => {
    const draft = createDirtyNewsDraftFromContact(contact, "Open Mic");

    assert.equal(draft.title.includes(contact.email), false);
    assert.equal(draft.body.includes(contact.email), false);
    assert.equal(draft.name.includes(contact.email), false);
    assert.equal(draft.adminNotes.includes(contact.email), false);
  });

  it("falls back to Open Mic when the admin category is invalid", () => {
    assert.equal(normalizeDirtyNewsCategory("Secret Wire"), "Open Mic");
  });
});
