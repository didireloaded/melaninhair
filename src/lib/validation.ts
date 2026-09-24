import { z } from "zod";

export const selectedAddonSchema = z.object({
  addonId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const selectedServiceSchema = z.object({
  serviceId: z.string().uuid(),
  addons: z.array(selectedAddonSchema).max(8),
});

export const bookingPayloadSchema = z.object({
  clientName: z.string().trim().min(2, "Add your name.").max(80),
  clientPhone: z.string().trim().min(8, "Enter a Namibian number, like 081 123 4567.").max(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(500).optional().default(""),
  services: z.array(selectedServiceSchema).min(1).max(4),
});

export const quotePayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  services: z.array(selectedServiceSchema).min(1).max(4),
});

export const serviceInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  categoryId: z.string().uuid(),
  description: z.string().trim().max(400).default(""),
  price: z.number().min(0).max(100000),
  durationMinutes: z.number().int().min(15).max(480),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  active: z.boolean(),
  bookingEnabled: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
  depositAmount: z.number().min(0).max(100000).nullable(),
  requiresInspiration: z.boolean(),
  preparationNotes: z.string().trim().max(400).nullable(),
});

export const addonInputSchema = z.object({
  serviceId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).default(""),
  price: z.number().min(0).max(100000),
  pricingType: z.enum(["fixed", "quantity"]),
  maxQuantity: z.number().int().min(1).max(10),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(40),
});

export const blockInputSchema = z.object({
  blockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  allDay: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  reason: z.string().trim().max(160).nullable(),
});

export const hoursInputSchema = z.object({
  days: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      isOpen: z.boolean(),
      openTime: z.string().regex(/^\d{2}:\d{2}$/),
      closeTime: z.string().regex(/^\d{2}:\d{2}$/),
    }),
  ).length(7),
});

export const breaksInputSchema = z.object({
  breaks: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      label: z.string().trim().min(2).max(40),
    }),
  ).max(21),
});

export const specialInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).default(""),
  serviceId: z.string().uuid().nullable(),
  originalPrice: z.number().min(0).max(100000),
  specialPrice: z.number().min(0).max(100000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.boolean(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
});

export const portfolioInputSchema = z.object({
  category: z.string().trim().min(2).max(40),
  caption: z.string().trim().max(160).default(""),
  imageUrl: z.string().trim().min(1).max(500),
  serviceId: z.string().uuid().nullable(),
  sortOrder: z.number().int().min(0).max(999),
  active: z.boolean(),
});

export const settingsInputSchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(24),
  whatsapp: z.string().trim().min(8).max(24),
  instagram: z.string().trim().min(2).max(40),
  locationText: z.string().trim().min(2).max(160),
  bookingPolicy: z.string().trim().min(2).max(2000),
  depositPolicy: z.string().trim().min(2).max(2000),
  currencyCode: z.string().trim().min(3).max(8),
  currencySymbol: z.string().trim().min(1).max(6),
  timezone: z.string().trim().min(3).max(64),
  slotIntervalMinutes: z.number().int().min(15).max(120),
  minNoticeMinutes: z.number().int().min(0).max(240),
  heroImageUrl: z.string().trim().min(1).max(500),
  tagline: z.string().trim().min(2).max(120),
  supportLine: z.string().trim().min(2).max(180),
});

export const statusInputSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "rejected", "rescheduled", "no_show"]),
});

export const rescheduleInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
