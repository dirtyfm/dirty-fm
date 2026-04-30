import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AdminAuthorizationError,
  assertAdminProfile,
  isAdminRole
} from "./authGuards.ts";

describe("admin auth guards", () => {
  it("accepts only real DirtyFM admin roles", () => {
    assert.equal(isAdminRole("admin"), true);
    assert.equal(isAdminRole("editor"), true);
    assert.equal(isAdminRole("subscriber"), false);
    assert.equal(isAdminRole(undefined), false);
  });

  it("returns authorized admin profiles", () => {
    const profile = { role: "admin", user_id: "user-1" };

    assert.deepEqual(assertAdminProfile(profile), profile);
  });

  it("throws when auth exists without admin clearance", () => {
    assert.throws(
      () => assertAdminProfile({ role: "subscriber", user_id: "user-1" }),
      AdminAuthorizationError
    );
    assert.throws(() => assertAdminProfile(null), AdminAuthorizationError);
  });
});
