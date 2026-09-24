import { sql } from "drizzle-orm";
import type { AppDatabase } from "./index";

const SCHEMA_STATEMENTS = [
  `DO $$ BEGIN
    CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'rescheduled', 'no_show');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "public"."addon_pricing_type" AS ENUM('fixed', 'quantity');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `CREATE TABLE IF NOT EXISTS "admins" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL,
    "password_hash" text NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "admins_email_unique" UNIQUE("email")
  );`,

  `CREATE TABLE IF NOT EXISTS "availability_blocks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "block_date" date NOT NULL,
    "all_day" boolean DEFAULT false NOT NULL,
    "start_time" time,
    "end_time" time,
    "reason" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "bookings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "reference" text NOT NULL,
    "client_name" text NOT NULL,
    "client_phone" text NOT NULL,
    "booking_date" date NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "status" "booking_status" DEFAULT 'pending' NOT NULL,
    "notes" text,
    "estimated_total" numeric(10, 2) NOT NULL,
    "deposit_amount" numeric(10, 2),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
  );`,

  `CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "service_categories_slug_unique" UNIQUE("slug")
  );`,

  `CREATE TABLE IF NOT EXISTS "services" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category_id" uuid NOT NULL REFERENCES "service_categories"("id"),
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "description" text DEFAULT '' NOT NULL,
    "price" numeric(10, 2) NOT NULL,
    "duration_minutes" integer NOT NULL,
    "image_url" text,
    "active" boolean DEFAULT true NOT NULL,
    "booking_enabled" boolean DEFAULT true NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "deposit_amount" numeric(10, 2),
    "requires_inspiration" boolean DEFAULT false NOT NULL,
    "preparation_notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "services_slug_unique" UNIQUE("slug")
  );`,

  `CREATE TABLE IF NOT EXISTS "service_addons" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "service_id" uuid NOT NULL REFERENCES "services"("id") ON DELETE cascade,
    "name" text NOT NULL,
    "description" text DEFAULT '' NOT NULL,
    "price" numeric(10, 2) NOT NULL,
    "pricing_type" "addon_pricing_type" DEFAULT 'fixed' NOT NULL,
    "max_quantity" integer DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "booking_services" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE cascade,
    "service_id" uuid REFERENCES "services"("id") ON DELETE set null,
    "service_name" text NOT NULL,
    "category_name" text DEFAULT '' NOT NULL,
    "price_snapshot" numeric(10, 2) NOT NULL,
    "duration_minutes" integer NOT NULL,
    "image_url" text,
    "sort_order" integer DEFAULT 0 NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "booking_addons" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE cascade,
    "booking_service_id" uuid NOT NULL REFERENCES "booking_services"("id") ON DELETE cascade,
    "addon_id" uuid,
    "addon_name" text NOT NULL,
    "pricing_type" "addon_pricing_type" NOT NULL,
    "unit_price" numeric(10, 2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "line_total" numeric(10, 2) NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "booking_images" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE cascade,
    "file_name" text NOT NULL,
    "mime_type" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "business_breaks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "label" text DEFAULT 'Break' NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "business_hours" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "day_of_week" integer NOT NULL,
    "is_open" boolean DEFAULT false NOT NULL,
    "open_time" time NOT NULL,
    "close_time" time NOT NULL,
    CONSTRAINT "business_hours_day_of_week_unique" UNIQUE("day_of_week")
  );`,

  `CREATE TABLE IF NOT EXISTS "business_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "business_name" text NOT NULL,
    "phone" text NOT NULL,
    "whatsapp" text NOT NULL,
    "instagram" text NOT NULL,
    "location_text" text NOT NULL,
    "booking_policy" text NOT NULL,
    "deposit_policy" text NOT NULL,
    "currency_code" text DEFAULT 'NAD' NOT NULL,
    "currency_symbol" text DEFAULT 'N$' NOT NULL,
    "timezone" text DEFAULT 'Africa/Windhoek' NOT NULL,
    "slot_interval_minutes" integer DEFAULT 30 NOT NULL,
    "min_notice_minutes" integer DEFAULT 30 NOT NULL,
    "hero_image_url" text DEFAULT '/images/hero.jpg' NOT NULL,
    "tagline" text NOT NULL,
    "support_line" text NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "portfolio_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category" text NOT NULL,
    "caption" text DEFAULT '' NOT NULL,
    "image_url" text NOT NULL,
    "service_id" uuid REFERENCES "services"("id") ON DELETE set null,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "specials" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text DEFAULT '' NOT NULL,
    "service_id" uuid REFERENCES "services"("id") ON DELETE set null,
    "original_price" numeric(10, 2) NOT NULL,
    "special_price" numeric(10, 2) NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "image_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS "bookings_date_idx" ON "bookings" ("booking_date");`,
];

export async function ensureTablesExist(database: AppDatabase): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    try {
      await database.execute(sql.raw(statement));
    } catch (error) {
      // Continue if constraint/table/type already exists
    }
  }
}
