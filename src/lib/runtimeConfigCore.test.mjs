import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getValidatedDirtyfmAuthMode,
  parseDirtyfmContentBackend,
  validateDirtyfmRuntimeConfig
} from "./runtimeConfigCore.ts";

describe("DirtyFM runtime config", () => {
  it("rejects unrecognized auth mode values", () => {
    assert.throws(
      () => getValidatedDirtyfmAuthMode({ DIRTYFM_AUTH_MODE: "password" }),
      /Invalid DIRTYFM_AUTH_MODE value "password"\. Expected one of: local \| supabase\./
    );
  });

  it("rejects unrecognized content backend values", () => {
    assert.throws(
      () =>
        parseDirtyfmContentBackend({
          DIRTYFM_AUTH_MODE: "local",
          DIRTYFM_CONTENT_BACKEND: "filesystem"
        }),
      /Invalid DIRTYFM_CONTENT_BACKEND value "filesystem"\. Expected one of: cloudflare-kv \| supabase\./
    );
  });

  it("keeps Supabase selectable", () => {
    assert.deepEqual(
      validateDirtyfmRuntimeConfig({
        DIRTYFM_AUTH_MODE: "supabase",
        DIRTYFM_CONTENT_BACKEND: "supabase",
        VERCEL: "1"
      }),
      {
        authMode: "supabase",
        contentBackend: "supabase"
      }
    );
  });

  it("requires explicit modes in production-like runtimes", () => {
    assert.throws(
      () => validateDirtyfmRuntimeConfig({ VERCEL: "1" }),
      /Missing DIRTYFM_AUTH_MODE in production\/Vercel runtime/
    );
  });

  it("requires local auth credentials when local auth is selected", () => {
    assert.throws(
      () =>
        validateDirtyfmRuntimeConfig({
          DIRTYFM_AUTH_MODE: "local",
          DIRTYFM_CONTENT_BACKEND: "supabase"
        }),
      /Missing required environment variables for DIRTYFM_AUTH_MODE=local: DIRTYFM_OPERATOR_EMAIL, DIRTYFM_OPERATOR_PASSPHRASE_HASH, DIRTYFM_SESSION_SECRET\./
    );
  });

  it("requires Cloudflare REST credentials for Cloudflare KV in Vercel production", () => {
    assert.throws(
      () =>
        validateDirtyfmRuntimeConfig({
          DIRTYFM_AUTH_MODE: "local",
          DIRTYFM_CONTENT_BACKEND: "cloudflare-kv",
          DIRTYFM_OPERATOR_EMAIL: "operator@example.com",
          DIRTYFM_OPERATOR_PASSPHRASE_HASH: "hash",
          DIRTYFM_SESSION_SECRET: "secret",
          VERCEL: "1"
        }),
      /Missing required Cloudflare KV REST environment variables for DIRTYFM_CONTENT_BACKEND=cloudflare-kv in production\/Vercel runtime: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, CLOUDFLARE_API_TOKEN\./
    );
  });

  it("preserves local development fallback behavior when production-like env is not selected", () => {
    assert.deepEqual(validateDirtyfmRuntimeConfig({}), {
      authMode: "supabase",
      contentBackend: "supabase"
    });
  });

  it("does not treat a plain local production build as Vercel production", () => {
    assert.deepEqual(validateDirtyfmRuntimeConfig({ NODE_ENV: "production" }), {
      authMode: "supabase",
      contentBackend: "supabase"
    });
  });
});
