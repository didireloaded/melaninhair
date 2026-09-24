"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAY_NAMES } from "@/lib/dates";
import { postJson } from "@/lib/http";
import type { AdminBooking, BreakRow, HourRow } from "@/types/domain";

type Block = {
  id: string;
  blockDate: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};

export function CalendarPanel({
  hours,
  breaks,
  blocks,
  bookings,
}: {
  hours: HourRow[];
  breaks: BreakRow[];
  blocks: Block[];
  bookings: AdminBooking[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [allDay, setAllDay] = useState(true);

  async function send(body: unknown) {
    setMessage(null);
    try {
      await postJson("/api/admin/schedule", body);
      router.refresh();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save that.");
    }
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Calendar</h1>
      {message ? <p className="mt-3 text-[14px] text-brown">{message}</p> : null}
      <section className="mt-6">
        <h2 className="text-[16px] font-semibold">Coming up</h2>
        <ul className="mt-2">
          {bookings.slice(0, 12).map((booking) => (
            <li key={booking.id} className="flex justify-between gap-3 border-b border-line py-3 text-[14px]">
              <span>
                {booking.dateLabel} · {booking.startTime}
                <span className="block text-muted">{booking.clientName}</span>
              </span>
              <span className="text-muted">{booking.services.map((service) => service.name).join(" + ")}</span>
            </li>
          ))}
        </ul>
        {bookings.length === 0 ? <p className="mt-2 text-[14px] text-muted">No upcoming appointments.</p> : null}
      </section>
      <section className="mt-8">
        <h2 className="text-[16px] font-semibold">Block a date or time</h2>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void send({
              action: "block",
              blockDate: form.get("blockDate"),
              allDay,
              startTime: allDay ? null : form.get("startTime"),
              endTime: allDay ? null : form.get("endTime"),
              reason: String(form.get("reason") || "") || null,
            });
          }}
        >
          <input name="blockDate" type="date" required className="h-11 rounded-[12px] border border-line px-3" />
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />
            Whole day
          </label>
          {allDay ? null : (
            <div className="grid grid-cols-2 gap-2">
              <input name="startTime" type="time" required className="h-11 rounded-[12px] border border-line px-3" />
              <input name="endTime" type="time" required className="h-11 rounded-[12px] border border-line px-3" />
            </div>
          )}
          <input name="reason" placeholder="Reason" className="h-11 rounded-[12px] border border-line px-3" />
          <button className="h-11 rounded-[12px] bg-coral text-white">Block</button>
        </form>
        <ul className="mt-3">
          {blocks.slice(0, 12).map((block) => (
            <li key={block.id} className="flex items-center justify-between border-b border-line py-2 text-[14px]">
              <span>
                {block.blockDate} · {block.allDay ? "Closed" : `${block.startTime?.slice(0, 5)}–${block.endTime?.slice(0, 5)}`}
                {block.reason ? ` · ${block.reason}` : ""}
              </span>
              <button type="button" className="text-coral" onClick={() => void send({ action: "unblock", id: block.id })}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-[16px] font-semibold">Working hours</h2>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const days = hours.map((hour) => ({
              dayOfWeek: hour.dayOfWeek,
              isOpen: form.get(`open-${hour.dayOfWeek}`) === "on",
              openTime: String(form.get(`start-${hour.dayOfWeek}`) || hour.openTime).slice(0, 5),
              closeTime: String(form.get(`end-${hour.dayOfWeek}`) || hour.closeTime).slice(0, 5),
            }));
            void send({ action: "hours", days });
          }}
        >
          {hours.map((hour) => (
            <div key={hour.dayOfWeek} className="grid grid-cols-[1.1fr_auto_1fr_1fr] items-center gap-2 text-[14px]">
              <span>{DAY_NAMES[hour.dayOfWeek]}</span>
              <input name={`open-${hour.dayOfWeek}`} type="checkbox" defaultChecked={hour.isOpen} aria-label={`${DAY_NAMES[hour.dayOfWeek]} open`} />
              <input name={`start-${hour.dayOfWeek}`} type="time" defaultValue={hour.openTime} className="h-10 rounded-[10px] border border-line px-2" />
              <input name={`end-${hour.dayOfWeek}`} type="time" defaultValue={hour.closeTime} className="h-10 rounded-[10px] border border-line px-2" />
            </div>
          ))}
          <button className="mt-2 h-11 rounded-[12px] bg-coral text-white">Save hours</button>
        </form>
      </section>
      <section className="mt-8">
        <h2 className="text-[16px] font-semibold">Breaks</h2>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const next = breaks.flatMap((item, index) => {
              if (form.get(`drop-${index}`) === "on") return [];
              return [{
                dayOfWeek: Number(form.get(`day-${index}`)),
                startTime: String(form.get(`bstart-${index}`)).slice(0, 5),
                endTime: String(form.get(`bend-${index}`)).slice(0, 5),
                label: String(form.get(`label-${index}`) || "Break"),
              }];
            });
            const extraDay = form.get("extra-day");
            if (extraDay !== "" && form.get("extra-start") && form.get("extra-end")) {
              next.push({
                dayOfWeek: Number(extraDay),
                startTime: String(form.get("extra-start")).slice(0, 5),
                endTime: String(form.get("extra-end")).slice(0, 5),
                label: String(form.get("extra-label") || "Break"),
              });
            }
            void send({ action: "breaks", breaks: next });
          }}
        >
          {breaks.map((item, index) => (
            <div key={item.id} className="grid grid-cols-4 gap-2">
              <select name={`day-${index}`} defaultValue={item.dayOfWeek} className="h-10 rounded-[10px] border border-line px-2 text-[14px]">
                {DAY_NAMES.map((name, day) => (
                  <option key={name} value={day}>
                    {name.slice(0, 3)}
                  </option>
                ))}
              </select>
              <input name={`bstart-${index}`} type="time" defaultValue={item.startTime} className="h-10 rounded-[10px] border border-line px-2" />
              <input name={`bend-${index}`} type="time" defaultValue={item.endTime} className="h-10 rounded-[10px] border border-line px-2" />
              <input name={`label-${index}`} defaultValue={item.label} className="h-10 rounded-[10px] border border-line px-2" />
              <label className="col-span-4 flex items-center gap-2 text-[13px] text-muted">
                <input name={`drop-${index}`} type="checkbox" />
                Remove this break
              </label>
            </div>
          ))}
          <p className="text-[13px] text-muted">Add another</p>
          <div className="grid grid-cols-4 gap-2">
            <select name="extra-day" defaultValue="" className="h-10 rounded-[10px] border border-line px-2 text-[14px]">
              <option value="">Day</option>
              {DAY_NAMES.map((name, day) => (
                <option key={name} value={day}>
                  {name.slice(0, 3)}
                </option>
              ))}
            </select>
            <input name="extra-start" type="time" className="h-10 rounded-[10px] border border-line px-2" />
            <input name="extra-end" type="time" className="h-10 rounded-[10px] border border-line px-2" />
            <input name="extra-label" placeholder="Lunch" className="h-10 rounded-[10px] border border-line px-2" />
          </div>
          <button className="h-11 rounded-[12px] bg-coral text-white">Save breaks</button>
        </form>
      </section>
    </div>
  );
}
