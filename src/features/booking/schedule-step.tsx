"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MonthGrid } from "@/features/calendar/month-grid";
import { addDaysToDateString, todayInTimeZone } from "@/lib/dates";
import { tap } from "@/lib/http";
import type { DayAvailability, PublicBusiness, PublicService, SelectedService } from "@/types/domain";
import { formatMoney } from "@/lib/booking/pricing";

export function ScheduleStep({
  services,
  selected,
  business,
  date,
  time,
  onDate,
  onTime,
  onAddons,
}: {
  services: PublicService[];
  selected: SelectedService[];
  business: PublicBusiness;
  date: string | null;
  time: string | null;
  onDate: (date: string) => void;
  onTime: (time: string) => void;
  onAddons: (serviceId: string, addonId: string, quantity: number) => void;
}) {
  const today = todayInTimeZone(business.timezone);
  const minCursor = `${today.slice(0, 7)}-01`;
  const maxCursor = `${addDaysToDateString(today, 120).slice(0, 7)}-01`;
  const [cursor, setCursor] = useState(date ? `${date.slice(0, 7)}-01` : minCursor);
  const end = useMemo(() => {
    const [year, month] = cursor.split("-").map(Number);
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${cursor.slice(0, 7)}-${String(last).padStart(2, "0")}`;
  }, [cursor]);
  const ids = selected.map((item) => item.serviceId).join(",");
  const query = useQuery({
    queryKey: ["availability", cursor, ids],
    queryFn: async () => {
      const response = await fetch(`/api/availability?from=${cursor}&to=${end}&services=${ids}`);
      const data = (await response.json()) as { message?: string; days?: DayAvailability[] };
      if (!response.ok) throw new Error(data.message || "Could not load times.");
      return data.days ?? [];
    },
  });
  const chosen = services.filter((service) => selected.some((item) => item.serviceId === service.id));
  const day = query.data?.find((item) => item.date === date);
  const duration = chosen.reduce((sum, service) => sum + service.durationMinutes, 0);

  return (
    <div className="px-5 pb-4">
      <p className="text-[14px] text-muted">
        {chosen.map((service) => service.name).join(" + ")} · {duration} min
      </p>
      {chosen.some((service) => service.addons.length) ? (
        <div className="mt-4">
          {chosen.map((service) =>
            service.addons.map((addon) => {
              const current = selected.find((item) => item.serviceId === service.id)?.addons.find((item) => item.addonId === addon.id);
              const quantity = current?.quantity ?? 0;
              return (
                <div key={addon.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
                  <div>
                    <p className="text-[15px]">{addon.name}</p>
                    <p className="text-[13px] text-muted">
                      {formatMoney(addon.price, business.currencySymbol)}
                      {addon.pricingType === "quantity" ? " each" : ""}
                    </p>
                  </div>
                  {addon.pricingType === "quantity" ? (
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="Fewer" className="grid h-9 w-9 place-items-center rounded-full border border-line" onClick={() => onAddons(service.id, addon.id, Math.max(0, quantity - 1))}>
                        −
                      </button>
                      <span className="w-4 text-center">{quantity}</span>
                      <button type="button" aria-label="More" className="grid h-9 w-9 place-items-center rounded-full border border-line" onClick={() => onAddons(service.id, addon.id, Math.min(addon.maxQuantity, quantity + 1))}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddons(service.id, addon.id, quantity ? 0 : 1)}
                      className={`h-9 rounded-[12px] px-3 text-[13px] ${quantity ? "bg-coral text-white" : "border border-line"}`}
                    >
                      {quantity ? "Added" : "Add"}
                    </button>
                  )}
                </div>
              );
            }),
          )}
        </div>
      ) : null}
      {chosen.some((service) => service.preparationNotes) ? (
        <p className="mt-4 text-[13px] leading-5 text-muted">{chosen.find((service) => service.preparationNotes)?.preparationNotes}</p>
      ) : null}
      <div className="mt-5">
        {query.isError ? <p className="mb-3 text-[14px] text-muted">Could not load the calendar. Check your connection and try again.</p> : null}
        {query.isLoading ? <p className="mb-2 text-[13px] text-muted">Checking the month…</p> : null}
        <MonthGrid
          cursor={cursor}
          minCursor={minCursor}
          maxCursor={maxCursor}
          days={query.data ?? []}
          selected={date}
          onCursor={setCursor}
          onSelect={(next) => {
            onDate(next);
            onTime("");
          }}
        />
      </div>
      {date ? (
        <div className="mt-4">
          <h3 className="text-[16px] font-semibold">Available times</h3>
          {query.isLoading ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-11 rounded-[12px] bg-blush" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="mt-3 text-[14px] text-muted">Could not load times. Check your connection and try again.</p>
          ) : day?.status === "closed" || day?.status === "blocked" ? (
            <p className="mt-3 text-[14px] text-muted">Closed this day.</p>
          ) : !day?.slots.length ? (
            <div className="mt-3">
              <p className="text-[15px]">No times left for this date.</p>
              <p className="text-[14px] text-muted">Try another day.</p>
            </div>
          ) : (
            <TimeGroups slots={day.slots} value={time} onChange={onTime} />
          )}
        </div>
      ) : (
        <p className="mt-4 text-[14px] text-muted">Pick a date to see times.</p>
      )}
    </div>
  );
}

function TimeGroups({ slots, value, onChange }: { slots: string[]; value: string | null; onChange: (slot: string) => void }) {
  const groups = [
    ["Morning", slots.filter((slot) => Number(slot.slice(0, 2)) < 12)],
    ["Afternoon", slots.filter((slot) => Number(slot.slice(0, 2)) >= 12 && Number(slot.slice(0, 2)) < 17)],
    ["Evening", slots.filter((slot) => Number(slot.slice(0, 2)) >= 17)],
  ] as const;
  return (
    <div>
      {groups.map(([label, group]) => group.length ? (
        <div key={label} className="mt-4">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-muted">{label}</p>
          <div className="grid grid-cols-3 gap-2">
            {group.map((slot) => (
              <button key={slot} type="button" onClick={() => { tap("select"); onChange(slot); }} className={`rounded-full border py-2.5 text-[12.5px] transition ${value === slot ? "border-[#3D4A3D] bg-[#3D4A3D] text-white" : "border-line bg-white text-ink hover:bg-[#FBF7EF]"}`}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      ) : null)}
    </div>
  );
}
