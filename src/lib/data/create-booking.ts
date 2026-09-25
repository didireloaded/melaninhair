import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { whatsappHref, normalizeNamibianPhone } from "@/lib/booking/phone";
import { makeReference } from "@/lib/booking/reference";
import { addMinutesToTime, timeToMinutes } from "@/lib/booking/time";
import { formatAppointmentDate, todayInTimeZone } from "@/lib/dates";
import { AppError } from "@/lib/errors";
import { getFirebaseAdminFirestore, getFirebaseAdminStorage } from "@/lib/firebase/admin";
import { detectImage } from "@/lib/images";
import { bookingPayloadSchema } from "@/lib/validation";
import type { BookingReceipt } from "@/types/domain";
import { assertSlotOpen, buildLines } from "./availability";
import { getPublicServices, getSettingsRow } from "./public";
import { notifyOwner } from "@/lib/push";

const OCCUPYING = new Set(["pending", "confirmed", "rescheduled", "completed", "no_show"]);

export async function createBooking(raw: unknown, image?: Buffer | null, userId?: string): Promise<BookingReceipt> {
  const parsed = bookingPayloadSchema.parse(raw);
  const phone = normalizeNamibianPhone(parsed.clientPhone);
  if (!phone) throw new AppError("phone", "Enter a Namibian number, like 081 123 4567.");
  const settings = await getSettingsRow();
  const [built, publicServices] = await Promise.all([buildLines(null, parsed.services, parsed.date), getPublicServices()]);
  const needsImage = publicServices.some((service) => parsed.services.some((item) => item.serviceId === service.id) && service.requiresInspiration);
  if (needsImage && !image) throw new AppError("inspiration", "Add an inspiration photo for this service.");
  await assertSlotOpen(null, { date: parsed.date, startTime: parsed.startTime, duration: built.duration, timezone: settings.timezone, step: settings.slotIntervalMinutes, minNotice: settings.minNoticeMinutes });

  const firestore = getFirebaseAdminFirestore();
  const bookingId = randomUUID();
  const endTime = addMinutesToTime(parsed.startTime, built.duration);
  let imagePath: string | null = null;
  let imageMimeType: string | null = null;
  if (image) {
    imageMimeType = detectImage(image);
    if (!imageMimeType) throw new AppError("image", "Use a JPG, PNG or WEBP photo.");
    if (image.length > 3_500_000) throw new AppError("image", "That photo is too large. Try a smaller one.");
    imagePath = `inspiration/${bookingId}`;
    await getFirebaseAdminStorage().file(imagePath).save(image, { resumable: false, metadata: { contentType: imageMimeType, cacheControl: "private, no-store" } });
  }

  try {
    const reference = await firestore.runTransaction(async (transaction) => {
      const query = firestore.collection("bookings").where("bookingDate", "==", parsed.date);
      const [bookingsForDay, counter] = await Promise.all([
        transaction.get(query),
        transaction.get(firestore.collection("bookingCounters").doc(todayInTimeZone(settings.timezone))),
      ]);
      const start = timeToMinutes(parsed.startTime);
      const end = timeToMinutes(endTime);
      const collision = bookingsForDay.docs.some((document) => {
        const booking = document.data() as { status?: string; startTime?: string; endTime?: string };
        return Boolean(booking.status && OCCUPYING.has(booking.status) && booking.startTime && booking.endTime && start < timeToMinutes(booking.endTime) && end > timeToMinutes(booking.startTime));
      });
      if (collision) throw new AppError("slot_taken", "That time was just booked. Please choose another available time.", 409);
      const sequence = Number(counter.data()?.sequence ?? 0) + 1;
      const reference = makeReference(todayInTimeZone(settings.timezone), sequence);
      transaction.set(counter.ref, { sequence, updatedAt: FieldValue.serverTimestamp() });
      transaction.create(firestore.collection("bookings").doc(bookingId), {
        reference, userId: userId ?? null, clientName: parsed.clientName.trim(), clientPhone: phone,
        bookingDate: parsed.date, startTime: parsed.startTime, endTime, status: "pending",
        notes: parsed.notes || null, estimatedTotal: built.total, depositAmount: built.deposit > 0 ? built.deposit : null,
        services: built.snapshots, imagePath, imageMimeType,
        createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      });
      return reference;
    });
    const dateLabel = formatAppointmentDate(parsed.date, settings.timezone);
    const names = built.lines.map((line) => line.name).join(" + ");
    const receipt: BookingReceipt = {
      reference, clientName: parsed.clientName.trim(), date: parsed.date, dateLabel,
      startTime: parsed.startTime, endTime, services: built.lines, total: built.total,
      deposit: built.deposit, duration: built.duration, currencySymbol: settings.currencySymbol,
      location: settings.locationText, businessName: settings.businessName,
      whatsappUrl: whatsappHref(settings.whatsapp, `Hi Entranced Beauty, I just submitted booking ${reference} for ${names} on ${dateLabel} at ${parsed.startTime}.`),
    };
    void notifyOwner({ title: "New booking request", body: `${receipt.clientName} · ${receipt.dateLabel} at ${receipt.startTime}`, url: "/admin" });
    return receipt;
  } catch (error) {
    if (imagePath) await getFirebaseAdminStorage().file(imagePath).delete({ ignoreNotFound: true }).catch(() => undefined);
    if (error instanceof Error && error.name === "ZodError") throw new AppError("validation", "Check the booking details and try again.");
    throw error;
  }
}
