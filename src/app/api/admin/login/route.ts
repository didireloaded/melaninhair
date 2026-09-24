import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { authenticateAdmin } from "@/lib/data/admin";
import { errorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; at: number }>();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const now = Date.now();
    const current = attempts.get(email);
    if (current && now - current.at < 15 * 60 * 1000 && current.count >= 8) {
      return Response.json({ error: "rate", message: "Too many tries. Wait a few minutes." }, { status: 429 });
    }
    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      const count = current && now - current.at < 15 * 60 * 1000 ? current.count + 1 : 1;
      attempts.set(email || "blank", { count, at: now });
      return Response.json({ error: "auth", message: "Check the email and password." }, { status: 401 });
    }
    attempts.delete(email);
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, signSession(admin.id), sessionCookieOptions());
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
