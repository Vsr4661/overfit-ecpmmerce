import { createHmac, timingSafeEqual } from "node:crypto";

export function hmacSha256Hex(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest("hex");
}

/** Constant-time check of a hex HMAC-SHA256 signature (used by Razorpay and Printrove webhooks). */
export function verifyHmacSha256Hex(data: string, signature: string, secret: string) {
  const expected = Buffer.from(hmacSha256Hex(secret, data));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
