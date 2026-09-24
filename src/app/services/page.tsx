import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { Photo } from "@/components/photo";
import { formatMoney, specialApplies } from "@/lib/booking/pricing";
import { todayInTimeZone } from "@/lib/dates";
import { getPublicBusiness, getPublicServices } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [business, services] = await Promise.all([getPublicBusiness(), getPublicServices()]);
  const today = todayInTimeZone(business.timezone);
  const query = (params.q ?? "").trim().toLowerCase();
  const category = params.category ?? "all";
  const categories = [...new Map(services.map((service) => [service.categorySlug, service.categoryName])).entries()];
  const filtered = services.filter((service) => {
    const matchesCategory = category === "all" || service.categorySlug === category;
    const haystack = `${service.name} ${service.categoryName} ${service.description}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });

  return (
    <PhoneFrame>
      <div className="bg-[#3D4A3D] px-5 pb-8 pt-[max(16px,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-2">
          <Link href="/home" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
            <ChevronLeft size={22} />
          </Link>
          <h1 className="text-[28px] font-semibold tracking-[-0.04em]">Explore services</h1>
        </div>
        <p className="mt-2 text-[14px] text-white/80">Manicure, pedicure, makeup and hair.</p>
        <form action="/services" className="mt-4 flex h-12 items-center rounded-[16px] bg-white pl-4 pr-1.5 text-ink">
          {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
          <label className="sr-only" htmlFor="service-search">
            Search services
          </label>
          <input
            id="service-search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search services..."
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#b1a7a5]"
          />
          <button type="submit" aria-label="Search" className="grid h-9 w-9 place-items-center rounded-[12px] bg-coral text-white">
            <Search size={16} />
          </button>
        </form>
      </div>
      <div className="-mt-4 min-h-[50vh] rounded-t-[26px] bg-paper px-5 pt-4">
        <div className="flex gap-4 overflow-x-auto pb-2 text-[14px]">
          <FilterLink href={query ? `/services?q=${encodeURIComponent(query)}` : "/services"} active={category === "all"} label="All" />
          {categories.map(([slug, name]) => (
            <FilterLink
              key={slug}
              href={`/services?category=${slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              active={category === slug}
              label={name}
            />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="py-10 text-[15px] text-muted">No services match that search.</p>
        ) : (
          <ul>
            {filtered.map((service) => {
              const live = service.special ? specialApplies({ active: true, ...service.special }, today) : false;
              const price = live && service.special ? service.special.price : service.price;
              return (
                <li key={service.id} className="flex items-center gap-3 border-b border-line py-3.5">
                  <Link href={`/services/${service.slug}`} className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[18px] bg-blush">
                    {service.imageUrl ? <Photo src={service.imageUrl} alt="" sizes="72px" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/services/${service.slug}`} className="block truncate text-[16px] font-semibold tracking-[-0.02em]">
                      {service.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted">{service.description}</p>
                    <p className="mt-1 text-[14px] font-medium">
                      {formatMoney(price, business.currencySymbol)}
                      <span className="font-normal text-muted"> · {service.durationMinutes} min</span>
                    </p>
                  </div>
                  {service.bookingEnabled ? (
                    <Link href={`/book?service=${service.slug}`} aria-label={`Book ${service.name}`} className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3D4A3D] text-xl leading-none text-white">
                      +
                    </Link>
                  ) : (
                    <span className="text-[12px] text-muted">Paused</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PhoneFrame>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`shrink-0 border-b-2 pb-1 ${active ? "border-coral text-coral" : "border-transparent text-muted"}`}>
      {label}
    </Link>
  );
}
