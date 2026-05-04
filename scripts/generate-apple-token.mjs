#!/usr/bin/env node
/**
 * Generate an Apple Music developer token (JWT)
 *
 * Usage:
 *   node scripts/generate-apple-token.mjs \
 *     --key ./AuthKey_XXXXXXXXXX.p8 \
 *     --key-id XXXXXXXXXX \
 *     --team-id XXXXXXXXXX
 *
 * The token is valid for 180 days. Add it to .env.local:
 *   NEXT_PUBLIC_APPLE_MUSIC_TOKEN=<token>
 */

import { readFileSync } from "fs";
import { createPrivateKey, sign } from "crypto";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : null;
}

const keyPath = getArg("key");
const keyId = getArg("key-id");
const teamId = getArg("team-id");

if (!keyPath || !keyId || !teamId) {
  console.error("Usage: node generate-apple-token.mjs --key <path> --key-id <id> --team-id <id>");
  process.exit(1);
}

const privateKeyPem = readFileSync(keyPath, "utf8");
const privateKey = createPrivateKey(privateKeyPem);

const now = Math.floor(Date.now() / 1000);
const exp = now + 15777000; // ~6 months

const header = { alg: "ES256", kid: keyId };
const payload = { iss: teamId, iat: now, exp };

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

const headerB64 = base64url(header);
const payloadB64 = base64url(payload);
const signingInput = `${headerB64}.${payloadB64}`;

const signature = sign("SHA256", Buffer.from(signingInput), {
  key: privateKey,
  dsaEncoding: "ieee-p1363",
});

const token = `${signingInput}.${signature.toString("base64url")}`;

console.log("\nApple Music Developer Token (valid ~6 months):\n");
console.log(token);
console.log("\nAdd to .env.local:");
console.log(`NEXT_PUBLIC_APPLE_MUSIC_TOKEN=${token}`);
console.log("\nAdd to Vercel:");
console.log(`vercel env add NEXT_PUBLIC_APPLE_MUSIC_TOKEN`);
