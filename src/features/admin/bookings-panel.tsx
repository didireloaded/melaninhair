"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/booking/pricing";
import { postJson } from "@/lib/http";
import type { AdminBooking, BookingStatus } from "@/types/domain";

const filters = [
  ["today", "Today"],
  ["upcoming", "Upcoming"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["completed", "Done"],
  ["cancelled", "Cancelled"],
] as const;

export function BookingsPanel({
  bookings,
  filter,
  counts,
}: {
  bookings: AdminBooking[];
  filter: string;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);

  async function setStatus(id: string, status: BookingStatus) {
    setMessage(null);
    try {
      await postJson("/api/admin/bookings", { id, status });
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update that booking.");
    }
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Bookings</h1>
      <div className="mt-4 flex gap-3 overflow-x-auto text-[14px]">
        {filters.map(([key, label]) => (
          <Link key={key} href={`/admin?filter=${key}`} className={`shrink-0 border-b-2 pb-1 ${filter === key ? "border-coral text-coral" : "border-transparent text-muted"}`}>
            {label} {counts[key] ?? 0}
          </Link>
        ))}
      </div>
      {message ? <p className="mt-3 text-[14px] text-coral">{message}</p> : null}
      <ul className="mt-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="border-b border-line py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold">{booking.clientName}</p>
                <p className="text-[13px] text-muted">{booking.reference}</p>
              </div>
              <p className="text-[13px] capitalize text-brown">{booking.status.replace("_", " ")}</p>
            </div>
            <p className="mt-2 text-[14px]">{booking.services.map((service) => service.name).join(" + ") || "Service"}</p>
            <p className="text-[14px] text-muted">
              {booking.dateLabel} · {booking.startTime}–{booking.endTime} · {booking.duration} min
            </p>
            <p className="mt-1 text-[14px]">{formatMoney(booking.total, booking.currencySymbol)}</p>
            <a href={`tel:${booking.clientPhone}`} className="mt-1 block text-[14px] text-brown">
              {booking.phoneDisplay}
            </a>
            {booking.notes ? <p className="mt-2 text-[14px] leading-5">{booking.notes}</p> : null}
            {booking.services.some((service) => service.addons.length) ? (
              <p className="mt-1 text-[13px] text-muted">
                {booking.services.flatMap((service) => service.addons.map((addon) => `${addon.name}${addon.quantity > 1 ? ` × ${addon.quantity}` : ""}`)).join(", ")}
              </p>
            ) : null}
            {booking.imageId ? (
              <a href={`/api/admin/inspiration/${booking.imageId}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[14px] text-coral">
                View inspiration
              </a>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
              <button type="button" onClick={() => setStatus(booking.id, "confirmed")}>Confirm</button>
              <button type="button" onClick={() => setStatus(booking.id, "rejected")}>Reject</button>
              <button type="button" onClick={() => setStatus(booking.id, "cancelled")}>Cancel</button>
              <button type="button" onClick={() => setStatus(booking.id, "completed")}>Complete</button>
              <button type="button" onClick={() => setStatus(booking.id, "no_show")}>No-show</button>
              <a href={booking.whatsappUrl}>WhatsApp</a>
              <button type="button" onClick={() => setOpenId(openId === booking.id ? null : booking.id)}>
                Reschedule
              </button>
            </div>
            {openId === booking.id ? (
              <form
                className="mt-3 grid gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  try {
                    await postJson("/api/admin/bookings", {
                      action: "reschedule",
                      id: booking.id,
                      date: form.get("date"),
                      startTime: form.get("startTime"),
                    });
                    setOpenId(null);
                    router.refresh();
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Could not move that booking.");
                  }
                }}
              >
                <input name="date" type="date" defaultValue={booking.date} required className="h-11 rounded-[12px] border border-line px-3" />
                <button
                  type="button"
                  className="text-left text-[14px] text-coral"
                  onClick={async (event) => {
                    const form = (event.currentTarget.form);
                    const date = String(new FormData(form!).get("date") ?? "");
                    const response = await fetch(`/api/admin/schedule?date=${date}&bookingId=${booking.id}`);
                    const data = (await response.json()) as { days?: { slots: string[] }[]; message?: string };
                    if (!response.ok) {
                      setMessage(data.message || "Could not load times.");
                      return;
                    }
                    setSlots(data.days?.[0]?.slots ?? []);
                  }}
                >
                  Load times
                </button>
                <select name="startTime" required className="h-11 rounded-[12px] border border-line px-3" defaultValue={booking.startTime}>
                  <option value={booking.startTime}>{booking.startTime} current</option>
                  {slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <button type="submit" className="h-11 rounded-[12px] bg-coral text-white">
                  Save new time
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      {bookings.length === 0 ? <p className="mt-8 text-[15px] text-muted">No bookings in this view.</p> : null}
    </div>
  );
}
