import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const business = await getPublicBusiness();
  return (
    <PhoneFrame nav={false}>
      <main className="px-5 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <Link href="/contact" aria-label="Back to contact" className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft />
        </Link>
        <p className="mt-7 text-[12px] font-medium uppercase tracking-[0.16em] text-muted">{business.businessName}</p>
        <h1 className="mt-2 font-serif text-[38px] leading-[1.05] tracking-[-0.02em]">Before you book</h1>
        <p className="mt-3 max-w-[330px] text-[14px] leading-6 text-muted">A few simple guidelines help us protect your time and create the best experience for every client.</p>

        <div className="mt-7 space-y-3">
          <PolicyCard title="Booking requests" number="01">
            <p>{business.bookingPolicy}</p>
            <p className="mt-3">Your appointment is only confirmed once the studio has accepted the request. Please check your phone after booking so we can reach you if anything needs clarification.</p>
          </PolicyCard>
          <PolicyCard title="Deposits & payment" number="02">
            <p>{business.depositPolicy}</p>
            <p className="mt-3">Prices shown are for the selected service. Any agreed add-ons or changes will be discussed with you before the appointment.</p>
          </PolicyCard>
          <PolicyCard title="Changes & cancellations" number="03">
            <p>If you need to change or cancel, please message the studio as early as possible using WhatsApp or the contact details on the previous page. This gives us the best chance to offer the time to another client.</p>
            <p className="mt-3">Any deposit or cancellation outcome will be confirmed by the studio based on the circumstances and the appointment timing.</p>
          </PolicyCard>
          <PolicyCard title="Arriving prepared" number="04">
            <p>Please arrive on time and follow any preparation notes shown for your service. If you have allergies, sensitivities, or an inspiration photo, share them before the appointment.</p>
          </PolicyCard>
          <PolicyCard title="Your agreement" number="05">
            <p>By sending a booking request, you confirm that the details you provide are accurate and that you have read these booking terms. The studio may contact you about your appointment using the phone number you provide.</p>
          </PolicyCard>
        </div>

        <p className="mt-7 text-center text-[12px] leading-5 text-muted">Questions about a policy? <Link href="/contact" className="font-medium text-coral">Contact the studio</Link>.</p>
      </main>
    </PhoneFrame>
  );
}

function PolicyCard({ title, number, children }: { title: string; number: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush text-[11px] font-medium text-coral">{number}</span>
        <h2 className="pt-1 text-[16px] font-semibold tracking-[-0.02em]">{title}</h2>
      </div>
      <div className="mt-4 text-[14px] leading-6 text-ink/80">{children}</div>
    </section>
  );
}
