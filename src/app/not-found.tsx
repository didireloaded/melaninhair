import Link from "next/link";
import { PhoneFrame } from "@/components/phone-frame";

export default function NotFound() {
  return (
    <PhoneFrame nav={false}>
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="text-[13px] text-muted">Entranced Beauty</p>
          <h1 className="mt-2 text-[28px] font-semibold">That page is not here.</h1>
          <Link href="/home" className="press mt-6 inline-flex h-12 items-center rounded-[16px] bg-coral px-5 text-white">
            Back home
          </Link>
        </div>
      </main>
    </PhoneFrame>
  );
}
