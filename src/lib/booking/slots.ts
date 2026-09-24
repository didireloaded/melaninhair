import { clock, intervalsOverlap, timeToMinutes, type Interval } from "./time";

export type DayStatus = "past" | "closed" | "blocked" | "full" | "available";

export function generateSlots(options: {
  openTime: string;
  closeTime: string;
  durationMinutes: number;
  stepMinutes: number;
  breaks: Interval[];
  blocks: Interval[];
  bookings: Interval[];
  earliestStart?: number | null;
}): string[] {
  const open = timeToMinutes(options.openTime);
  const close = timeToMinutes(options.closeTime);
  const duration = options.durationMinutes;
  const step = options.stepMinutes;
  if (duration <= 0 || step <= 0 || close <= open) return [];

  const occupied = [...options.breaks, ...options.blocks, ...options.bookings];
  const slots: string[] = [];
  for (let start = open; start + duration <= close; start += step) {
    if (options.earliestStart != null && start < options.earliestStart) continue;
    const slot = { start, end: start + duration };
    if (occupied.some((item) => intervalsOverlap(slot, item))) continue;
    slots.push(clock(`${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`));
  }
  return slots;
}

export function classifyDay(input: {
  date: string;
  today: string;
  isOpen: boolean;
  allDayBlocked: boolean;
  slots: string[];
}): DayStatus {
  if (input.date < input.today) return "past";
  if (!input.isOpen) return "closed";
  if (input.allDayBlocked) return "blocked";
  if (input.slots.length === 0) return "full";
  return "available";
}

export function slotTakenByBooking(start: string, durationMinutes: number, bookings: Interval[]): boolean {
  const slot = { start: timeToMinutes(start), end: timeToMinutes(start) + durationMinutes };
  return bookings.some((booking) => intervalsOverlap(slot, booking));
}
