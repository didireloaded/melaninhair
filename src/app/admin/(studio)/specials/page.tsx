import { SpecialsPanel } from "@/features/admin/content-panels";
import { getAdminCatalog, listSpecialsAdmin } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function SpecialsAdminPage() {
  const [specials, catalog] = await Promise.all([listSpecialsAdmin(), getAdminCatalog()]);
  return (
    <SpecialsPanel
      specials={specials.map((special) => ({
        id: special.id,
        name: special.name,
        description: special.description,
        serviceId: special.serviceId,
        originalPrice: special.originalPrice,
        specialPrice: special.specialPrice,
        startDate: special.startDate,
        endDate: special.endDate,
        active: special.active,
        imageUrl: special.imageUrl,
      }))}
      services={catalog.services.filter((service) => service.active).map((service) => ({ id: service.id, name: service.name }))}
    />
  );
}
