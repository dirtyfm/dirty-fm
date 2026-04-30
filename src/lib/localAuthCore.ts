export type LocalSessionPayload = {
  email: string;
  exp: number;
  role: "admin";
};

const HASH_PREFIX = "pbkdf2-sha256";
const HASH_ITERATIONS = 210000;

function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is required for local Signal Control auth.");
  }

  return globalThis.crypto;
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const binary = Array.from(buffer, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return mismatch === 0;
}

async function derivePassphraseDigest(passphrase: string, salt: Uint8Array, iterations: number) {
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      hash: "SHA-256",
      iterations,
      name: "PBKDF2",
      salt: salt.slice().buffer as ArrayBuffer
    },
    key,
    256
  );

  return base64UrlEncode(bits);
}

export async function createLocalPassphraseHash(passphrase: string, salt?: Uint8Array) {
  const actualSalt = salt ?? getCrypto().getRandomValues(new Uint8Array(16));
  const digest = await derivePassphraseDigest(passphrase, actualSalt, HASH_ITERATIONS);
  return `${HASH_PREFIX}$${HASH_ITERATIONS}$${base64UrlEncode(actualSalt)}$${digest}`;
}

export async function verifyLocalPassphrase(passphrase: string, storedHash: string) {
  const [prefix, iterationsValue, saltValue, digest] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (prefix !== HASH_PREFIX || !Number.isInteger(iterations) || !saltValue || !digest) {
    return false;
  }

  const computed = await derivePassphraseDigest(passphrase, base64UrlDecode(saltValue), iterations);
  return timingSafeEqual(computed, digest);
}

export async function signLocalPayload(payload: string, secret: string) {
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(signature);
}

export async function createSignedLocalSession(
  payload: LocalSessionPayload,
  secret: string
) {
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signLocalPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function readSignedLocalSession(token: string, secret: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = await signLocalPayload(encodedPayload, secret);

  if (!timingSafeEqual(signature, expected)) {
    return null;
  }

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as LocalSessionPayload;
  } catch {
    return null;
  }
}
