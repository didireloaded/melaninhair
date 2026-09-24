"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { tap } from "@/lib/http";
import type { DayAvailability } from "@/types/domain";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function MonthGrid({
  cursor,
  minCursor,
  maxCursor,
  days,
  selected,
  onCursor,
  onSelect,
}: {
  cursor: string;
  minCursor: string;
  maxCursor: string;
  days: DayAvailability[];
  selected: string | null;
  onCursor: (next: string) => void;
  onSelect: (date: string) => void;
}) {
  const [year, month] = cursor.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const byDate = new Map(days.map((day) => [day.date, day]));
  const cells = [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: count }, (_, index) => index + 1)];

  function shift(delta: number) {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1)).toISOString().slice(0, 10);
    if (next < minCursor || next > maxCursor) return;
    onCursor(next);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => shift(-1)} disabled={cursor <= minCursor} className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-30">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-[18px] font-semibold">{MONTHS[month - 1]} {year}</h2>
        <button type="button" aria-label="Next month" onClick={() => shift(1)} disabled={cursor >= maxCursor} className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-30">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[12px] text-muted">
        {WEEK.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7">
        {cells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const date = `${cursor.slice(0, 7)}-${String(day).padStart(2, "0")}`;
          const info = byDate.get(date);
          const selectable = info?.status === "available";
          const isSelected = selected === date;
          return (
            <button
              key={date}
              type="button"
              disabled={!selectable}
              aria-label={date}
              aria-pressed={isSelected}
              onClick={() => {
                tap("select");
                onSelect(date);
              }}
              className={`mx-auto my-0.5 flex h-10 w-10 flex-col items-center justify-center rounded-full text-[15px] ${
                isSelected ? "bg-coral text-white" : selectable ? "text-ink" : "text-[#d3c6c4]"
              } ${info?.date === selected ? "" : ""} ${!isSelected && info && date === info.date && info.status === "available" ? "" : ""}`}
            >
              <span className={!isSelected && info?.status === "available" && date.endsWith(String(new Date().getDate()).padStart(2, "0")) ? "" : ""}>{day}</span>
              {selectable && !isSelected ? <span className="h-1 w-1 rounded-full bg-coral-soft" /> : <span className="h-1 w-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
