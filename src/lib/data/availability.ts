import { AppError } from "@/lib/errors";
import { addonLineTotal, roundMoney } from "@/lib/booking/pricing";
import { classifyDay, generateSlots, slotTakenByBooking } from "@/lib/booking/slots";
import { addMinutesToTime, timeToMinutes, type Interval } from "@/lib/booking/time";
import { addDaysToDateString, eachDate, isValidDateString, nowMinutesInTimeZone, todayInTimeZone, weekdayFromDateString } from "@/lib/dates";
import { allDocuments } from "@/lib/firebase/firestore-store";
import type { DayAvailability, Quote, QuoteLine, SelectedService } from "@/types/domain";
import { getPublicServices, getSettingsRow, priceForDate } from "./public";

const OCCUPYING = new Set(["pending", "confirmed", "rescheduled", "completed", "no_show"]);
type Hour = { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string };
type Break = { dayOfWeek: number; startTime: string; endTime: string };
type Block = { id: string; blockDate: string; allDay: boolean; startTime: string | null; endTime: string | null };
type Booking = { id: string; bookingDate: string; startTime: string; endTime: string; status: string };

export async function getAvailability(input: { from: string; to: string; serviceIds: string[]; excludeBookingId?: string }) {
  const settings = await getSettingsRow();
  validateRange(input.from, input.to);
  const uniqueIds = [...new Set(input.serviceIds)];
  if (!uniqueIds.length) throw new AppError("service", "Choose a service first.");
  const services = await getPublicServices();
  const selected = uniqueIds.map((id) => services.find((service) => service.id === id));
  if (selected.some((service) => !service?.bookingEnabled)) throw new AppError("service", "That service isn't available to book. Choose another.");
  const duration = selected.reduce((sum, service) => sum + (service?.durationMinutes ?? 0), 0);
  const days = await daysForRange({ ...input, duration, timezone: settings.timezone, step: settings.slotIntervalMinutes, minNotice: settings.minNoticeMinutes });
  return { days, duration, timezone: settings.timezone };
}

export async function getDurationAvailability(input: { from: string; to: string; duration: number; excludeBookingId?: string }) {
  const settings = await getSettingsRow();
  validateRange(input.from, input.to);
  if (input.duration < 15 || input.duration > 600) throw new AppError("duration", "That appointment length is not valid.");
  const days = await daysForRange({ ...input, timezone: settings.timezone, step: settings.slotIntervalMinutes, minNotice: 0 });
  return { days, duration: input.duration, timezone: settings.timezone };
}

export async function quoteAppointment(input: { services: SelectedService[]; date?: string; startTime?: string }): Promise<Quote> {
  const settings = await getSettingsRow();
  const date = input.date && isValidDateString(input.date) ? input.date : todayInTimeZone(settings.timezone);
  const built = await buildLines(null, input.services, date);
  return { lines: built.lines, total: built.total, duration: built.duration, deposit: built.deposit, endTime: input.startTime ? addMinutesToTime(input.startTime, built.duration) : null, currencySymbol: settings.currencySymbol };
}

export async function assertSlotOpen(_database: unknown, input: { date: string; startTime: string; duration: number; timezone: string; step: number; minNotice: number; excludeBookingId?: string }) {
  const today = todayInTimeZone(input.timezone);
  if (!isValidDateString(input.date)) throw new AppError("date", "Choose a valid date.");
  if (input.date < today) throw new AppError("past", "That date has passed. Choose another day.");
  if (input.date > addDaysToDateString(today, 120)) throw new AppError("date", "That date is too far ahead. Choose a closer day.");
  const [day] = await daysForRange({ from: input.date, to: input.date, ...input });
  if (!day || day.status === "closed") throw new AppError("closed", "Entranced Beauty is closed that day.");
  if (day.status === "blocked" || day.status === "past") throw new AppError("date", "That date isn't available. Choose another day.");
  if (!day.slots.includes(input.startTime)) {
    const bookingMap = await occupyingIntervals(input.date, input.date, input.excludeBookingId);
    if (slotTakenByBooking(input.startTime, input.duration, bookingMap.get(input.date) ?? [])) throw new AppError("slot_taken", "That time was just booked. Please choose another available time.", 409);
    throw new AppError("unavailable", "That time isn't available. Please choose another.");
  }
}

