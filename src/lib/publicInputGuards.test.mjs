import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  checkHoneypot,
  checkPublicRateLimit,
  getClientIp,
  resetPublicRateLimitForTests
} from "./publicInputGuards.ts";

describe("public input spam guards", () => {
  beforeEach(() => {
    resetPublicRateLimitForTests();
  });

  it("treats filled honeypots as spam", () => {
    assert.equal(checkHoneypot(""), false);
    assert.equal(checkHoneypot("   "), false);
    assert.equal(checkHoneypot("https://spam.example"), true);
  });

  it("uses forwarded IP headers for rate-limit keys", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 10.0.0.2",
      "x-real-ip": "198.51.100.4"
    });

    assert.equal(getClientIp(headers), "203.0.113.7");
  });

  it("blocks comment bursts after the configured public limit", () => {
    for (let index = 0; index < 6; index += 1) {
      assert.equal(checkPublicRateLimit("comment", "203.0.113.9", 1_000).ok, true);
    }

    const blocked = checkPublicRateLimit("comment", "203.0.113.9", 1_000);

    assert.equal(blocked.ok, false);
    assert.equal(blocked.retryAfterSeconds, 60);
  });
});
