import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
  availabilityBlocks,
  bookingAddons,
  bookingImages,
  bookingServices,
  bookings,
  businessBreaks,
  businessHours,
  businessSettings,
  portfolioItems,
  serviceAddons,
  serviceCategories,
  services,
  specials,
} from "@/db/schema";
import { whatsappHref, formatNamibianPhone, normalizeNamibianPhone } from "@/lib/booking/phone";
import { addMinutesToTime, clock, isValidClock } from "@/lib/booking/time";
import { formatAppointmentDate, todayInTimeZone } from "@/lib/dates";
import { ensureSeed } from "@/db/seed";
import { AppError } from "@/lib/errors";
import { verifyPassword } from "@/lib/auth";
import {
  addonInputSchema,
  blockInputSchema,
  breaksInputSchema,
  categoryInputSchema,
  hoursInputSchema,
  portfolioInputSchema,
  rescheduleInputSchema,
  serviceInputSchema,
  settingsInputSchema,
  slugify,
  specialInputSchema,
  statusInputSchema,
} from "@/lib/validation";
import type { AdminBooking, BookingStatus } from "@/types/domain";
import { assertSlotOpen } from "./availability";
import { getSettingsRow } from "./public";

export async function authenticateAdmin(email: string, password: string) {
  await ensureSeed();
  const [admin] = await db.select().from(admins).where(eq(admins.email, email.trim().toLowerCase())).limit(1);
  if (!admin || !verifyPassword(password, admin.passwordHash)) return null;
  return admin;
}

export async function listAdminBookings(filter: string): Promise<AdminBooking[]> {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const where = bookingFilter(filter, today);
  const rows = await db.select().from(bookings).where(where).orderBy(asc(bookings.bookingDate), asc(bookings.startTime));
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const serviceRows = await db.select().from(bookingServices).where(inArray(bookingServices.bookingId, ids)).orderBy(asc(bookingServices.sortOrder));
  const addonRows = await db.select().from(bookingAddons).where(inArray(bookingAddons.bookingId, ids));
  const images = await db.select().from(bookingImages).where(inArray(bookingImages.bookingId, ids));
  return rows.map((row) => {
    const lines = serviceRows.filter((service) => service.bookingId === row.id);
    const duration = lines.reduce((sum, line) => sum + line.durationMinutes, 0);
    return {
      id: row.id,
      reference: row.reference,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      phoneDisplay: formatNamibianPhone(row.clientPhone),
      date: row.bookingDate,
      dateLabel: formatAppointmentDate(row.bookingDate, settings.timezone),
      startTime: clock(row.startTime),
      endTime: clock(row.endTime),
      status: row.status,
      notes: row.notes,
      total: row.estimatedTotal,
      deposit: row.depositAmount,
      duration,
      currencySymbol: settings.currencySymbol,
      imageId: images.find((image) => image.bookingId === row.id)?.id ?? null,
      whatsappUrl: whatsappHref(
        row.clientPhone,
        `Hi ${row.clientName}, this is Entranced Beauty about your booking ${row.reference}.`,
      ),
      services: lines.map((line) => ({
        name: line.serviceName,
        price: line.priceSnapshot,
        durationMinutes: line.durationMinutes,
        addons: addonRows
          .filter((addon) => addon.bookingServiceId === line.id)
          .map((addon) => ({ name: addon.addonName, quantity: addon.quantity, lineTotal: addon.lineTotal })),
      })),
    };
  });
}

function bookingFilter(filter: string, today: string) {
  if (filter === "today") return eq(bookings.bookingDate, today);
  if (filter === "upcoming") {
    return and(gte(bookings.bookingDate, today), inArray(bookings.status, ["pending", "confirmed", "rescheduled"]));
  }
  if (filter === "confirmed") return inArray(bookings.status, ["confirmed", "rescheduled"]);
  if (filter === "completed") return inArray(bookings.status, ["completed", "no_show"]);
  if (filter === "cancelled") return inArray(bookings.status, ["cancelled", "rejected"]);
  return eq(bookings.status, "pending");
}

