import Link from "next/link";
import { PhoneFrame } from "@/components/phone-frame";
import { TopBar } from "@/components/top-bar";
import { whatsappHref } from "@/lib/booking/phone";
import { DAY_NAMES } from "@/lib/dates";
import { getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const business = await getPublicBusiness();
  const hours = [...business.hours].sort((a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7));
  const lunch = business.breaks[0];
  return (
    <PhoneFrame>
      <TopBar businessName={business.businessName} whatsapp={business.whatsapp} instagram={business.instagram} />
      <main className="px-5 pb-8">
        <div className="mt-5 rounded-[24px] bg-[#0a0814] px-5 py-6 text-white">
          <p className="text-[12px] uppercase tracking-[0.16em] text-white/55">Visit the studio</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em]">Let’s create your look.</h1>
          <p className="mt-2 text-[14px] text-white/65">{business.locationText}</p>
        </div>
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-white px-4">
          <a href={`tel:${business.phone}`} className="flex items-center justify-between py-4">
            <span>Call</span>
            <span className="text-brown">{business.phoneDisplay}</span>
          </a>
          <a href={whatsappHref(business.whatsapp, "Hi Entranced Beauty, I would like to ask about an appointment.")} className="flex items-center justify-between py-4">
            <span>WhatsApp</span>
            <span className="text-brown">{business.whatsappDisplay}</span>
          </a>
          <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer" className="flex items-center justify-between py-4">
            <span>Instagram</span>
            <span className="text-brown">@{business.instagram}</span>
          </a>
        </div>
        <h2 className="mt-8 text-[20px] font-semibold tracking-[-0.03em]">Opening hours</h2>
        <ul className="mt-2">
          {hours.map((hour) => (
            <li key={hour.dayOfWeek} className="flex justify-between py-2 text-[15px]">
              <span>{DAY_NAMES[hour.dayOfWeek]}</span>
              <span className="text-muted">{hour.isOpen ? `${hour.openTime}–${hour.closeTime}` : "Closed"}</span>
            </li>
          ))}
        </ul>
        {lunch ? (
          <p className="mt-3 text-[14px] text-muted">
            {lunch.label} {lunch.startTime}–{lunch.endTime} on open weekdays.
          </p>
        ) : null}
        <Link href="/policies" className="mt-6 inline-block text-[15px] text-coral">
          Before you book
        </Link>
      </main>
    </PhoneFrame>
  );
}
