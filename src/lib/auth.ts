import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";

export const ADMIN_COOKIE = "eb_admin";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || "entranced-beauty-session";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const previous = Buffer.from(hash, "hex");
  if (previous.length !== next.length) return false;
  return timingSafeEqual(previous, next);
}

export function signSession(adminId: string, maxAgeMs = 1000 * 60 * 60 * 24 * 14): string {
  const payload = Buffer.from(JSON.stringify({ id: adminId, exp: Date.now() + maxAgeMs })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSession(token: string | undefined | null): { id: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { id?: string; exp?: number };
    if (!data.id || !data.exp || data.exp < Date.now()) return null;
    return { id: data.id };
  } catch {
    return null;
  }
}

export async function getSessionAdmin() {
  const jar = await cookies();
  const session = readSession(jar.get(ADMIN_COOKIE)?.value);
  if (!session) return null;
  const [admin] = await db.select().from(admins).where(eq(admins.id, session.id)).limit(1);
  return admin ?? null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: false,
  };
}