export async function updateBookingStatus(id: string, raw: unknown) {
  const parsed = statusInputSchema.parse(raw);
  const [row] = await db
    .update(bookings)
    .set({ status: parsed.status, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();
  if (!row) throw new AppError("missing", "That booking could not be found.", 404);
  return { id: row.id, status: row.status as BookingStatus };
}

export async function rescheduleBooking(id: string, raw: unknown) {
  const parsed = rescheduleInputSchema.parse(raw);
  if (!isValidClock(parsed.startTime)) throw new AppError("time", "Choose a valid time.");
  const settings = await getSettingsRow();
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(4812, hashtext(${parsed.date}))`);
    const [booking] = await tx.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!booking) throw new AppError("missing", "That booking could not be found.", 404);
    const lines = await tx.select().from(bookingServices).where(eq(bookingServices.bookingId, id));
    const duration = lines.reduce((sum, line) => sum + line.durationMinutes, 0) || 30;
    await assertSlotOpen(tx, {
      date: parsed.date,
      startTime: parsed.startTime,
      duration,
      timezone: settings.timezone,
      step: settings.slotIntervalMinutes,
      minNotice: 0,
      excludeBookingId: id,
    });
    await tx
      .update(bookings)
      .set({
        bookingDate: parsed.date,
        startTime: parsed.startTime,
        endTime: addMinutesToTime(parsed.startTime, duration),
        status: "rescheduled",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));
  });
}

export async function getAdminCatalog() {
  await getSettingsRow();
  const categories = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sortOrder));
  const serviceRows = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.name));
  const addons = await db.select().from(serviceAddons).orderBy(asc(serviceAddons.sortOrder));
  return { categories, services: serviceRows, addons };
}

async function uniqueServiceSlug(name: string, currentId?: string) {
  const base = slugify(name) || "service";
  let slug = base;
  let n = 1;
  while (true) {
    const [found] = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug)).limit(1);
    if (!found || found.id === currentId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function createCategory(raw: unknown) {
  const parsed = categoryInputSchema.parse(raw);
  const base = slugify(parsed.name) || "category";
  let slug = base;
  let n = 1;
  while (true) {
    const [found] = await db.select({ id: serviceCategories.id }).from(serviceCategories).where(eq(serviceCategories.slug, slug)).limit(1);
    if (!found) break;
    n += 1;
    slug = `${base}-${n}`;
  }
  const [row] = await db.insert(serviceCategories).values({ name: parsed.name, slug, sortOrder: 10 }).returning();
  return row;
}

export async function createService(raw: unknown) {
  const parsed = serviceInputSchema.parse(raw);
  const slug = await uniqueServiceSlug(parsed.name);
  const [row] = await db
    .insert(services)
    .values({
      ...parsed,
      slug,
      imageUrl: parsed.imageUrl || null,
      preparationNotes: parsed.preparationNotes || null,
    })
    .returning();
  return row;
}

export async function updateService(id: string, raw: unknown) {
  const parsed = serviceInputSchema.parse(raw);
  const slug = await uniqueServiceSlug(parsed.name, id);
  const [row] = await db
    .update(services)
    .set({
      ...parsed,
      slug,
      imageUrl: parsed.imageUrl || null,
      preparationNotes: parsed.preparationNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id))
    .returning();
  if (!row) throw new AppError("missing", "That service could not be found.", 404);
  return row;
}

export async function archiveService(id: string) {
  const used = await db.select({ id: bookingServices.id }).from(bookingServices).where(eq(bookingServices.serviceId, id)).limit(1);
  if (used.length) {
    await db.update(services).set({ active: false, bookingEnabled: false, updatedAt: new Date() }).where(eq(services.id, id));
    return { archived: true };
  }
  await db.delete(services).where(eq(services.id, id));
  return { archived: false };
}

export async function saveAddon(raw: unknown, id?: string) {
  const parsed = addonInputSchema.parse(raw);
  if (id) {
    const [row] = await db.update(serviceAddons).set(parsed).where(eq(serviceAddons.id, id)).returning();
    if (!row) throw new AppError("missing", "That add-on could not be found.", 404);
    return row;
  }
  const [row] = await db.insert(serviceAddons).values(parsed).returning();
  return row;
}

export async function removeAddon(id: string) {
  await db.delete(serviceAddons).where(eq(serviceAddons.id, id));
}

export async function saveHours(raw: unknown) {
  const parsed = hoursInputSchema.parse(raw);
  for (const day of parsed.days) {
    if (day.isOpen && timeOrder(day.openTime, day.closeTime) >= 0) {
      throw new AppError("hours", "Closing time has to be after opening time.");
    }
    await db
      .insert(businessHours)
      .values(day)
      .onConflictDoUpdate({
        target: businessHours.dayOfWeek,
        set: { isOpen: day.isOpen, openTime: day.openTime, closeTime: day.closeTime },
      });
  }
}

export async function saveBreaks(raw: unknown) {
  const parsed = breaksInputSchema.parse(raw);
  for (const item of parsed.breaks) {
    if (timeOrder(item.startTime, item.endTime) >= 0) throw new AppError("hours", "Break end has to be after the start.");
  }
  await db.transaction(async (tx) => {
    await tx.delete(businessBreaks);
    if (parsed.breaks.length) await tx.insert(businessBreaks).values(parsed.breaks);
  });
}

export async function createBlock(raw: unknown) {
  const parsed = blockInputSchema.parse(raw);
  if (!parsed.allDay) {
    if (!parsed.startTime || !parsed.endTime || timeOrder(parsed.startTime, parsed.endTime) >= 0) {
      throw new AppError("block", "Add a start and end for the blocked time.");
    }
  }
  const [row] = await db.insert(availabilityBlocks).values(parsed).returning();
  return row;
}

export async function deleteBlock(id: string) {
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
}

export async function listBlocks() {
  await getSettingsRow();
  return db.select().from(availabilityBlocks).orderBy(desc(availabilityBlocks.blockDate));
}

export async function listPortfolioAdmin() {
  await getSettingsRow();
  return db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder));
}

export async function savePortfolio(raw: unknown, id?: string) {
  const parsed = portfolioInputSchema.parse(raw);
  if (id) {
    const [row] = await db.update(portfolioItems).set(parsed).where(eq(portfolioItems.id, id)).returning();
    if (!row) throw new AppError("missing", "That photo could not be found.", 404);
    return row;
  }
  const [row] = await db.insert(portfolioItems).values(parsed).returning();
  return row;
}

export async function deletePortfolio(id: string) {
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
}

export async function listSpecialsAdmin() {
  await getSettingsRow();
  return db.select().from(specials).orderBy(desc(specials.startDate));
}

export async function saveSpecial(raw: unknown, id?: string) {
  const parsed = specialInputSchema.parse(raw);
  if (parsed.endDate < parsed.startDate) throw new AppError("special", "The end date has to be after the start.");
  const values = { ...parsed, imageUrl: parsed.imageUrl || null };
  if (id) {
    const [row] = await db.update(specials).set(values).where(eq(specials.id, id)).returning();
    if (!row) throw new AppError("missing", "That special could not be found.", 404);
    return row;
  }
  const [row] = await db.insert(specials).values(values).returning();
  return row;
}

export async function deleteSpecial(id: string) {
  await db.delete(specials).where(eq(specials.id, id));
}

export async function saveSettings(raw: unknown) {
  const parsed = settingsInputSchema.parse(raw);
  const phone = normalizeNamibianPhone(parsed.phone);
  const whatsapp = normalizeNamibianPhone(parsed.whatsapp);
  if (!phone || !whatsapp) throw new AppError("phone", "Use Namibian numbers for the studio phone and WhatsApp.");
  const current = await getSettingsRow();
  await db
    .update(businessSettings)
    .set({
      ...parsed,
      phone,
      whatsapp,
      instagram: parsed.instagram.replace(/^@/, ""),
      updatedAt: new Date(),
    })
    .where(eq(businessSettings.id, current.id));
}

export async function getInspiration(id: string) {
  const [image] = await db.select().from(bookingImages).where(eq(bookingImages.id, id)).limit(1);
  return image ?? null;
}

export async function counts() {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const rows = await db.select({ status: bookings.status, date: bookings.bookingDate }).from(bookings);
  return {
    today: rows.filter((row) => row.date === today).length,
    upcoming: rows.filter((row) => row.date >= today && ["pending", "confirmed", "rescheduled"].includes(row.status)).length,
    pending: rows.filter((row) => row.status === "pending").length,
    confirmed: rows.filter((row) => row.status === "confirmed" || row.status === "rescheduled").length,
    completed: rows.filter((row) => row.status === "completed" || row.status === "no_show").length,
    cancelled: rows.filter((row) => row.status === "cancelled" || row.status === "rejected").length,
  };
}

function timeOrder(start: string, end: string) {
  return start.localeCompare(end);
}
