import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createLocalPassphraseHash,
  createSignedLocalSession,
  readSignedLocalSession,
  verifyLocalPassphrase
} from "./localAuthCore.ts";

describe("local Signal Control auth core", () => {
  it("verifies only the matching operator passphrase", async () => {
    const hash = await createLocalPassphraseHash(
      "correct horse static",
      new Uint8Array(16).fill(7)
    );

    assert.equal(await verifyLocalPassphrase("correct horse static", hash), true);
    assert.equal(await verifyLocalPassphrase("wrong horse static", hash), false);
  });

  it("rejects signed sessions that were not signed with the same secret", async () => {
    const token = await createSignedLocalSession(
      { email: "operator@example.com", exp: 9999999999, role: "admin" },
      "first-secret"
    );

    assert.equal(
      (await readSignedLocalSession(token, "first-secret"))?.email,
      "operator@example.com"
    );
    assert.equal(await readSignedLocalSession(token, "second-secret"), null);
  });
});
