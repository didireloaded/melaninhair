import type { PricingType } from "@/lib/booking/pricing";
import type { DayStatus } from "@/lib/booking/slots";

export type { PricingType, DayStatus };

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "rescheduled",
  "no_show",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type PublicAddon = {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: PricingType;
  maxQuantity: number;
};

export type ServiceSpecial = {
  id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
};

export type PublicService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  featured: boolean;
  bookingEnabled: boolean;
  depositAmount: number | null;
  requiresInspiration: boolean;
  preparationNotes: string | null;
  sortOrder: number;
  addons: PublicAddon[];
  special: ServiceSpecial | null;
};

export type HourRow = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type BreakRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
};

export type PublicBusiness = {
  businessName: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  instagram: string;
  locationText: string;
  bookingPolicy: string;
  depositPolicy: string;
  currencyCode: string;
  currencySymbol: string;
  timezone: string;
  heroImageUrl: string;
  tagline: string;
  supportLine: string;
  slotIntervalMinutes: number;
  minNoticeMinutes: number;
  hours: HourRow[];
  breaks: BreakRow[];
};

export type PublicSpecial = {
  id: string;
  name: string;
  description: string;
  serviceId: string | null;
  serviceSlug: string | null;
  serviceName: string | null;
  originalPrice: number;
  specialPrice: number;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
};

export type PortfolioItem = {
  id: string;
  category: string;
  caption: string;
  imageUrl: string;
  serviceId: string | null;
  serviceSlug: string | null;
  serviceName: string | null;
  sortOrder: number;
};

export type SelectedAddon = {
  addonId: string;
  quantity: number;
};

export type SelectedService = {
  serviceId: string;
  addons: SelectedAddon[];
};

export type DayAvailability = {
  date: string;
  weekday: number;
  status: DayStatus;
  slots: string[];
};

export type QuoteLine = {
  serviceId: string;
  name: string;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  addons: { name: string; quantity: number; lineTotal: number }[];
};

export type Quote = {
  lines: QuoteLine[];
  total: number;
  duration: number;
  deposit: number;
  endTime: string | null;
  currencySymbol: string;
};

export type BookingReceipt = {
  reference: string;
  clientName: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  services: QuoteLine[];
  total: number;
  deposit: number;
  duration: number;
  currencySymbol: string;
  whatsappUrl: string;
  location: string;
  businessName: string;
};

export type AdminBooking = {
  id: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  phoneDisplay: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  total: number;
  deposit: number | null;
  duration: number;
  currencySymbol: string;
  services: {
    name: string;
    price: number;
    durationMinutes: number;
    addons: { name: string; quantity: number; lineTotal: number }[];
  }[];
  imageId: string | null;
  whatsappUrl: string;
};
