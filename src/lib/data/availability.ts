import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  availabilityBlocks,
  bookings,
  businessBreaks,
  businessHours,
  services,
  specials,
  serviceAddons,
  serviceCategories,
} from "@/db/schema";
import { AppError } from "@/lib/errors";
import { addonLineTotal, resolveServicePrice, roundMoney } from "@/lib/booking/pricing";
import { classifyDay, generateSlots, slotTakenByBooking } from "@/lib/booking/slots";
import { addMinutesToTime, clock, timeToMinutes, type Interval } from "@/lib/booking/time";
import { addDaysToDateString, eachDate, isValidDateString, nowMinutesInTimeZone, todayInTimeZone, weekdayFromDateString } from "@/lib/dates";
import type { DayAvailability, Quote, QuoteLine, SelectedService } from "@/types/domain";
import { getSettingsRow } from "./public";

const OCCUPYING = ["pending", "confirmed", "rescheduled", "completed", "no_show"] as const;
type Database = Pick<typeof db, "select">;

export async function getAvailability(input: {
  from: string;
  to: string;
  serviceIds: string[];
  excludeBookingId?: string;
}): Promise<{ days: DayAvailability[]; duration: number; timezone: string }> {
  const settings = await getSettingsRow();
  if (!isValidDateString(input.from) || !isValidDateString(input.to) || input.from > input.to) {
    throw new AppError("date", "Choose a valid date.");
  }
  if (eachDate(input.from, input.to).length > 62) {
    throw new AppError("date", "Choose a shorter range.");
  }
  const uniqueIds = [...new Set(input.serviceIds)];
  if (!uniqueIds.length) throw new AppError("service", "Choose a service first.");
  const duration = await durationForServices(uniqueIds);
  const days = await daysForRange({
    database: db,
    from: input.from,
    to: input.to,
    duration,
    timezone: settings.timezone,
    step: settings.slotIntervalMinutes,
    minNotice: settings.minNoticeMinutes,
    excludeBookingId: input.excludeBookingId,
  });
  return { days, duration, timezone: settings.timezone };
}

export async function getDurationAvailability(input: {
  from: string;
  to: string;
  duration: number;
  excludeBookingId?: string;
}) {
  const settings = await getSettingsRow();
  if (!isValidDateString(input.from) || !isValidDateString(input.to) || input.from > input.to) {
    throw new AppError("date", "Choose a valid date.");
  }
  if (input.duration < 15 || input.duration > 600) throw new AppError("duration", "That appointment length is not valid.");
  const days = await daysForRange({
    database: db,
    from: input.from,
    to: input.to,
    duration: input.duration,
    timezone: settings.timezone,
    step: settings.slotIntervalMinutes,
    minNotice: 0,
    excludeBookingId: input.excludeBookingId,
  });
  return { days, duration: input.duration, timezone: settings.timezone };
}

export async function quoteAppointment(input: {
  services: SelectedService[];
  date?: string;
  startTime?: string;
}): Promise<Quote> {
  const settings = await getSettingsRow();
  const date = input.date && isValidDateString(input.date) ? input.date : todayInTimeZone(settings.timezone);
  const built = await buildLines(db, input.services, date);
  return {
    lines: built.lines,
    total: built.total,
    duration: built.duration,
    deposit: built.deposit,
    endTime: input.startTime ? addMinutesToTime(input.startTime, built.duration) : null,
    currencySymbol: settings.currencySymbol,
  };
}

