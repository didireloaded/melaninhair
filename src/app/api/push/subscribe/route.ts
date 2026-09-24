import { z } from "zod";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";
import { vapidPublicKey } from "@/lib/push";

const schema = z.object({ endpoint: z.string().url().max(2048), keys: z.object({ p256dh: z.string().min(1).max(512), auth: z.string().min(1).max(512) }) });
export async function GET() { try { await requireAdmin(); return Response.json({ publicKey: vapidPublicKey() }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const subscription = schema.parse(await request.json());
    await db.insert(pushSubscriptions).values({ endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth }).onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } });
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
