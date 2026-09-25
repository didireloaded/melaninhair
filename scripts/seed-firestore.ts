import { createHash } from "crypto";
import { loadEnvConfig } from "@next/env";
import { addDaysToDateString, todayInTimeZone } from "../src/lib/dates";

loadEnvConfig(process.cwd());

function id(value: string) {
  const hex = createHash("sha256").update(`entranced-beauty:${value}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
}

async function main() {
  const { getFirebaseAdminFirestore } = await import("../src/lib/firebase/admin");
  const firestore = getFirebaseAdminFirestore();
  const now = new Date();
  const today = todayInTimeZone("Africa/Windhoek");
  const categories = [
    { id: id("category:manicure"), name: "Manicure", slug: "manicure", sortOrder: 1, active: true },
    { id: id("category:pedicure"), name: "Pedicure", slug: "pedicure", sortOrder: 2, active: true },
    { id: id("category:makeup"), name: "Makeup", slug: "makeup", sortOrder: 3, active: true },
    { id: id("category:hair"), name: "Hair", slug: "hair", sortOrder: 4, active: true },
  ].map((item) => ({ ...item, createdAt: now, updatedAt: now }));
  const category = Object.fromEntries(categories.map((item) => [item.slug, item.id]));
  const serviceInput = [
    ["manicure", "Plain manicure with tips", "plain-manicure-with-tips", "Tips shaped and finished in a plain colour.", 160, 75, "/images/polish.jpg", false, 1],
    ["manicure", "Own nails", "own-nails", "A clean manicure on your natural nails.", 100, 45, "/images/nude.jpg", false, 2],
    ["manicure", "French manicure", "french-manicure", "Classic French finish, with your shape and length.", 180, 60, "/images/french.jpg", true, 3],
    ["manicure", "French Mani + Pedi", "french-mani-pedi", "French manicure and French pedicure together.", 280, 110, "/images/french.jpg", false, 4],
    ["pedicure", "Plain pedicure", "plain-pedicure", "Clean-up, shape and a plain colour.", 90, 45, "/images/pedi-soft.jpg", true, 1],
    ["pedicure", "French pedicure", "french-pedicure", "French finish on toes.", 100, 50, "/images/pedicure.jpg", false, 2],
    ["makeup", "Makeup with lashes", "makeup-with-lashes", "Full makeup, including lashes.", 300, 75, "/images/makeup.jpg", true, 1],
    ["makeup", "Makeup without lashes", "makeup-without-lashes", "Full makeup, no lashes.", 300, 60, "/images/makeup-soft.jpg", false, 2],
    ["hair", "Sleekback ponytail", "sleekback-ponytail", "Sleek ponytail, laid edges.", 160, 45, "/images/ponytail.jpg", true, 1],
    ["hair", "Gel bola without attachment", "gel-bola", "Gel bun, no added hair.", 160, 60, "/images/bun.jpg", false, 2],
  ] as const;
  const services = serviceInput.map(([categorySlug, name, slug, description, price, durationMinutes, imageUrl, featured, sortOrder]) => ({
    id: id(`service:${slug}`), categoryId: category[categorySlug], name, slug, description, price, durationMinutes, imageUrl,
    active: true, bookingEnabled: true, featured, sortOrder, depositAmount: null, requiresInspiration: false,
    preparationNotes: null, createdAt: now, updatedAt: now,
  }));
  const service = Object.fromEntries(services.map((item) => [item.slug, item.id]));
  const addons = ["plain-manicure-with-tips", "own-nails", "french-manicure"].map((slug) => ({
    id: id(`addon:${slug}:decor`), serviceId: service[slug], name: "Decor per finger", description: "Added to the fingers you choose.",
    price: 10, pricingType: "quantity", maxQuantity: 10, active: true, sortOrder: 1,
  }));
  const hours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    id: id(`hours:${dayOfWeek}`), dayOfWeek, isOpen: dayOfWeek !== 0, openTime: "09:00",
    closeTime: dayOfWeek === 0 || dayOfWeek === 6 ? "15:00" : "17:00",
  }));
  const breaks = [1, 2, 3, 4, 5].map((dayOfWeek) => ({ id: id(`break:${dayOfWeek}`), dayOfWeek, startTime: "13:00", endTime: "14:00", label: "Lunch" }));
  const portfolioSpec = [
    ["Nails", "French finish", "/images/french.jpg", "french-manicure"], ["Nails", "Nude on natural nails", "/images/nude.jpg", "own-nails"],
    ["Nails", "Pink nail art", "/images/nails-art.jpg", "plain-manicure-with-tips"], ["Nails", "Soft pink set", "/images/nails-pink.jpg", "french-manicure"],
    ["Pedicure", "French pedicure", "/images/pedicure.jpg", "french-pedicure"], ["Pedicure", "Plain pedicure", "/images/pedi-soft.jpg", "plain-pedicure"],
    ["Makeup", "Makeup with lashes", "/images/makeup.jpg", "makeup-with-lashes"], ["Makeup", "Soft makeup", "/images/makeup-soft.jpg", "makeup-without-lashes"],
    ["Hair", "Sleekback ponytail", "/images/ponytail.jpg", "sleekback-ponytail"], ["Hair", "Low bun", "/images/bun.jpg", "gel-bola"],
  ] as const;
  const portfolio = portfolioSpec.map(([categoryName, caption, imageUrl, slug], index) => ({ id: id(`portfolio:${index + 1}`), category: categoryName, caption, imageUrl, serviceId: service[slug], sortOrder: index + 1, active: true, createdAt: now }));
  const settings = [{ id: id("settings"), businessName: "Entranced Beauty", phone: "+264818228178", whatsapp: "+264818228178", instagram: "entranced_beauty_", locationText: "Windhoek, Namibia", bookingPolicy: "A booking is a request until Entranced Beauty confirms it. Message on WhatsApp if you need to cancel or move the time. Please arrive a few minutes early.", depositPolicy: "A deposit may be requested to hold the appointment. Entranced Beauty will confirm the amount on WhatsApp before you pay anything.", currencyCode: "NAD", currencySymbol: "N$", timezone: "Africa/Windhoek", slotIntervalMinutes: 30, minNoticeMinutes: 30, heroImageUrl: "/images/hero.jpg", tagline: "Look good,\nfeel beautiful.", supportLine: "Nails, makeup and hair in Windhoek.", updatedAt: now }];
  const specials = [{ id: id("special:french-mani-pedi"), name: "French Mani + Pedi", description: "French manicure and French pedicure.", serviceId: service["french-mani-pedi"], originalPrice: 280, specialPrice: 250, startDate: today, endDate: addDaysToDateString(today, 45), active: true, imageUrl: "/images/french.jpg", createdAt: now }];
  const collections: Array<[string, Array<{ id: string }>]> = [["businessSettings", settings], ["serviceCategories", categories], ["services", services], ["serviceAddons", addons], ["businessHours", hours], ["businessBreaks", breaks], ["portfolioItems", portfolio], ["specials", specials]];
  for (const [name, rows] of collections) {
    const batch = firestore.batch();
    rows.forEach((row) => batch.set(firestore.collection(name).doc(row.id), row));
    await batch.commit();
    console.log(`${name}: ${rows.length}`);
  }
  console.log("Firestore seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