export async function assertSlotOpen(database: Database, input: {
  date: string;
  startTime: string;
  duration: number;
  timezone: string;
  step: number;
  minNotice: number;
  excludeBookingId?: string;
}) {
  const today = todayInTimeZone(input.timezone);
  if (!isValidDateString(input.date)) throw new AppError("date", "Choose a valid date.");
  if (input.date < today) throw new AppError("past", "That date has passed. Choose another day.");
  if (input.date > addDaysToDateString(today, 120)) {
    throw new AppError("date", "That date is too far ahead. Choose a closer day.");
  }
  const [day] = await daysForRange({
    database,
    from: input.date,
    to: input.date,
    duration: input.duration,
    timezone: input.timezone,
    step: input.step,
    minNotice: input.minNotice,
    excludeBookingId: input.excludeBookingId,
  });
  if (!day || day.status === "closed") throw new AppError("closed", "Entranced Beauty is closed that day.");
  if (day.status === "blocked" || day.status === "past") {
    throw new AppError("date", "That date isn't available. Choose another day.");
  }
  if (!day.slots.includes(input.startTime)) {
    const bookingsForDay = await occupyingIntervals(database, input.date, input.date, input.excludeBookingId);
    if (slotTakenByBooking(input.startTime, input.duration, bookingsForDay.get(input.date) ?? [])) {
      throw new AppError("slot_taken", "That time was just booked. Please choose another available time.", 409);
    }
    throw new AppError("unavailable", "That time isn't available. Please choose another.");
  }
}

async function durationForServices(serviceIds: string[]): Promise<number> {
  const rows = await db.select().from(services).where(inArray(services.id, serviceIds));
  if (rows.length !== serviceIds.length || rows.some((service) => !service.active || !service.bookingEnabled)) {
    throw new AppError("service", "That service isn't available to book. Choose another.");
  }
  return rows.reduce((sum, service) => sum + service.durationMinutes, 0);
}

export async function buildLines(database: Database, selected: SelectedService[], date: string) {
  if (selected.length < 1 || selected.length > 4) {
    throw new AppError("service", "Choose at least one service.");
  }
  const ids = selected.map((item) => item.serviceId);
  if (new Set(ids).size !== ids.length) throw new AppError("service", "Choose each service once.");
  const serviceRows = await database.select().from(services).where(inArray(services.id, ids));
  const categoryRows = await database.select().from(serviceCategories);
  const categories = new Map(categoryRows.map((category) => [category.id, category]));
  const addonRows = await database.select().from(serviceAddons).where(inArray(serviceAddons.serviceId, ids));
  const specialRows = await database.select().from(specials).where(inArray(specials.serviceId, ids));
  const byId = new Map(serviceRows.map((service) => [service.id, service]));

  const lines: QuoteLine[] = [];
  const snapshots: {
    serviceId: string;
    serviceName: string;
    categoryName: string;
    price: number;
    durationMinutes: number;
    imageUrl: string | null;
    depositAmount: number | null;
    addons: {
      addonId: string;
      addonName: string;
      pricingType: "fixed" | "quantity";
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }[];
  }[] = [];

  for (const [index, item] of selected.entries()) {
    const service = byId.get(item.serviceId);
    const category = service ? categories.get(service.categoryId) : undefined;
    if (!service || !category || !service.active || !category.active || !service.bookingEnabled) {
      throw new AppError("service", "That service isn't available to book. Choose another.");
    }
    const special = specialRows.find((row) => row.serviceId === service.id) ?? null;
    const price = resolveServicePrice(service.price, special, date);
    const addons = item.addons.map((choice) => {
      const addon = addonRows.find((row) => row.id === choice.addonId && row.serviceId === service.id && row.active);
      if (!addon) throw new AppError("addon", "That add-on is no longer available.");
      if (choice.quantity < 1 || choice.quantity > addon.maxQuantity) {
        throw new AppError("addon", `Choose between 1 and ${addon.maxQuantity} for ${addon.name}.`);
      }
      const quantity = addon.pricingType === "quantity" ? choice.quantity : 1;
      return {
        addonId: addon.id,
        addonName: addon.name,
        pricingType: addon.pricingType,
        unitPrice: addon.price,
        quantity,
        lineTotal: addonLineTotal(addon.pricingType, addon.price, quantity),
      };
    });
    lines.push({
      serviceId: service.id,
      name: service.name,
      price,
      durationMinutes: service.durationMinutes,
      imageUrl: service.imageUrl,
      addons: addons.map((addon) => ({ name: addon.addonName, quantity: addon.quantity, lineTotal: addon.lineTotal })),
    });
    snapshots.push({
      serviceId: service.id,
      serviceName: service.name,
      categoryName: category.name,
      price,
      durationMinutes: service.durationMinutes,
      imageUrl: service.imageUrl,
      depositAmount: service.depositAmount,
      addons,
    });
    void index;
  }

  const total = roundMoney(
    snapshots.reduce((sum, line) => sum + line.price + line.addons.reduce((addonSum, addon) => addonSum + addon.lineTotal, 0), 0),
  );
  const duration = snapshots.reduce((sum, line) => sum + line.durationMinutes, 0);
  const deposit = Math.min(
    total,
    roundMoney(snapshots.reduce((sum, line) => sum + (line.depositAmount ?? 0), 0)),
  );
  return { lines, snapshots, total, duration, deposit };
}

