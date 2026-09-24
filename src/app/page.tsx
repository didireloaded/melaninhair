import Link from "next/link";
import { PhoneFrame } from "@/components/phone-frame";
import { Photo } from "@/components/photo";
import { getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const business = await getPublicBusiness();
  const [first, second] = business.tagline.split("\n");
  return (
    <PhoneFrame nav={false}>
      <main className="relative h-dvh overflow-hidden bg-chocolate">
        <Photo src={business.heroImageUrl} alt="" priority className="object-cover" sizes="430px" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/72" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-[max(28px,env(safe-area-inset-bottom))] text-white">
          <p className="font-serif text-[30px] leading-none tracking-[0.01em]">{business.businessName}</p>
          <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-[-0.035em]">
            {first || "Look good,"}
            <br />
            {second || "feel beautiful."}
          </h1>
          <p className="mt-3 max-w-[240px] text-[14px] leading-5 text-white/78">{business.supportLine}</p>
          <Link href="/book" className="press mt-6 flex h-[52px] items-center justify-center rounded-[16px] bg-coral text-[16px] font-medium text-white">
            Book Appointment
          </Link>
          <Link href="/services" className="mt-1 flex h-12 items-center justify-center text-[15px] text-white/90">
            Explore Services
          </Link>
        </div>
      </main>
    </PhoneFrame>
  );
}
