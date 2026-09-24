import { unlink } from "fs/promises";
import path from "path";
import { eq, like } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { bookingAddons, bookingImages, bookingServices, bookings, services } from "@/db/schema";
import { whatsappHref, normalizeNamibianPhone } from "@/lib/booking/phone";
import { makeReference } from "@/lib/booking/reference";
import { addMinutesToTime } from "@/lib/booking/time";
import { formatAppointmentDate, todayInTimeZone } from "@/lib/dates";
import { AppError } from "@/lib/errors";
import { saveInspiration } from "@/lib/images";
import { bookingPayloadSchema } from "@/lib/validation";
import type { BookingReceipt } from "@/types/domain";
import { assertSlotOpen, buildLines } from "./availability";
import { getSettingsRow } from "./public";
import { notifyOwner } from "@/lib/push";

export async function createBooking(raw: unknown, image?: Buffer | null): Promise<BookingReceipt> {
  const parsed = bookingPayloadSchema.parse(raw);
  const phone = normalizeNamibianPhone(parsed.clientPhone);
  if (!phone) throw new AppError("phone", "Enter a Namibian number, like 081 123 4567.");
  const settings = await getSettingsRow();
  let savedFile: string | null = null;

  try {
    const receipt = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(4812, hashtext(${parsed.date}))`);
      const built = await buildLines(tx, parsed.services, parsed.date);
      const flags = await tx.select({ id: services.id, requiresInspiration: services.requiresInspiration }).from(services);
      if (
        flags.some((service) => parsed.services.some((item) => item.serviceId === service.id) && service.requiresInspiration) &&
        !image
      ) {
        throw new AppError("inspiration", "Add an inspiration photo for this service.");
      }
      await assertSlotOpen(tx, {
        date: parsed.date,
        startTime: parsed.startTime,
        duration: built.duration,
        timezone: settings.timezone,
        step: settings.slotIntervalMinutes,
        minNotice: settings.minNoticeMinutes,
      });

      const createdOn = todayInTimeZone(settings.timezone);
      const prefix = makeReference(createdOn, 1).slice(0, 9);
      const existing = await tx.select({ reference: bookings.reference }).from(bookings).where(like(bookings.reference, `${prefix}%`));
      const used = new Set(existing.map((row) => row.reference));
      let sequence = existing.length + 1;
      let reference = makeReference(createdOn, sequence);
      while (used.has(reference)) {
        sequence += 1;
        reference = makeReference(createdOn, sequence);
      }

      const endTime = addMinutesToTime(parsed.startTime, built.duration);
      const [booking] = await tx
        .insert(bookings)
        .values({
          reference,
          clientName: parsed.clientName.trim(),
          clientPhone: phone,
          bookingDate: parsed.date,
          startTime: parsed.startTime,
          endTime,
          status: "pending",
          notes: parsed.notes ? parsed.notes : null,
          estimatedTotal: built.total,
          depositAmount: built.deposit > 0 ? built.deposit : null,
        })
        .returning();

      for (const [index, line] of built.snapshots.entries()) {
        const [savedService] = await tx
          .insert(bookingServices)
          .values({
            bookingId: booking.id,
            serviceId: line.serviceId,
            serviceName: line.serviceName,
            categoryName: line.categoryName,
            priceSnapshot: line.price,
            durationMinutes: line.durationMinutes,
            imageUrl: line.imageUrl,
            sortOrder: index,
          })
          .returning();
        if (line.addons.length) {
          await tx.insert(bookingAddons).values(
            line.addons.map((addon) => ({
              bookingId: booking.id,
              bookingServiceId: savedService.id,
              addonId: addon.addonId,
              addonName: addon.addonName,
              pricingType: addon.pricingType,
              unitPrice: addon.unitPrice,
              quantity: addon.quantity,
              lineTotal: addon.lineTotal,
            })),
          );
        }
      }

      if (image) {
        const saved = await saveInspiration(image);
        savedFile = saved.fileName;
        await tx.insert(bookingImages).values({
          bookingId: booking.id,
          fileName: saved.fileName,
          mimeType: saved.mimeType,
        });
      }

      const dateLabel = formatAppointmentDate(parsed.date, settings.timezone);
      const names = built.lines.map((line) => line.name).join(" + ");
      return {
        reference,
        clientName: parsed.clientName.trim(),
        date: parsed.date,
        dateLabel,
        startTime: parsed.startTime,
        endTime,
        services: built.lines,
        total: built.total,
        deposit: built.deposit,
        duration: built.duration,
        currencySymbol: settings.currencySymbol,
        location: settings.locationText,
        businessName: settings.businessName,
        whatsappUrl: whatsappHref(
          settings.whatsapp,
          `Hi Entranced Beauty, I just submitted booking ${reference} for ${names} on ${dateLabel} at ${parsed.startTime}.`,
        ),
      };
    });
    void notifyOwner({ title: "New booking request", body: `${receipt.clientName} · ${receipt.dateLabel} at ${receipt.startTime}`, url: "/admin" });
    return receipt;
  } catch (error) {
    if (savedFile) {
      await unlink(path.join(process.cwd(), "storage", "inspiration", savedFile)).catch(() => undefined);
    }
    if (error instanceof Error && error.name === "ZodError") {
      throw new AppError("validation", "Check the booking details and try again.");
    }
    throw error;
  }
}
