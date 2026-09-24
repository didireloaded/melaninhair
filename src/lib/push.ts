import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export function vapidPublicKey() { return process.env.VAPID_PUBLIC_KEY ?? null; }

export async function notifyOwner(payload: { title: string; body: string; url: string }) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const subscriptions = await db.select().from(pushSubscriptions);
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload));
    } catch (error) {
      if (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 404) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id));
    }
  }));
}
