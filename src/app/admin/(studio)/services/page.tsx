import { ServicesPanel } from "@/features/admin/services-panel";
import { getAdminCatalog } from "@/lib/data/admin";
import { getSettingsRow } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [catalog, settings] = await Promise.all([getAdminCatalog(), getSettingsRow()]);
  return (
    <ServicesPanel
      symbol={settings.currencySymbol}
      categories={catalog.categories.map((category) => ({ id: category.id, name: category.name, active: category.active }))}
      services={catalog.services.map((service) => ({
        id: service.id,
        categoryId: service.categoryId,
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        imageUrl: service.imageUrl,
        active: service.active,
        bookingEnabled: service.bookingEnabled,
        featured: service.featured,
        sortOrder: service.sortOrder,
        depositAmount: service.depositAmount,
        requiresInspiration: service.requiresInspiration,
        preparationNotes: service.preparationNotes,
      }))}
      addons={catalog.addons.map((addon) => ({
        id: addon.id,
        serviceId: addon.serviceId,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        pricingType: addon.pricingType,
        maxQuantity: addon.maxQuantity,
        active: addon.active,
        sortOrder: addon.sortOrder,
      }))}
    />
  );
}
