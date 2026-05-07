import { createHmac, timingSafeEqual } from "node:crypto";

export type AuthUser = {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  name?: string;
};

const AUTH_COOKIE_NAME = "overfit_auth_token";

function getSecret() {
  return process.env.AUTH_SECRET ?? "overfit-dev-secret-change-in-production";
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function createAuthToken(user: AuthUser) {
  const payload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): AuthUser | null {
  const [encodedPayload, receivedSignature] = token.split(".");
  if (!encodedPayload || !receivedSignature) return null;

  const expectedSignature = createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  const isValid = timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature),
  );
  if (!isValid) return null;

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthUser & { exp: number };
  if (payload.exp < Date.now()) return null;

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
}

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME;
}
