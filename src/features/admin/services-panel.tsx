"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/http";
import { formatMoney } from "@/lib/booking/pricing";

type Category = { id: string; name: string; active: boolean };
type Addon = {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  pricingType: "fixed" | "quantity";
  maxQuantity: number;
  active: boolean;
  sortOrder: number;
};
type Service = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  active: boolean;
  bookingEnabled: boolean;
  featured: boolean;
  sortOrder: number;
  depositAmount: number | null;
  requiresInspiration: boolean;
  preparationNotes: string | null;
};

export function ServicesPanel({
  categories,
  services,
  addons,
  symbol,
}: {
  categories: Category[];
  services: Service[];
  addons: Addon[];
  symbol: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function send(url: string, body: unknown) {
    setMessage(null);
    try {
      await postJson(url, body);
      router.refresh();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save that.");
    }
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Services</h1>
      {message ? <p className="mt-3 text-[14px] text-brown">{message}</p> : null}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void send("/api/admin/catalog", { action: "create-category", name: form.get("name") });
          event.currentTarget.reset();
        }}
      >
        <input name="name" required placeholder="New category" className="h-11 flex-1 rounded-[12px] border border-line px-3" />
        <button className="h-11 rounded-[12px] bg-coral px-4 text-white">Add</button>
      </form>
      <details className="mt-4 border-b border-line pb-4">
        <summary className="cursor-pointer text-[16px] font-semibold">New service</summary>
        <ServiceFields
          categories={categories}
          onSubmit={(values) => void send("/api/admin/catalog", { action: "create-service", ...values })}
        />
      </details>
      <ul>
        {services.map((service) => (
          <li key={service.id} className="border-b border-line py-3">
            <details>
              <summary className="cursor-pointer">
                <span className="font-medium">{service.name}</span>
                <span className="ml-2 text-[13px] text-muted">
                  {formatMoney(service.price, symbol)} · {service.durationMinutes} min{service.active ? "" : " · archived"}
                </span>
              </summary>
              <ServiceFields
                categories={categories}
                service={service}
                onSubmit={(values) => void send("/api/admin/catalog", { action: "update-service", id: service.id, ...values })}
              />
              <button type="button" className="mt-2 text-[14px] text-coral" onClick={() => void send("/api/admin/catalog", { action: "archive-service", id: service.id })}>
                Archive or delete
              </button>
              <div className="mt-3">
                <p className="text-[14px] font-medium">Add-ons</p>
                {addons
                  .filter((addon) => addon.serviceId === service.id)
                  .map((addon) => (
                    <div key={addon.id} className="mt-2 flex items-center justify-between text-[14px]">
                      <span>
                        {addon.name} · {formatMoney(addon.price, symbol)} {addon.pricingType === "quantity" ? "each" : ""}
                      </span>
                      <button type="button" className="text-coral" onClick={() => void send("/api/admin/catalog", { action: "delete-addon", id: addon.id })}>
                        Remove
                      </button>
                    </div>
                  ))}
                <form
                  className="mt-2 grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    void send("/api/admin/catalog", {
                      action: "save-addon",
                      serviceId: service.id,
                      name: form.get("name"),
                      description: "",
                      price: Number(form.get("price")),
                      pricingType: form.get("pricingType"),
                      maxQuantity: Number(form.get("maxQuantity") || 1),
                      active: true,
                      sortOrder: 1,
                    });
                    event.currentTarget.reset();
                  }}
                >
                  <input name="name" required placeholder="Add-on name" className="h-10 rounded-[12px] border border-line px-3" />
                  <div className="grid grid-cols-3 gap-2">
                    <input name="price" type="number" min="0" step="1" required placeholder="Price" className="h-10 rounded-[12px] border border-line px-3" />
                    <select name="pricingType" className="h-10 rounded-[12px] border border-line px-2">
                      <option value="fixed">Fixed</option>
                      <option value="quantity">Quantity</option>
                    </select>
                    <input name="maxQuantity" type="number" min="1" max="10" defaultValue="1" className="h-10 rounded-[12px] border border-line px-3" />
                  </div>
                  <button className="h-10 rounded-[12px] border border-line">Add add-on</button>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServiceFields({
  categories,
  service,
  onSubmit,
}: {
  categories: Category[];
  service?: Service;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  return (
    <form
      className="mt-3 grid gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        let imageUrl = String(form.get("imageUrl") || "") || null;
        const file = form.get("file");
        if (file instanceof File && file.size > 0) {
          const upload = new FormData();
          upload.append("folder", "services");
          upload.append("file", file);
          const response = await fetch("/api/admin/upload", { method: "POST", body: upload });
          const data = (await response.json()) as { url?: string; message?: string };
          if (!response.ok || !data.url) throw new Error(data.message || "The photo did not upload.");
          imageUrl = data.url;
        }
        onSubmit({
          name: form.get("name"),
          categoryId: form.get("categoryId"),
          description: form.get("description") || "",
          price: Number(form.get("price")),
          durationMinutes: Number(form.get("durationMinutes")),
          imageUrl,
          active: form.get("active") === "on",
          bookingEnabled: form.get("bookingEnabled") === "on",
          featured: form.get("featured") === "on",
          sortOrder: Number(form.get("sortOrder") || 0),
          depositAmount: form.get("depositAmount") ? Number(form.get("depositAmount")) : null,
          requiresInspiration: form.get("requiresInspiration") === "on",
          preparationNotes: String(form.get("preparationNotes") || "") || null,
        });
      }}
    >
      <input name="name" required defaultValue={service?.name} placeholder="Name" className="h-11 rounded-[12px] border border-line px-3" />
      <select name="categoryId" defaultValue={service?.categoryId} className="h-11 rounded-[12px] border border-line px-3">
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <textarea name="description" defaultValue={service?.description} placeholder="Short description" className="rounded-[12px] border border-line px-3 py-2" />
      <div className="grid grid-cols-2 gap-2">
        <input name="price" type="number" min="0" step="1" required defaultValue={service?.price ?? 100} className="h-11 rounded-[12px] border border-line px-3" />
        <input name="durationMinutes" type="number" min="15" required defaultValue={service?.durationMinutes ?? 60} className="h-11 rounded-[12px] border border-line px-3" />
      </div>
      <input name="imageUrl" defaultValue={service?.imageUrl ?? ""} placeholder="Image path" className="h-11 rounded-[12px] border border-line px-3" />
      <input name="file" type="file" accept="image/*" className="text-[14px]" />
      <input name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} className="h-11 rounded-[12px] border border-line px-3" />
      <input name="depositAmount" type="number" min="0" defaultValue={service?.depositAmount ?? ""} placeholder="Deposit, optional" className="h-11 rounded-[12px] border border-line px-3" />
      <input name="preparationNotes" defaultValue={service?.preparationNotes ?? ""} placeholder="Preparation notes" className="h-11 rounded-[12px] border border-line px-3" />
      <label className="flex gap-2 text-[14px]"><input name="active" type="checkbox" defaultChecked={service?.active ?? true} /> Active</label>
      <label className="flex gap-2 text-[14px]"><input name="bookingEnabled" type="checkbox" defaultChecked={service?.bookingEnabled ?? true} /> Booking enabled</label>
      <label className="flex gap-2 text-[14px]"><input name="featured" type="checkbox" defaultChecked={service?.featured ?? false} /> Show on home</label>
      <label className="flex gap-2 text-[14px]"><input name="requiresInspiration" type="checkbox" defaultChecked={service?.requiresInspiration ?? false} /> Inspiration required</label>
      <button className="h-11 rounded-[12px] bg-coral text-white">{service ? "Save service" : "Create service"}</button>
    </form>
  );
}
