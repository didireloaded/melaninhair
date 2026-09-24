import { BookingsPanel } from "@/features/admin/bookings-panel";
import { counts, listAdminBookings } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const params = await searchParams;
  const filter = params.filter || "pending";
  const [bookings, tally] = await Promise.all([listAdminBookings(filter), counts()]);
  return <BookingsPanel bookings={bookings} filter={filter} counts={tally} />;
}
