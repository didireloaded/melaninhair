import { PhoneFrame } from "@/components/phone-frame";
import { BookingFlow } from "@/features/booking/booking-flow";
import { getPublicBusiness, getPublicServices } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; date?: string }>;
}) {
  const params = await searchParams;
  const [business, services] = await Promise.all([getPublicBusiness(), getPublicServices()]);
  return (
    <PhoneFrame nav={false}>
      <BookingFlow services={services} business={business} initialSlug={params.service} initialDate={params.date} />
    </PhoneFrame>
  );
}
