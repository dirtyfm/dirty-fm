import { createLocalPassphraseHash } from "../src/lib/localAuthCore.ts";

const passphrase = process.argv.slice(2).join(" ");

if (!passphrase) {
  console.error("Usage: node scripts/generate-local-passphrase-hash.mjs \"your passphrase\"");
  process.exit(1);
}

console.log(await createLocalPassphraseHash(passphrase));
