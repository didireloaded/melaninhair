import { listAdminBookings, rescheduleBooking, updateBookingStatus } from "@/lib/data/admin";
import { errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const filter = new URL(request.url).searchParams.get("filter") ?? "pending";
    return Response.json({ bookings: await listAdminBookings(filter) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { action?: string; id?: string };
    if (!body.id) return Response.json({ error: "missing", message: "Choose a booking." }, { status: 400 });
    if (body.action === "reschedule") {
      await rescheduleBooking(body.id, body);
      return Response.json({ ok: true });
    }
    await updateBookingStatus(body.id, body);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
