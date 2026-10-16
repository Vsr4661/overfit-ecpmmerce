/**
 * Signed-token helpers built on Web Crypto so they run in both middleware (edge) and route handlers.
 * Tokens are `base64url(payload).base64url(hmacSha256(payload))`.
 */

export type AuthUser = {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  name?: string | null;
};

export const AUTH_COOKIE_NAME = "overfit_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signPayload(payload: Record<string, unknown>) {
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${encoded}.${await hmac(encoded)}`;
}

export async function verifyPayload<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  try {
    if (!constantTimeEqual(signature, await hmac(encoded))) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as T & { exp?: number };
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(user: AuthUser) {
  return signPayload({ ...user, exp: Date.now() + SESSION_TTL_SECONDS * 1000 });
}

export async function verifySessionToken(token: string | undefined): Promise<AuthUser | null> {
  const payload = await verifyPayload<AuthUser>(token);
  if (!payload?.id || !payload.email || !payload.role) return null;
  return { id: payload.id, email: payload.email, role: payload.role, name: payload.name };
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

/** Unguessable per-order token so customers can view their order without an account. */
export async function orderAccessToken(orderId: string) {
  return hmac(`order:${orderId}`);
}

export async function verifyOrderAccessToken(orderId: string, token: string | undefined) {
  if (!token) return false;
  return constantTimeEqual(token, await orderAccessToken(orderId));
}
