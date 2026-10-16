import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as auth from "../src/lib/auth";
import { hmacSha256Hex, verifyHmacSha256Hex } from "../src/lib/hmac";

// auth reads the secret lazily, so setting it here (after imports) is enough.
process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";

describe("webhook signatures", () => {
  it("accepts a correct signature", () => {
    const body = '{"event":"payment.captured"}';
    assert.equal(verifyHmacSha256Hex(body, hmacSha256Hex("s3cret", body), "s3cret"), true);
  });
  it("rejects a tampered body, wrong secret or malformed signature", () => {
    const signature = hmacSha256Hex("s3cret", "original");
    assert.equal(verifyHmacSha256Hex("tampered", signature, "s3cret"), false);
    assert.equal(verifyHmacSha256Hex("original", signature, "other"), false);
    assert.equal(verifyHmacSha256Hex("original", "abc", "s3cret"), false);
  });
});

describe("session tokens", () => {
  it("round-trips a user", async () => {
    const token = await auth.createSessionToken({ id: "u1", email: "a@b.co", role: "ADMIN" });
    assert.equal((await auth.verifySessionToken(token))?.role, "ADMIN");
  });
  it("rejects a payload edited to escalate the role", async () => {
    const token = await auth.createSessionToken({ id: "u1", email: "a@b.co", role: "CUSTOMER" });
    const signature = token.split(".")[1];
    const forged = Buffer.from(JSON.stringify({ id: "u1", email: "a@b.co", role: "ADMIN", exp: Date.now() + 1e6 })).toString("base64url");
    assert.equal(await auth.verifySessionToken(`${forged}.${signature}`), null);
  });
  it("rejects garbage without throwing", async () => {
    assert.equal(await auth.verifySessionToken("not-a-token"), null);
    assert.equal(await auth.verifySessionToken("a.b"), null);
    assert.equal(await auth.verifySessionToken(undefined), null);
  });
  it("binds order links to the order id", async () => {
    const token = await auth.orderAccessToken("order_1");
    assert.equal(await auth.verifyOrderAccessToken("order_1", token), true);
    assert.equal(await auth.verifyOrderAccessToken("order_2", token), false);
  });
});
