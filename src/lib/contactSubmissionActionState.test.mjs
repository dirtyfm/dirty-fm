import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createContactSubmissionFailureState,
  logContactSubmissionFailure
} from "./contactSubmissionActionState.ts";

describe("contact submission action state helpers", () => {
  it("returns a safe public storage failure without leaking server details", () => {
    assert.deepEqual(createContactSubmissionFailureState(), {
      errors: {
        database: "Signal Control could not log that signal. Try again in a minute."
      },
      ok: false
    });
  });

  it("logs the backend and server-side error details for operators", () => {
    const originalError = console.error;
    const calls = [];
    console.error = (...args) => calls.push(args);

    try {
      const error = new Error("Cloudflare said no");
      logContactSubmissionFailure("cloudflare-kv", error);
      assert.equal(calls.length, 1);
      assert.equal(calls[0][0], "Contact signal submission failed through cloudflare-kv.");
      assert.equal(calls[0][1], error);
    } finally {
      console.error = originalError;
    }
  });
});
