import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "rescheduled",
  "no_show",
]);

export const pricingTypeEnum = pgEnum("addon_pricing_type", ["fixed", "quantity"]);

export const businessSettings = pgTable("business_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  instagram: text("instagram").notNull(),
  locationText: text("location_text").notNull(),
  bookingPolicy: text("booking_policy").notNull(),
  depositPolicy: text("deposit_policy").notNull(),
  currencyCode: text("currency_code").notNull().default("NAD"),
  currencySymbol: text("currency_symbol").notNull().default("N$"),
  timezone: text("timezone").notNull().default("Africa/Windhoek"),
  slotIntervalMinutes: integer("slot_interval_minutes").notNull().default(30),
  minNoticeMinutes: integer("min_notice_minutes").notNull().default(30),
  heroImageUrl: text("hero_image_url").notNull().default("/images/hero.jpg"),
  tagline: text("tagline").notNull(),
  supportLine: text("support_line").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  bookingEnabled: boolean("booking_enabled").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2, mode: "number" }),
  requiresInspiration: boolean("requires_inspiration").notNull().default(false),
  preparationNotes: text("preparation_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceAddons = pgTable("service_addons", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  pricingType: pricingTypeEnum("pricing_type").notNull().default("fixed"),
  maxQuantity: integer("max_quantity").notNull().default(1),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  caption: text("caption").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const businessHours = pgTable("business_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayOfWeek: integer("day_of_week").notNull().unique(),
  isOpen: boolean("is_open").notNull().default(false),
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
});

export const businessBreaks = pgTable("business_breaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  label: text("label").notNull().default("Break"),
});

export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockDate: date("block_date", { mode: "string" }).notNull(),
  allDay: boolean("all_day").notNull().default(false),
  startTime: time("start_time"),
  endTime: time("end_time"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone").notNull(),
    bookingDate: date("booking_date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    estimatedTotal: numeric("estimated_total", { precision: 10, scale: 2, mode: "number" }).notNull(),
    depositAmount: numeric("deposit_amount", { precision: 10, scale: 2, mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("bookings_date_idx").on(table.bookingDate)],
);

export const bookingServices = pgTable("booking_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceName: text("service_name").notNull(),
  categoryName: text("category_name").notNull().default(""),
  priceSnapshot: numeric("price_snapshot", { precision: 10, scale: 2, mode: "number" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const bookingAddons = pgTable("booking_addons", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  bookingServiceId: uuid("booking_service_id")
    .notNull()
    .references(() => bookingServices.id, { onDelete: "cascade" }),
  addonId: uuid("addon_id"),
  addonName: text("addon_name").notNull(),
  pricingType: pricingTypeEnum("pricing_type").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  lineTotal: numeric("line_total", { precision: 10, scale: 2, mode: "number" }).notNull(),
});

export const bookingImages = pgTable("booking_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const specials = pgTable("specials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  originalPrice: numeric("original_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  specialPrice: numeric("special_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  active: boolean("active").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
