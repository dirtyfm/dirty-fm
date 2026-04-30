import "server-only";
import { readRequiredServerEnv } from "@/lib/env";
import {
  createLocalPassphraseHash,
  createSignedLocalSession,
  readSignedLocalSession,
  verifyLocalPassphrase
} from "@/lib/localAuthCore";

export { createLocalPassphraseHash, verifyLocalPassphrase };

export type LocalAdminProfile = {
  role: "admin";
  user_id: string;
};

const SESSION_TTL_SECONDS = 60 * 60 * 12;

export async function createLocalSessionToken(email: string, now = Date.now()) {
  return createSignedLocalSession(
    {
      email,
      exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
      role: "admin"
    },
    readRequiredServerEnv("DIRTYFM_SESSION_SECRET")
  );
}

export async function verifyLocalSessionToken(token: string, now = Date.now()) {
  const payload = await readSignedLocalSession(token, readRequiredServerEnv("DIRTYFM_SESSION_SECRET"));

  if (!payload || payload.role !== "admin" || payload.exp <= Math.floor(now / 1000)) {
    return null;
  }

  const operatorEmail = readRequiredServerEnv("DIRTYFM_OPERATOR_EMAIL").toLowerCase();
  if (payload.email.toLowerCase() !== operatorEmail) {
    return null;
  }

  return {
    role: "admin",
    user_id: `local:${operatorEmail}`
  } satisfies LocalAdminProfile;
}

export async function authenticateLocalOperator(email: string, passphrase: string) {
  const operatorEmail = readRequiredServerEnv("DIRTYFM_OPERATOR_EMAIL").toLowerCase();

  if (email.trim().toLowerCase() !== operatorEmail) {
    return null;
  }

  const passphraseHash = readRequiredServerEnv("DIRTYFM_OPERATOR_PASSPHRASE_HASH");
  const verified = await verifyLocalPassphrase(passphrase, passphraseHash);

  if (!verified) {
    return null;
  }

  return createLocalSessionToken(operatorEmail);
}

export function getLocalSessionMaxAge() {
  return SESSION_TTL_SECONDS;
}
