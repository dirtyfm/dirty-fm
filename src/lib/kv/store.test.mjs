import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readJsonKey, writeJsonKey, deleteJsonKey } from "./store.ts";

describe("KV storage adapter fallback", () => {
  it("stores, reads, and deletes JSON records through the fallback namespace", async () => {
    const key = `test:kv:${crypto.randomUUID()}`;

    await writeJsonKey(key, { status: "published", title: "Static Test" });
    assert.deepEqual(await readJsonKey(key, null), {
      status: "published",
      title: "Static Test"
    });

    await deleteJsonKey(key);
    assert.equal(await readJsonKey(key, null), null);
  });
});
