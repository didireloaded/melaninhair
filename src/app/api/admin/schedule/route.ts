import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookingServices } from "@/db/schema";
import { createBlock, deleteBlock, saveBreaks, saveHours } from "@/lib/data/admin";
import { getDurationAvailability } from "@/lib/data/availability";
import { AppError, errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";
import { isValidDateString } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? "";
    const bookingId = url.searchParams.get("bookingId") ?? "";
    if (!isValidDateString(date) || !bookingId) throw new AppError("date", "Choose a date.");
    const lines = await db.select().from(bookingServices).where(eq(bookingServices.bookingId, bookingId));
    const duration = lines.reduce((sum, line) => sum + line.durationMinutes, 0) || 30;
    return Response.json(await getDurationAvailability({ from: date, to: date, duration, excludeBookingId: bookingId }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { action?: string; id?: string };
    switch (body.action) {
      case "hours":
        await saveHours(body);
        return Response.json({ ok: true });
      case "breaks":
        await saveBreaks(body);
        return Response.json({ ok: true });
      case "block":
        return Response.json(await createBlock(body));
      case "unblock":
        if (!body.id) throw new AppError("missing", "Choose a block.");
        await deleteBlock(body.id);
        return Response.json({ ok: true });
      default:
        throw new AppError("action", "That action is not available.");
    }
  } catch (error) {
    return errorResponse(error);
  }
}
