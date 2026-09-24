import { PortfolioPanel } from "@/features/admin/content-panels";
import { getAdminCatalog, listPortfolioAdmin } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function PortfolioAdminPage() {
  const [items, catalog] = await Promise.all([listPortfolioAdmin(), getAdminCatalog()]);
  return (
    <PortfolioPanel
      items={items.map((item) => ({
        id: item.id,
        category: item.category,
        caption: item.caption,
        imageUrl: item.imageUrl,
        serviceId: item.serviceId,
        sortOrder: item.sortOrder,
        active: item.active,
      }))}
      services={catalog.services.filter((service) => service.active).map((service) => ({ id: service.id, name: service.name }))}
    />
  );
}
