import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
  businessBreaks,
  businessHours,
  businessSettings,
  portfolioItems,
  serviceAddons,
  serviceCategories,
  services,
  specials,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { addDaysToDateString, todayInTimeZone } from "@/lib/dates";
import { ensureTablesExist } from "./init";

let pending: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!pending) {
    pending = runSeed().catch((error: unknown) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}

async function runSeed() {
  await ensureTablesExist(db);
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(4812001)`);
    const existing = await tx.select({ id: businessSettings.id }).from(businessSettings).limit(1);
    if (existing.length > 0) return;

    const today = todayInTimeZone("Africa/Windhoek");
    await tx.insert(businessSettings).values({
      businessName: "Entranced Beauty",
      phone: "+264818228178",
      whatsapp: "+264818228178",
      instagram: "entranced_beauty_",
      locationText: "Windhoek, Namibia",
      bookingPolicy:
        "A booking is a request until Entranced Beauty confirms it. Message on WhatsApp if you need to cancel or move the time. Please arrive a few minutes early.",
      depositPolicy:
        "A deposit may be requested to hold the appointment. Entranced Beauty will confirm the amount on WhatsApp before you pay anything.",
      currencyCode: "NAD",
      currencySymbol: "N$",
      timezone: "Africa/Windhoek",
      slotIntervalMinutes: 30,
      minNoticeMinutes: 30,
      heroImageUrl: "/images/hero.jpg",
      tagline: "Look good,\nfeel beautiful.",
      supportLine: "Nails, makeup and hair in Windhoek.",
    });

    const [manicure, pedicure, makeup, hair] = await tx
      .insert(serviceCategories)
      .values([
        { name: "Manicure", slug: "manicure", sortOrder: 1 },
        { name: "Pedicure", slug: "pedicure", sortOrder: 2 },
        { name: "Makeup", slug: "makeup", sortOrder: 3 },
        { name: "Hair", slug: "hair", sortOrder: 4 },
      ])
      .returning();

    const inserted = await tx
      .insert(services)
      .values([
        {
          categoryId: manicure.id,
          name: "Plain manicure with tips",
          slug: "plain-manicure-with-tips",
          description: "Tips shaped and finished in a plain colour.",
          price: 160,
          durationMinutes: 75,
          imageUrl: "/images/polish.jpg",
          featured: false,
          sortOrder: 1,
          preparationNotes: "Tell us your shape and length in the notes.",
        },
        {
          categoryId: manicure.id,
          name: "Own nails",
          slug: "own-nails",
          description: "A clean manicure on your natural nails.",
          price: 100,
          durationMinutes: 45,
          imageUrl: "/images/nude.jpg",
          sortOrder: 2,
          preparationNotes: "Come with clean nails, no polish if you can.",
        },
        {
          categoryId: manicure.id,
          name: "French manicure",
          slug: "french-manicure",
          description: "Classic French finish, with your shape and length.",
          price: 180,
          durationMinutes: 60,
          imageUrl: "/images/french.jpg",
          featured: true,
          sortOrder: 3,
        },
        {
          categoryId: manicure.id,
          name: "French Mani + Pedi",
          slug: "french-mani-pedi",
          description: "French manicure and French pedicure together.",
          price: 280,
          durationMinutes: 110,
          imageUrl: "/images/french.jpg",
          sortOrder: 4,
        },
        {
          categoryId: pedicure.id,
          name: "Plain pedicure",
          slug: "plain-pedicure",
          description: "Clean-up, shape and a plain colour.",
          price: 90,
          durationMinutes: 45,
          imageUrl: "/images/pedi-soft.jpg",
          featured: true,
          sortOrder: 1,
        },
        {
          categoryId: pedicure.id,
          name: "French pedicure",
          slug: "french-pedicure",
          description: "French finish on toes.",
          price: 100,
          durationMinutes: 50,
          imageUrl: "/images/pedicure.jpg",
          sortOrder: 2,
        },
        {
          categoryId: makeup.id,
          name: "Makeup with lashes",
          slug: "makeup-with-lashes",
          description: "Full makeup, including lashes.",
          price: 300,
          durationMinutes: 75,
          imageUrl: "/images/makeup.jpg",
          featured: true,
          sortOrder: 1,
          preparationNotes: "Arrive with a clean face if you can.",
        },
        {
          categoryId: makeup.id,
          name: "Makeup without lashes",
          slug: "makeup-without-lashes",
          description: "Full makeup, no lashes.",
          price: 300,
          durationMinutes: 60,
          imageUrl: "/images/makeup-soft.jpg",
          sortOrder: 2,
          preparationNotes: "Arrive with a clean face if you can.",
        },
        {
          categoryId: hair.id,
          name: "Sleekback ponytail",
          slug: "sleekback-ponytail",
          description: "Sleek ponytail, laid edges.",
          price: 160,
          durationMinutes: 45,
          imageUrl: "/images/ponytail.jpg",
          featured: true,
          sortOrder: 1,
        },
        {
          categoryId: hair.id,
          name: "Gel bola without attachment",
          slug: "gel-bola",
          description: "Gel bun, no added hair.",
          price: 160,
          durationMinutes: 60,
          imageUrl: "/images/bun.jpg",
          sortOrder: 2,
        },
      ])
      .returning();

    const bySlug = new Map(inserted.map((service) => [service.slug, service]));
    const decorTargets = ["plain-manicure-with-tips", "own-nails", "french-manicure"];
    await tx.insert(serviceAddons).values(
      decorTargets.map((slug) => ({
        serviceId: bySlug.get(slug)!.id,
        name: "Decor per finger",
        description: "Added to the fingers you choose.",
        price: 10,
        pricingType: "quantity" as const,
        maxQuantity: 10,
        sortOrder: 1,
      })),
    );

    await tx.insert(businessHours).values([
      { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "15:00" },
      { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "17:00" },
      { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "15:00" },
    ]);

    await tx.insert(businessBreaks).values(
      [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        dayOfWeek,
        startTime: "13:00",
        endTime: "14:00",
        label: "Lunch",
      })),
    );

    await tx.insert(portfolioItems).values([
      { category: "Nails", caption: "French finish", imageUrl: "/images/french.jpg", serviceId: bySlug.get("french-manicure")!.id, sortOrder: 1 },
      { category: "Nails", caption: "Nude on natural nails", imageUrl: "/images/nude.jpg", serviceId: bySlug.get("own-nails")!.id, sortOrder: 2 },
      { category: "Nails", caption: "Pink nail art", imageUrl: "/images/nails-art.jpg", serviceId: bySlug.get("plain-manicure-with-tips")!.id, sortOrder: 3 },
      { category: "Nails", caption: "Soft pink set", imageUrl: "/images/nails-pink.jpg", serviceId: bySlug.get("french-manicure")!.id, sortOrder: 4 },
      { category: "Pedicure", caption: "French pedicure", imageUrl: "/images/pedicure.jpg", serviceId: bySlug.get("french-pedicure")!.id, sortOrder: 5 },
      { category: "Pedicure", caption: "Plain pedicure", imageUrl: "/images/pedi-soft.jpg", serviceId: bySlug.get("plain-pedicure")!.id, sortOrder: 6 },
      { category: "Makeup", caption: "Makeup with lashes", imageUrl: "/images/makeup.jpg", serviceId: bySlug.get("makeup-with-lashes")!.id, sortOrder: 7 },
      { category: "Makeup", caption: "Soft makeup", imageUrl: "/images/makeup-soft.jpg", serviceId: bySlug.get("makeup-without-lashes")!.id, sortOrder: 8 },
      { category: "Hair", caption: "Sleekback ponytail", imageUrl: "/images/ponytail.jpg", serviceId: bySlug.get("sleekback-ponytail")!.id, sortOrder: 9 },
      { category: "Hair", caption: "Low bun", imageUrl: "/images/bun.jpg", serviceId: bySlug.get("gel-bola")!.id, sortOrder: 10 },
    ]);

    await tx.insert(specials).values({
      name: "French Mani + Pedi",
      description: "French manicure and French pedicure.",
      serviceId: bySlug.get("french-mani-pedi")!.id,
      originalPrice: 280,
      specialPrice: 250,
      startDate: today,
      endDate: addDaysToDateString(today, 45),
      active: true,
      imageUrl: "/images/french.jpg",
    });

    await tx.insert(admins).values({
      email: "studio@entrancedbeauty.com",
      name: "Entranced Beauty",
      passwordHash: hashPassword("Windhoek160"),
    });
  });
}
