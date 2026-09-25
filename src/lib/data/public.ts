import { formatNamibianPhone } from "@/lib/booking/phone";
import { todayInTimeZone } from "@/lib/dates";
import { allDocuments } from "@/lib/firebase/firestore-store";
import type { PortfolioItem, PublicBusiness, PublicService, PublicSpecial } from "@/types/domain";

type SettingsRow = Omit<PublicBusiness, "phoneDisplay" | "whatsappDisplay" | "hours" | "breaks"> & { id: string };
type CategoryRow = { id: string; name: string; slug: string; sortOrder: number; active: boolean };
type ServiceRow = { id: string; categoryId: string; name: string; slug: string; description: string; price: number; durationMinutes: number; imageUrl: string | null; active: boolean; bookingEnabled: boolean; featured: boolean; sortOrder: number; depositAmount: number | null; requiresInspiration: boolean; preparationNotes: string | null };
type AddonRow = { id: string; serviceId: string; name: string; description: string; price: number; pricingType: "fixed" | "quantity"; maxQuantity: number; active: boolean; sortOrder: number };
type SpecialRow = { id: string; name: string; description: string; serviceId: string | null; originalPrice: number; specialPrice: number; startDate: string; endDate: string; active: boolean; imageUrl: string | null };
type HourRow = { id: string; dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string };
type BreakRow = { id: string; dayOfWeek: number; startTime: string; endTime: string; label: string };
type PortfolioRow = { id: string; category: string; caption: string; imageUrl: string; serviceId: string | null; sortOrder: number; active: boolean };

export async function getSettingsRow(): Promise<SettingsRow> {
  const [row] = await allDocuments<SettingsRow>("businessSettings");
  if (!row) throw new Error("Business settings are missing from Firestore");
  return row;
}

export async function getPublicBusiness(): Promise<PublicBusiness> {
  const [settings, hours, breaks] = await Promise.all([
    getSettingsRow(), allDocuments<HourRow>("businessHours"), allDocuments<BreakRow>("businessBreaks"),
  ]);
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
    hours: hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    breaks: breaks.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)),
  };
}

export async function getPublicServices(): Promise<PublicService[]> {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const [categories, services, addons, specials] = await Promise.all([
    allDocuments<CategoryRow>("serviceCategories"), allDocuments<ServiceRow>("services"),
    allDocuments<AddonRow>("serviceAddons"), allDocuments<SpecialRow>("specials"),
  ]);
  const categoryMap = new Map(categories.filter((item) => item.active).map((item) => [item.id, item]));
  return services.filter((item) => item.active && categoryMap.has(item.categoryId)).map((service) => {
    const category = categoryMap.get(service.categoryId)!;
    const special = specials.find((item) => item.active && item.serviceId === service.id && item.startDate <= today && item.endDate >= today) ?? null;
    return {
      id: service.id, slug: service.slug, name: service.name, description: service.description,
      categoryId: category.id, categoryName: category.name, categorySlug: category.slug,
      price: service.price, durationMinutes: service.durationMinutes, imageUrl: service.imageUrl,
      featured: service.featured, bookingEnabled: service.bookingEnabled, depositAmount: service.depositAmount,
      requiresInspiration: service.requiresInspiration, preparationNotes: service.preparationNotes, sortOrder: service.sortOrder,
      special: special ? { id: special.id, name: special.name, price: special.specialPrice, startDate: special.startDate, endDate: special.endDate } : null,
      addons: addons.filter((addon) => addon.active && addon.serviceId === service.id).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)).map(({ id, name, description, price, pricingType, maxQuantity }) => ({ id, name, description, price, pricingType, maxQuantity })),
    };
  }).sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.sortOrder - b.sortOrder);
}

export async function getLiveSpecials(): Promise<PublicSpecial[]> {
  const settings = await getSettingsRow();
  const today = todayInTimeZone(settings.timezone);
  const [specials, services] = await Promise.all([allDocuments<SpecialRow>("specials"), allDocuments<ServiceRow>("services")]);
  const byId = new Map(services.map((item) => [item.id, item]));
  return specials.filter((item) => item.active && item.startDate <= today && item.endDate >= today).map((item) => ({
    id: item.id, name: item.name, description: item.description, serviceId: item.serviceId,
    serviceSlug: item.serviceId ? byId.get(item.serviceId)?.slug ?? null : null,
    serviceName: item.serviceId ? byId.get(item.serviceId)?.name ?? null : null,
    originalPrice: item.originalPrice, specialPrice: item.specialPrice, startDate: item.startDate, endDate: item.endDate, imageUrl: item.imageUrl,
  }));
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const [portfolio, services] = await Promise.all([allDocuments<PortfolioRow>("portfolioItems"), allDocuments<ServiceRow>("services")]);
  const byId = new Map(services.map((item) => [item.id, item]));
  return portfolio.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({
    id: item.id, category: item.category, caption: item.caption, imageUrl: item.imageUrl, serviceId: item.serviceId,
    serviceSlug: item.serviceId ? byId.get(item.serviceId)?.slug ?? null : null,
    serviceName: item.serviceId ? byId.get(item.serviceId)?.name ?? null : null, sortOrder: item.sortOrder,
  }));
}

export function priceForDate(service: PublicService, date: string): number {
  return service.special && service.special.startDate <= date && service.special.endDate >= date ? service.special.price : service.price;
}
