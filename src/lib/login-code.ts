import { randomInt } from "node:crypto";
import { hmacSha256Hex, verifyHmacSha256Hex } from "@/lib/hmac";

/** How long an emailed sign-in code works, and how many wrong guesses it allows. */
export const LOGIN_CODE_TTL_MINUTES = 10;
export const LOGIN_CODE_MAX_ATTEMPTS = 5;
/** Codes that can be requested for one email per hour (stored in the DB, so it holds across instances). */
export const LOGIN_CODES_PER_HOUR = 5;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  return value;
}

export function generateLoginCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Codes are stored hashed and bound to the email, so a database leak doesn't reveal working codes. */
export function hashLoginCode(email: string, code: string) {
  return hmacSha256Hex(secret(), `login:${email}:${code}`);
}

export function checkLoginCode(email: string, code: string, codeHash: string) {
  return verifyHmacSha256Hex(`login:${email}:${code}`, codeHash, secret());
}
