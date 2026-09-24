import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const business = await getPublicBusiness();
  return (
    <PhoneFrame nav={false}>
      <main className="px-5 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <Link href="/contact" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full">
          <ChevronLeft />
        </Link>
        <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.03em]">Before you book</h1>
        <h2 className="mt-6 text-[16px] font-semibold">Appointments</h2>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6">{business.bookingPolicy}</p>
        <h2 className="mt-6 text-[16px] font-semibold">Deposits</h2>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6">{business.depositPolicy}</p>
      </main>
    </PhoneFrame>
  );
}
