import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { Photo } from "@/components/photo";
import { formatMoney, specialApplies } from "@/lib/booking/pricing";
import { todayInTimeZone } from "@/lib/dates";
import { getPublicBusiness, getPublicServices } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [business, services] = await Promise.all([getPublicBusiness(), getPublicServices()]);
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const today = todayInTimeZone(business.timezone);
  const live = service.special ? specialApplies({ active: true, ...service.special }, today) : false;
  const price = live && service.special ? service.special.price : service.price;

  return (
    <PhoneFrame nav={false}>
      <div className="relative h-[46vh] min-h-[280px] bg-blush">
        {service.imageUrl ? <Photo src={service.imageUrl} alt={service.name} priority sizes="430px" /> : null}
        <Link
          href="/services"
          aria-label="Back to services"
          className="absolute left-4 top-[max(14px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/85 text-ink backdrop-blur"
        >
          <ChevronLeft size={22} />
        </Link>
      </div>
      <section className="relative -mt-6 min-h-[54vh] rounded-t-[26px] bg-paper px-5 pb-28 pt-6">
        <p className="text-[13px] text-muted">{service.categoryName}</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.03em]">{service.name}</h1>
          <p className="pt-1 text-[18px] font-semibold">{formatMoney(price, business.currencySymbol)}</p>
        </div>
        {live && service.special ? (
          <p className="mt-1 text-[13px] text-muted">
            <span className="line-through">{formatMoney(service.price, business.currencySymbol)}</span> until {service.special.endDate}
          </p>
        ) : null}

        {/* 3-column info strip — matches reference visual rhythm with real data */}
        <div className="mt-5 grid grid-cols-3 rounded-[16px] bg-blush/60 py-4">
          <div className="text-center">
            <p className="text-[16px] font-semibold">{service.durationMinutes} Min</p>
            <p className="mt-0.5 text-[12px] text-muted">Duration</p>
          </div>
          <div className="border-x border-line text-center">
            <p className="text-[16px] font-semibold">{formatMoney(price, business.currencySymbol)}</p>
            <p className="mt-0.5 text-[12px] text-muted">{live ? "Special" : "Starting"}</p>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold">{service.requiresInspiration ? "Photo" : service.categoryName}</p>
            <p className="mt-0.5 text-[12px] text-muted">{service.requiresInspiration ? "Welcome" : "Category"}</p>
          </div>
        </div>

        <h2 className="mt-6 text-[16px] font-semibold">About this service</h2>
        <p className="mt-2 text-[15px] leading-6 text-ink/90">{service.description}</p>
        {service.preparationNotes ? <p className="mt-3 text-[14px] leading-6 text-muted">{service.preparationNotes}</p> : null}
        {service.addons.length ? (
          <div className="mt-6">
            <h2 className="text-[16px] font-semibold">Add-ons</h2>
            <ul className="mt-2">
              {service.addons.map((addon) => (
                <li key={addon.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <span>
                    <span className="block text-[15px]">{addon.name}</span>
                    {addon.description ? <span className="block text-[13px] text-muted">{addon.description}</span> : null}
                  </span>
                  <span className="text-[14px]">
                    {formatMoney(addon.price, business.currencySymbol)}
                    {addon.pricingType === "quantity" ? " each" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-white/70 bg-white/85 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {service.bookingEnabled ? (
          <Link href={`/book?service=${service.slug}`} className="press flex h-[52px] items-center justify-center rounded-[16px] bg-coral text-[16px] font-medium text-white">
            Book Now
          </Link>
        ) : (
          <p className="py-3 text-center text-[14px] text-muted">Booking is paused for this service.</p>
        )}
      </div>
    </PhoneFrame>
  );
}
