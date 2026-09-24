import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { Photo } from "@/components/photo";
import { getPublicBusiness, getPublicServices } from "@/lib/data/public";
import { formatMoney } from "@/lib/booking/pricing";

export const dynamic = "force-dynamic";

export default async function LookPage() {
  const [business, services] = await Promise.all([getPublicBusiness(), getPublicServices()]);
  const look = services.find((service) => service.featured && service.bookingEnabled) ?? services.find((service) => service.bookingEnabled);
  if (!look) return null;
  return (
    <PhoneFrame nav={false}>
      <main className="pb-8">
        <div className="relative h-[52vh] min-h-[360px] bg-blush">
          <Photo src={look.imageUrl ?? "/images/hero.jpg"} alt={look.name} priority sizes="430px" />
          <Link href="/home" aria-label="Back to home" className="absolute left-5 top-[max(16px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm"><ChevronLeft size={21} /></Link>
          <div className="absolute inset-x-5 bottom-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"><p className="text-[12px] uppercase tracking-[0.16em]">This week’s new look</p><h1 className="mt-2 font-serif text-[36px] leading-none">{look.name}</h1></div>
        </div>
        <section className="relative -mt-5 rounded-t-[28px] bg-paper px-5 pb-8 pt-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[13px] text-muted">{look.categoryName}</p><p className="mt-1 text-[22px] font-semibold">Soft, sculptural, effortless.</p></div><p className="text-[18px] font-semibold">{formatMoney(look.price, business.currencySymbol)}</p></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-[18px] bg-white p-4"><Clock size={18} className="text-coral" /><p className="mt-2 text-[15px] font-medium">{look.durationMinutes} min</p><p className="text-[12px] text-muted">Appointment time</p></div><div className="rounded-[18px] bg-white p-4"><p className="text-[15px] font-medium">Available</p><p className="mt-1 text-[12px] text-muted">Check dates in booking</p></div></div>
          <h2 className="mt-6 text-[16px] font-semibold">About this look</h2><p className="mt-2 text-[15px] leading-6 text-muted">{look.description}</p>
          {look.preparationNotes ? <p className="mt-3 text-[14px] leading-6 text-muted">Prep: {look.preparationNotes}</p> : null}
          <Link href={`/book?service=${look.slug}`} className="mt-7 flex h-[52px] items-center justify-center rounded-full bg-coral text-[16px] font-medium text-white">Book this look</Link>
        </section>
      </main>
    </PhoneFrame>
  );
}
