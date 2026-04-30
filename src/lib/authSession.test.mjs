import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAccessTokenMaxAge, getRefreshTokenMaxAge } from "./authSession.ts";

describe("auth session cookie helpers", () => {
  it("uses Supabase token expiry when it is valid", () => {
    assert.equal(getAccessTokenMaxAge(1234), 1234);
  });

  it("falls back to a bounded one-hour access cookie", () => {
    assert.equal(getAccessTokenMaxAge(undefined), 3600);
    assert.equal(getAccessTokenMaxAge(-1), 60);
  });

  it("keeps refresh cookies longer than access cookies", () => {
    assert.equal(getRefreshTokenMaxAge(), 2592000);
  });
});