async function daysForRange(input: {
  database: Database;
  from: string;
  to: string;
  duration: number;
  timezone: string;
  step: number;
  minNotice: number;
  excludeBookingId?: string;
  now?: Date;
}): Promise<DayAvailability[]> {
  const today = todayInTimeZone(input.timezone, input.now);
  const nowMinutes = nowMinutesInTimeZone(input.timezone, input.now);
  const hours = await input.database.select().from(businessHours);
  const breaks = await input.database.select().from(businessBreaks);
  const blocks = await input.database
    .select()
    .from(availabilityBlocks)
    .where(and(gte(availabilityBlocks.blockDate, input.from), lte(availabilityBlocks.blockDate, input.to)));
  const bookingMap = await occupyingIntervals(input.database, input.from, input.to, input.excludeBookingId);
  const hourMap = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));

  return eachDate(input.from, input.to).map((date) => {
    const weekday = weekdayFromDateString(date);
    const hour = hourMap.get(weekday);
    const dayBreaks: Interval[] = breaks
      .filter((item) => item.dayOfWeek === weekday)
      .map((item) => ({ start: timeToMinutes(item.startTime), end: timeToMinutes(item.endTime) }));
    const dayBlocks = blocks.filter((block) => block.blockDate === date);
    const allDayBlocked = dayBlocks.some((block) => block.allDay || !block.startTime || !block.endTime);
    const blockIntervals: Interval[] = dayBlocks
      .filter((block) => !block.allDay && block.startTime && block.endTime)
      .map((block) => ({ start: timeToMinutes(block.startTime!), end: timeToMinutes(block.endTime!) }));
    const isOpen = Boolean(hour?.isOpen);
    const slots =
      date < today || !isOpen || allDayBlocked || !hour
        ? []
        : generateSlots({
            openTime: clock(hour.openTime),
            closeTime: clock(hour.closeTime),
            durationMinutes: input.duration,
            stepMinutes: input.step,
            breaks: dayBreaks,
            blocks: blockIntervals,
            bookings: bookingMap.get(date) ?? [],
            earliestStart: date === today ? nowMinutes + input.minNotice : null,
          });
    return {
      date,
      weekday,
      status: classifyDay({ date, today, isOpen, allDayBlocked, slots }),
      slots,
    };
  });
}

async function occupyingIntervals(database: Database, from: string, to: string, excludeBookingId?: string) {
  const filters = [
    gte(bookings.bookingDate, from),
    lte(bookings.bookingDate, to),
    inArray(bookings.status, [...OCCUPYING]),
  ];
  if (excludeBookingId) filters.push(ne(bookings.id, excludeBookingId));
  const rows = await database
    .select({
      date: bookings.bookingDate,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
    })
    .from(bookings)
    .where(and(...filters));
  const map = new Map<string, Interval[]>();
  for (const row of rows) {
    const list = map.get(row.date) ?? [];
    list.push({ start: timeToMinutes(row.startTime), end: timeToMinutes(row.endTime) });
    map.set(row.date, list);
  }
  return map;
}

export async function upcomingOpenDays(limit = 4) {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const from = today;
  const to = addDaysToDateString(today, 13);
  const shortest = await db
    .select({ duration: services.durationMinutes })
    .from(services)
    .where(and(eq(services.active, true), eq(services.bookingEnabled, true)));
  const duration = shortest.length ? Math.min(...shortest.map((row) => row.duration)) : 45;
  const days = await daysForRange({
    database: db,
    from,
    to,
    duration,
    timezone: settings.timezone,
    step: settings.slotIntervalMinutes,
    minNotice: settings.minNoticeMinutes,
  });
  return days.filter((day) => day.status === "available").slice(0, limit);
}
