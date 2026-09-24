import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  businessBreaks,
  businessHours,
  businessSettings,
  portfolioItems,
  serviceAddons,
  serviceCategories,
  services,
  specials,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { formatNamibianPhone } from "@/lib/booking/phone";
import { clock } from "@/lib/booking/time";
import { todayInTimeZone } from "@/lib/dates";
import type { PortfolioItem, PublicBusiness, PublicService, PublicSpecial } from "@/types/domain";

export async function getSettingsRow() {
  await ensureSeed();
  const [row] = await db.select().from(businessSettings).limit(1);
  if (!row) throw new Error("Business settings are missing");
  return row;
}

export async function getPublicBusiness(): Promise<PublicBusiness> {
  const settings = await getSettingsRow();
  const hours = await db.select().from(businessHours).orderBy(asc(businessHours.dayOfWeek));
  const breaks = await db.select().from(businessBreaks).orderBy(asc(businessBreaks.dayOfWeek), asc(businessBreaks.startTime));
  return {
    businessName: settings.businessName,
    phone: settings.phone,
    phoneDisplay: formatNamibianPhone(settings.phone),
    whatsapp: settings.whatsapp,
    whatsappDisplay: formatNamibianPhone(settings.whatsapp),
    instagram: settings.instagram.replace(/^@/, ""),
    locationText: settings.locationText,
    bookingPolicy: settings.bookingPolicy,
    depositPolicy: settings.depositPolicy,
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
    timezone: settings.timezone,
    heroImageUrl: settings.heroImageUrl,
    tagline: settings.tagline,
    supportLine: settings.supportLine,
    slotIntervalMinutes: settings.slotIntervalMinutes,
    minNoticeMinutes: settings.minNoticeMinutes,
    hours: hours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      isOpen: hour.isOpen,
      openTime: clock(hour.openTime),
      closeTime: clock(hour.closeTime),
    })),
    breaks: breaks.map((item) => ({
      id: item.id,
      dayOfWeek: item.dayOfWeek,
      startTime: clock(item.startTime),
      endTime: clock(item.endTime),
      label: item.label,
    })),
  };
}

export async function getPublicServices(): Promise<PublicService[]> {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const categories = await db.select().from(serviceCategories).where(eq(serviceCategories.active, true));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const serviceRows = await db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.sortOrder), asc(services.name));
  const addonRows = await db
    .select()
    .from(serviceAddons)
    .where(eq(serviceAddons.active, true))
    .orderBy(asc(serviceAddons.sortOrder), asc(serviceAddons.name));
  const specialRows = await db
    .select()
    .from(specials)
    .where(and(eq(specials.active, true), gte(specials.endDate, today)));

  return serviceRows
    .filter((service) => categoryMap.has(service.categoryId))
    .map((service) => {
      const category = categoryMap.get(service.categoryId)!;
      const special = specialRows.find((item) => item.serviceId === service.id) ?? null;
      return {
        id: service.id,
        slug: service.slug,
        name: service.name,
        description: service.description,
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
        price: service.price,
        durationMinutes: service.durationMinutes,
        imageUrl: service.imageUrl,
        featured: service.featured,
        bookingEnabled: service.bookingEnabled,
        depositAmount: service.depositAmount,
        requiresInspiration: service.requiresInspiration,
        preparationNotes: service.preparationNotes,
        sortOrder: service.sortOrder,
        special: special
          ? {
              id: special.id,
              name: special.name,
              price: special.specialPrice,
              startDate: special.startDate,
              endDate: special.endDate,
            }
          : null,
        addons: addonRows
          .filter((addon) => addon.serviceId === service.id)
          .map((addon) => ({
            id: addon.id,
            name: addon.name,
            description: addon.description,
            price: addon.price,
            pricingType: addon.pricingType,
            maxQuantity: addon.maxQuantity,
          })),
      };
    })
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.sortOrder - b.sortOrder);
}

export async function getLiveSpecials(): Promise<PublicSpecial[]> {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const rows = await db
    .select({
      special: specials,
      slug: services.slug,
      serviceName: services.name,
    })
    .from(specials)
    .leftJoin(services, eq(specials.serviceId, services.id))
    .where(and(eq(specials.active, true), gte(specials.endDate, today)));

  return rows
    .filter((row) => row.special.startDate <= today)
    .map((row) => ({
      id: row.special.id,
      name: row.special.name,
      description: row.special.description,
      serviceId: row.special.serviceId,
      serviceSlug: row.slug,
      serviceName: row.serviceName,
      originalPrice: row.special.originalPrice,
      specialPrice: row.special.specialPrice,
      startDate: row.special.startDate,
      endDate: row.special.endDate,
      imageUrl: row.special.imageUrl,
    }));
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  await getSettingsRow();
  const rows = await db
    .select({
      item: portfolioItems,
      slug: services.slug,
      serviceName: services.name,
    })
    .from(portfolioItems)
    .leftJoin(services, eq(portfolioItems.serviceId, services.id))
    .where(eq(portfolioItems.active, true))
    .orderBy(asc(portfolioItems.sortOrder));

  return rows.map((row) => ({
    id: row.item.id,
    category: row.item.category,
    caption: row.item.caption,
    imageUrl: row.item.imageUrl,
    serviceId: row.item.serviceId,
    serviceSlug: row.slug,
    serviceName: row.serviceName,
    sortOrder: row.item.sortOrder,
  }));
}

export function priceForDate(service: PublicService, date: string): number {
  if (service.special && service.special.startDate <= date && service.special.endDate >= date) {
    return service.special.price;
  }
  return service.price;
}