export async function buildLines(_database: unknown, selected: SelectedService[], date: string) {
  if (selected.length < 1 || selected.length > 4) throw new AppError("service", "Choose at least one service.");
  const ids = selected.map((item) => item.serviceId);
  if (new Set(ids).size !== ids.length) throw new AppError("service", "Choose each service once.");
  const available = await getPublicServices();
  const lines: QuoteLine[] = [];
  const snapshots = [] as Array<{ serviceId: string; serviceName: string; categoryName: string; price: number; durationMinutes: number; imageUrl: string | null; depositAmount: number | null; addons: Array<{ addonId: string; addonName: string; pricingType: "fixed" | "quantity"; unitPrice: number; quantity: number; lineTotal: number }> }>;
  for (const item of selected) {
    const service = available.find((candidate) => candidate.id === item.serviceId);
    if (!service?.bookingEnabled) throw new AppError("service", "That service isn't available to book. Choose another.");
    const price = priceForDate(service, date);
    const addons = item.addons.map((choice) => {
      const addon = service.addons.find((candidate) => candidate.id === choice.addonId);
      if (!addon) throw new AppError("addon", "That add-on is no longer available.");
      if (choice.quantity < 1 || choice.quantity > addon.maxQuantity) throw new AppError("addon", `Choose between 1 and ${addon.maxQuantity} for ${addon.name}.`);
      const quantity = addon.pricingType === "quantity" ? choice.quantity : 1;
      return { addonId: addon.id, addonName: addon.name, pricingType: addon.pricingType, unitPrice: addon.price, quantity, lineTotal: addonLineTotal(addon.pricingType, addon.price, quantity) };
    });
    lines.push({ serviceId: service.id, name: service.name, price, durationMinutes: service.durationMinutes, imageUrl: service.imageUrl, addons: addons.map((addon) => ({ name: addon.addonName, quantity: addon.quantity, lineTotal: addon.lineTotal })) });
    snapshots.push({ serviceId: service.id, serviceName: service.name, categoryName: service.categoryName, price, durationMinutes: service.durationMinutes, imageUrl: service.imageUrl, depositAmount: service.depositAmount, addons });
  }
  const total = roundMoney(snapshots.reduce((sum, line) => sum + line.price + line.addons.reduce((addonSum, addon) => addonSum + addon.lineTotal, 0), 0));
  const duration = snapshots.reduce((sum, line) => sum + line.durationMinutes, 0);
  const deposit = Math.min(total, roundMoney(snapshots.reduce((sum, line) => sum + (line.depositAmount ?? 0), 0)));
  return { lines, snapshots, total, duration, deposit };
}

function validateRange(from: string, to: string) {
  if (!isValidDateString(from) || !isValidDateString(to) || from > to) throw new AppError("date", "Choose a valid date.");
  if (eachDate(from, to).length > 62) throw new AppError("date", "Choose a shorter range.");
}

async function daysForRange(input: { from: string; to: string; duration: number; timezone: string; step: number; minNotice: number; excludeBookingId?: string; now?: Date }): Promise<DayAvailability[]> {
  const today = todayInTimeZone(input.timezone, input.now);
  const nowMinutes = nowMinutesInTimeZone(input.timezone, input.now);
  const [hours, breaks, blocks, bookingMap] = await Promise.all([allDocuments<Hour>("businessHours"), allDocuments<Break>("businessBreaks"), allDocuments<Block>("availabilityBlocks"), occupyingIntervals(input.from, input.to, input.excludeBookingId)]);
  const hourMap = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));
  return eachDate(input.from, input.to).map((date) => {
    const weekday = weekdayFromDateString(date);
    const hour = hourMap.get(weekday);
    const dayBreaks: Interval[] = breaks.filter((item) => item.dayOfWeek === weekday).map((item) => ({ start: timeToMinutes(item.startTime), end: timeToMinutes(item.endTime) }));
    const dayBlocks = blocks.filter((block) => block.blockDate === date);
    const allDayBlocked = dayBlocks.some((block) => block.allDay || !block.startTime || !block.endTime);
    const blockIntervals: Interval[] = dayBlocks.filter((block) => !block.allDay && block.startTime && block.endTime).map((block) => ({ start: timeToMinutes(block.startTime!), end: timeToMinutes(block.endTime!) }));
    const isOpen = Boolean(hour?.isOpen);
    const slots = date < today || !isOpen || allDayBlocked || !hour ? [] : generateSlots({ openTime: hour.openTime, closeTime: hour.closeTime, durationMinutes: input.duration, stepMinutes: input.step, breaks: dayBreaks, blocks: blockIntervals, bookings: bookingMap.get(date) ?? [], earliestStart: date === today ? nowMinutes + input.minNotice : null });
    return { date, weekday, status: classifyDay({ date, today, isOpen, allDayBlocked, slots }), slots };
  });
}

async function occupyingIntervals(from: string, to: string, excludeBookingId?: string) {
  const rows = await allDocuments<Booking>("bookings");
  const map = new Map<string, Interval[]>();
  rows.filter((row) => row.bookingDate >= from && row.bookingDate <= to && OCCUPYING.has(row.status) && row.id !== excludeBookingId).forEach((row) => {
    const list = map.get(row.bookingDate) ?? [];
    list.push({ start: timeToMinutes(row.startTime), end: timeToMinutes(row.endTime) });
    map.set(row.bookingDate, list);
  });
  return map;
}

export async function upcomingOpenDays(limit = 4) {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const services = (await getPublicServices()).filter((service) => service.bookingEnabled);
  const duration = services.length ? Math.min(...services.map((service) => service.durationMinutes)) : 45;
  const days = await daysForRange({ from: today, to: addDaysToDateString(today, 13), duration, timezone: settings.timezone, step: settings.slotIntervalMinutes, minNotice: settings.minNoticeMinutes });
  return days.filter((day) => day.status === "available").slice(0, limit);
}
