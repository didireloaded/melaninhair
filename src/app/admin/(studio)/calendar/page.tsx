import { CalendarPanel } from "@/features/admin/calendar-panel";
import { listAdminBookings, listBlocks } from "@/lib/data/admin";
import { getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [business, blocks, bookings] = await Promise.all([
    getPublicBusiness(),
    listBlocks(),
    listAdminBookings("upcoming"),
  ]);
  return (
    <CalendarPanel
      hours={business.hours}
      breaks={business.breaks}
      blocks={blocks.map((block) => ({
        id: block.id,
        blockDate: block.blockDate,
        allDay: block.allDay,
        startTime: block.startTime,
        endTime: block.endTime,
        reason: block.reason,
      }))}
      bookings={bookings}
    />
  );
}
