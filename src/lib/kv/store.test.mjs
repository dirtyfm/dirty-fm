import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readJsonKey, writeJsonKey, deleteJsonKey, __test } from "./store.ts";

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

  it("uses the fallback when a read helper hits a storage error", async () => {
    const originalError = console.error;
    console.error = () => {};

    try {
      assert.deepEqual(
        await __test.readJsonKeyFromNamespace(
          {
            async delete() {},
            async get() {
              throw new Error("network down");
            },
            async put() {}
          },
          "content:settings:home",
          { title: "Fallback" }
        ),
        { title: "Fallback" }
      );
    } finally {
      console.error = originalError;
    }
  });
});

describe("Cloudflare KV REST adapter", () => {
  const env = {
    accountId: "account-123",
    apiToken: "token-abc",
    namespaceId: "namespace-456"
  };

  it("reads JSON records from the encoded KV value URL", async () => {
    const calls = [];
    const namespace = __test.createCloudflareKvRestNamespace(env, async (url, init) => {
      calls.push({ init, url });
      return new Response(JSON.stringify({ title: "Wire File" }), { status: 200 });
    });

    assert.deepEqual(await namespace.get("content:posts:index", "json"), {
      title: "Wire File"
    });
    assert.equal(
      calls[0].url,
      "https://api.cloudflare.com/client/v4/accounts/account-123/storage/kv/namespaces/namespace-456/values/content%3Aposts%3Aindex"
    );
    assert.equal(calls[0].init.headers.Authorization, "Bearer token-abc");
  });

  it("returns null for missing keys", async () => {
    const namespace = __test.createCloudflareKvRestNamespace(
      env,
      async () => new Response("missing", { status: 404 })
    );

    assert.equal(await namespace.get("content:missing", "json"), null);
  });

  it("writes plain values with auth and content type", async () => {
    const calls = [];
    const namespace = __test.createCloudflareKvRestNamespace(env, async (url, init) => {
      calls.push({ init, url });
      return new Response("ok", { status: 200 });
    });

    await namespace.put("content:settings:home", "{\"ok\":true}");

    assert.equal(calls[0].init.method, "PUT");
    assert.equal(calls[0].init.body, "{\"ok\":true}");
    assert.equal(calls[0].init.headers.Authorization, "Bearer token-abc");
    assert.equal(calls[0].init.headers["Content-Type"], "text/plain;charset=UTF-8");
  });

  it("throws clear errors for failed writes", async () => {
    const namespace = __test.createCloudflareKvRestNamespace(
      env,
      async () => new Response("bad token", { status: 403, statusText: "Forbidden" })
    );

    await assert.rejects(
      () => namespace.put("content:posts:index", "[]"),
      /Cloudflare KV write failed for content:posts:index: 403 Forbidden - bad token/
    );
  });

  it("keeps failed direct REST reads as errors for callers that need them", async () => {
    const namespace = __test.createCloudflareKvRestNamespace(
      env,
      async () => new Response("bad token", { status: 403, statusText: "Forbidden" })
    );

    await assert.rejects(
      () => namespace.get("content:settings:home", "json"),
      /Cloudflare KV read failed for content:settings:home: 403 Forbidden - bad token/
    );
  });
});
