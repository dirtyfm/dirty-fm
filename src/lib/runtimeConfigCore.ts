export type DirtyfmAuthMode = "local" | "supabase";
export type DirtyfmContentBackend = "cloudflare-kv" | "supabase";

type RuntimeEnv = Record<string, string | undefined>;

const AUTH_MODES = ["local", "supabase"] as const;
const CONTENT_BACKENDS = ["cloudflare-kv", "supabase"] as const;
const LOCAL_AUTH_ENV_VARS = [
  "DIRTYFM_OPERATOR_EMAIL",
  "DIRTYFM_OPERATOR_PASSPHRASE_HASH",
  "DIRTYFM_SESSION_SECRET"
] as const;
const CLOUDFLARE_KV_REST_ENV_VARS = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_KV_NAMESPACE_ID",
  "CLOUDFLARE_API_TOKEN"
] as const;

function readConfiguredValue(env: RuntimeEnv, name: string) {
  const value = env[name]?.trim();
  return value || undefined;
}

function expectedValues(values: readonly string[]) {
  return values.join(" | ");
}

function assertRecognizedValue<T extends string>(
  name: string,
  value: string,
  recognized: readonly T[]
): T {
  if (recognized.includes(value as T)) {
    return value as T;
  }

  throw new Error(
    `Invalid ${name} value "${value}". Expected one of: ${expectedValues(recognized)}.`
  );
}

function getMissingEnvVars(env: RuntimeEnv, names: readonly string[]) {
  return names.filter((name) => !readConfiguredValue(env, name));
}

export function isProductionLikeRuntime(env: RuntimeEnv = process.env) {
  return readConfiguredValue(env, "VERCEL") !== undefined;
}

export function parseDirtyfmAuthMode(env: RuntimeEnv = process.env): DirtyfmAuthMode {
  const configured = readConfiguredValue(env, "DIRTYFM_AUTH_MODE");

  if (configured) {
    return assertRecognizedValue("DIRTYFM_AUTH_MODE", configured, AUTH_MODES);
  }

  if (isProductionLikeRuntime(env)) {
    throw new Error(
      `Missing DIRTYFM_AUTH_MODE in production/Vercel runtime. Set DIRTYFM_AUTH_MODE to one of: ${expectedValues(AUTH_MODES)}.`
    );
  }

  // Legacy local fallback only. Vercel production must set DIRTYFM_AUTH_MODE explicitly.
  return "supabase";
}

export function parseDirtyfmContentBackend(
  env: RuntimeEnv = process.env,
  authMode = parseDirtyfmAuthMode(env)
): DirtyfmContentBackend {
  const configured = readConfiguredValue(env, "DIRTYFM_CONTENT_BACKEND");

  if (configured) {
    return assertRecognizedValue("DIRTYFM_CONTENT_BACKEND", configured, CONTENT_BACKENDS);
  }

  if (isProductionLikeRuntime(env)) {
    throw new Error(
      `Missing DIRTYFM_CONTENT_BACKEND in production/Vercel runtime. Set DIRTYFM_CONTENT_BACKEND to one of: ${expectedValues(CONTENT_BACKENDS)}.`
    );
  }

  // Legacy local fallback only. Current production is DIRTYFM_CONTENT_BACKEND=cloudflare-kv.
  return authMode === "local" ? "cloudflare-kv" : "supabase";
}

export function validateLocalAuthEnv(env: RuntimeEnv = process.env) {
  const missing = getMissingEnvVars(env, LOCAL_AUTH_ENV_VARS);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for DIRTYFM_AUTH_MODE=local: ${missing.join(", ")}.`
    );
  }
}

export function validateCloudflareKvRestEnv(env: RuntimeEnv = process.env) {
  const missing = getMissingEnvVars(env, CLOUDFLARE_KV_REST_ENV_VARS);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Cloudflare KV REST environment variables for DIRTYFM_CONTENT_BACKEND=cloudflare-kv in production/Vercel runtime: ${missing.join(", ")}.`
    );
  }
}

export function validateDirtyfmRuntimeConfig(env: RuntimeEnv = process.env) {
  const authMode = parseDirtyfmAuthMode(env);
  const contentBackend = parseDirtyfmContentBackend(env, authMode);

  if (authMode === "local") {
    validateLocalAuthEnv(env);
  }

  if (contentBackend === "cloudflare-kv" && isProductionLikeRuntime(env)) {
    validateCloudflareKvRestEnv(env);
  }

  return {
    authMode,
    contentBackend
  };
}

export function getValidatedDirtyfmAuthMode(env: RuntimeEnv = process.env) {
  const authMode = parseDirtyfmAuthMode(env);

  if (authMode === "local") {
    validateLocalAuthEnv(env);
  }

  return authMode;
}

export function getValidatedDirtyfmContentBackend(env: RuntimeEnv = process.env) {
  return validateDirtyfmRuntimeConfig(env).contentBackend;
}
