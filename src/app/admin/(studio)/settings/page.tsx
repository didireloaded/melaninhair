import { SettingsPanel } from "@/features/admin/content-panels";
import { getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const business = await getPublicBusiness();
  return <SettingsPanel business={business} />;
}
