import Link from "next/link";
import { Search } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { Photo } from "@/components/photo";
import { TopBar } from "@/components/top-bar";
import { upcomingOpenDays } from "@/lib/data/availability";
import { formatMoney, specialApplies } from "@/lib/booking/pricing";
import { formatWeekday, todayInTimeZone } from "@/lib/dates";
import { getLiveSpecials, getPortfolio, getPublicBusiness, getPublicServices } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [business, services, specials, portfolio] = await Promise.all([
    getPublicBusiness(),
    getPublicServices(),
    getLiveSpecials(),
    getPortfolio(),
  ]);
  const today = todayInTimeZone(business.timezone);
  const popular = services.filter((service) => service.featured && service.bookingEnabled).slice(0, 6);
  const special = specials[0];
  const days = await upcomingOpenDays(4);
  const work = portfolio.slice(0, 5);

  return (
    <PhoneFrame>
      <TopBar businessName={business.businessName} whatsapp={business.whatsapp} instagram={business.instagram} />
      <main className="px-5 pb-6">
        <div className="mt-5 flex items-start justify-between">
          <div>
            <p className="text-[13px] text-muted">Hello, beautiful</p>
            <h1 className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.045em]">Ready for a new look?</h1>
          </div>
          <Link href="/book" aria-label="Book an appointment" className="grid h-11 w-11 place-items-center rounded-full bg-[#3D4A3D] text-lg text-white">+</Link>
        </div>

        <form action="/services" className="mt-5 flex h-12 items-center gap-2 rounded-[16px] border border-line bg-white pl-4 pr-1.5">
          <label className="sr-only" htmlFor="q">
            Search services
          </label>
          <input
            id="q"
            name="q"
            placeholder="Search services..."
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#b1a7a5]"
          />
          <button type="submit" aria-label="Search" className="grid h-9 w-9 place-items-center rounded-[12px] bg-coral text-white">
            <Search size={16} />
          </button>
        </form>

        {/* Popular Services — compact dense cards, ~3 visible across viewport */}
        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-[20px] font-semibold tracking-[-0.03em]">Popular services</h2>
            <Link href="/services" className="text-[13px] text-brown">
              See all
            </Link>
          </div>
          <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
            {popular.map((service, index) => {
              const live = service.special ? specialApplies({ active: true, ...service.special }, today) : false;
              const price = live && service.special ? service.special.price : service.price;
              return (
                <article key={service.id} className="w-[82px] shrink-0 text-center">
                  <Link href={`/services/${service.slug}`} className="relative mx-auto grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-[22px] bg-[#eeeef9] text-2xl text-[#3f3048]">
                    {service.imageUrl ? <Photo src={service.imageUrl} alt="" sizes="68px" priority={index === 0} /> : null}
                    <span className="relative z-10">{service.categoryName === "Makeup" ? "✦" : service.categoryName === "Hair" ? "⌁" : "✧"}</span>
                  </Link>
                  <h3 className="mt-2 line-clamp-2 text-[12px] font-medium leading-[1.15]">{service.categoryName}</h3>
                </article>
              );
            })}
          </div>
        </section>

        {/* Featured offer */}
        {special ? (
          <section className="mt-7">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-[18px] font-semibold">New look, new you</h2>
              <Link href="/services" className="text-[13px] text-brown">
                See all
              </Link>
            </div>
            <Link
              href={special.serviceSlug ? "/look" : "/services"}
              className="grid grid-cols-[1fr_124px] overflow-hidden rounded-[22px] bg-[#3f3048] text-white"
            >
              <div className="p-5">
                <p className="text-[12px] text-white/65">Exclusive offer for your first booking</p>
                <p className="mt-2 text-[22px] font-semibold leading-[1.1] tracking-[-0.02em]">{special.name}</p>
                <p className="mt-2 text-[17px]">{formatMoney(special.specialPrice, business.currencySymbol)}</p>
                <span className="mt-3 inline-flex h-9 items-center rounded-[12px] bg-white px-3.5 text-[13px] font-medium text-[#3f3048]">
                  Explore now
                </span>
              </div>
              <div className="relative min-h-[172px] bg-coral-soft">
                {special.imageUrl ? <Photo src={special.imageUrl} alt="" sizes="120px" /> : null}
              </div>
            </Link>
          </section>
        ) : null}

        {/* Available This Week */}
        {days.length ? (
          <section className="mt-7">
            <h2 className="text-[18px] font-semibold">Available this week</h2>
            <div className="mt-3 flex gap-2.5">
              {days.map((day) => (
                <Link
                  key={day.date}
                  href={`/book?date=${day.date}`}
                  className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-[14px] bg-white shadow-[0_4px_16px_rgba(70,51,50,0.06)]"
                >
                  <span className="text-[12px] text-muted">{formatWeekday(day.date, business.timezone)}</span>
                  <span className="text-[20px] font-semibold">{Number(day.date.slice(8, 10))}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-7">
            <h2 className="text-[18px] font-semibold">Available this week</h2>
            <p className="mt-2 text-[14px] text-muted">No openings this week. Message us on WhatsApp.</p>
          </section>
        )}

        {/* Recent Work */}
        {work.length ? (
          <section className="mt-7">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-[18px] font-semibold">Recent work</h2>
              <Link href="/portfolio" className="text-[13px] text-brown">
                Portfolio
              </Link>
            </div>
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5">
              {work.map((item) => (
                <Link key={item.id} href="/portfolio" className="relative h-[160px] w-[118px] shrink-0 overflow-hidden rounded-[14px] bg-blush">
                  <Photo src={item.imageUrl} alt={item.caption} sizes="118px" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </PhoneFrame>
  );
}

function monthName(date: string) {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][
    Number(date.slice(5, 7)) - 1
  ];
}
