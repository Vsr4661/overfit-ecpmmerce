import "server-only";
import type { AuthUser } from "@/lib/auth";
import { sendLoginCode } from "@/lib/email";
import {
  LOGIN_CODES_PER_HOUR,
  LOGIN_CODE_MAX_ATTEMPTS,
  LOGIN_CODE_TTL_MINUTES,
  checkLoginCode,
  generateLoginCode,
  hashLoginCode,
} from "@/lib/login-code";
import { prisma } from "@/lib/prisma";

export class LoginError extends Error {}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Emails a one-time sign-in code. Admin accounts are skipped silently (they sign in with a
 * password at /admin/login) so the response never reveals which emails are admins.
 */
export async function requestLoginCode(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (user?.role === "ADMIN") return;

  const recent = await prisma.loginCode.count({
    where: { email, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= LOGIN_CODES_PER_HOUR) {
    throw new LoginError("Too many codes requested. Try again in an hour.");
  }

  const code = generateLoginCode();
  await prisma.loginCode.deleteMany({ where: { email, expiresAt: { lt: new Date() } } });
  await prisma.loginCode.create({
    data: {
      email,
      codeHash: hashLoginCode(email, code),
      expiresAt: new Date(Date.now() + LOGIN_CODE_TTL_MINUTES * 60 * 1000),
    },
  });
  await sendLoginCode(email, code);
}

/**
 * Checks the latest code for this email. On success, creates the customer account if needed
 * and attaches their earlier guest orders to it.
 */
export async function verifyLoginCode(rawEmail: string, code: string): Promise<AuthUser> {
  const email = normalizeEmail(rawEmail);
  const latest = await prisma.loginCode.findFirst({
    where: { email, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) throw new LoginError("That code has expired or was already used. Request a new one.");

  // Count the attempt before checking, so parallel guesses can't exceed the limit.
  const { count } = await prisma.loginCode.updateMany({
    where: { id: latest.id, attempts: { lt: LOGIN_CODE_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (count === 0) throw new LoginError("Too many wrong attempts. Request a new code.");
  if (!checkLoginCode(email, code, latest.codeHash)) throw new LoginError("That code isn't right. Check it and try again.");

  await prisma.loginCode.deleteMany({ where: { email } });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.role === "ADMIN") throw new LoginError("Admins sign in at /admin/login.");
  const user = existing ?? (await prisma.user.create({ data: { email, role: "CUSTOMER" } }));

  await prisma.order.updateMany({ where: { customerEmail: email, userId: null }, data: { userId: user.id } });

  return { id: user.id, email: user.email, name: user.name, role: "CUSTOMER" };
}
