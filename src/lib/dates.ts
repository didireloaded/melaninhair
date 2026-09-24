import { formatInTimeZone } from "date-fns-tz";

export function todayInTimeZone(timeZone: string, now = new Date()): string {
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
}

export function nowMinutesInTimeZone(timeZone: string, now = new Date()): number {
  const clock = formatInTimeZone(now, timeZone, "HH:mm");
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

export function weekdayFromDateString(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

export function addDaysToDateString(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function eachDate(from: string, to: string): string[] {
  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    cursor = addDaysToDateString(cursor, 1);
    if (dates.length > 120) break;
  }
  return dates;
}

export function formatAppointmentDate(date: string, timeZone: string, now = new Date()): string {
  const today = todayInTimeZone(timeZone, now);
  const pattern = date.slice(0, 4) === today.slice(0, 4) ? "d MMMM" : "d MMMM yyyy";
  return formatInTimeZone(new Date(`${date}T12:00:00Z`), timeZone, pattern);
}

export function formatWeekday(date: string, timeZone: string): string {
  return formatInTimeZone(new Date(`${date}T12:00:00Z`), timeZone, "EEE");
}

export function formatMonthLabel(year: number, month: number, timeZone: string): string {
  return formatInTimeZone(new Date(Date.UTC(year, month - 1, 1, 12)), timeZone, "MMMM yyyy");
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
