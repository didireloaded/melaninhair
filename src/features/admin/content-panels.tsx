"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/lib/http";
import type { PublicBusiness } from "@/types/domain";

type ServiceOption = { id: string; name: string };
type PortfolioRow = {
  id: string;
  category: string;
  caption: string;
  imageUrl: string;
  serviceId: string | null;
  sortOrder: number;
  active: boolean;
};
type SpecialRow = {
  id: string;
  name: string;
  description: string;
  serviceId: string | null;
  originalPrice: number;
  specialPrice: number;
  startDate: string;
  endDate: string;
  active: boolean;
  imageUrl: string | null;
};

export function PortfolioPanel({ items, services }: { items: PortfolioRow[]; services: ServiceOption[] }) {
  const { send, message } = useSaver();
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Portfolio</h1>
      {message ? <p className="mt-3 text-[14px] text-brown">{message}</p> : null}
      <ItemForm services={services} onSubmit={(values) => void send({ action: "save-portfolio", ...values })} />
      <ul className="mt-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 border-b border-line py-3 text-[14px]">
            <span>
              {item.caption || item.category}
              <span className="block text-muted">{item.category}</span>
            </span>
            <button type="button" className="text-coral" onClick={() => void send({ action: "delete-portfolio", id: item.id })}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemForm({ services, onSubmit }: { services: ServiceOption[]; onSubmit: (values: Record<string, unknown>) => void }) {
  return (
    <form
      className="mt-4 grid gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        let imageUrl = String(form.get("imageUrl") || "");
        const file = form.get("file");
        if (file instanceof File && file.size > 0) {
          const upload = new FormData();
          upload.append("folder", "portfolio");
          upload.append("file", file);
          const response = await fetch("/api/admin/upload", { method: "POST", body: upload });
          const data = (await response.json()) as { url?: string; message?: string };
          if (!response.ok || !data.url) throw new Error(data.message || "The photo did not upload.");
          imageUrl = data.url;
        }
        if (!imageUrl) return;
        onSubmit({
          category: form.get("category"),
          caption: form.get("caption") || "",
          imageUrl,
          serviceId: form.get("serviceId") || null,
          sortOrder: Number(form.get("sortOrder") || 0),
          active: true,
        });
        event.currentTarget.reset();
      }}
    >
      <input name="category" required placeholder="Nails, Makeup, Hair or Pedicure" className="h-11 rounded-[12px] border border-line px-3" />
      <input name="caption" placeholder="Caption" className="h-11 rounded-[12px] border border-line px-3" />
      <input name="imageUrl" placeholder="Or paste an image path" className="h-11 rounded-[12px] border border-line px-3" />
      <input name="file" type="file" accept="image/*" />
      <select name="serviceId" className="h-11 rounded-[12px] border border-line px-3">
        <option value="">No linked service</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
      <input name="sortOrder" type="number" defaultValue="0" className="h-11 rounded-[12px] border border-line px-3" />
      <button className="h-11 rounded-[12px] bg-coral text-white">Add photo</button>
    </form>
  );
}

export function SpecialsPanel({ specials, services }: { specials: SpecialRow[]; services: ServiceOption[] }) {
  const { send, message } = useSaver();
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Specials</h1>
      <p className="mt-1 text-[14px] text-muted">Expired specials stop showing on their end date.</p>
      {message ? <p className="mt-3 text-[14px] text-brown">{message}</p> : null}
      <form
        className="mt-4 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void send({
            action: "save-special",
            name: form.get("name"),
            description: form.get("description") || "",
            serviceId: form.get("serviceId") || null,
            originalPrice: Number(form.get("originalPrice")),
            specialPrice: Number(form.get("specialPrice")),
            startDate: form.get("startDate"),
            endDate: form.get("endDate"),
            active: form.get("active") === "on",
            imageUrl: form.get("imageUrl") || null,
          });
        }}
      >
        <input name="name" required placeholder="Name" className="h-11 rounded-[12px] border border-line px-3" />
        <input name="description" placeholder="Short line" className="h-11 rounded-[12px] border border-line px-3" />
        <select name="serviceId" className="h-11 rounded-[12px] border border-line px-3">
          <option value="">No service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input name="originalPrice" type="number" required placeholder="Original" className="h-11 rounded-[12px] border border-line px-3" />
          <input name="specialPrice" type="number" required placeholder="Special" className="h-11 rounded-[12px] border border-line px-3" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="startDate" type="date" required className="h-11 rounded-[12px] border border-line px-3" />
          <input name="endDate" type="date" required className="h-11 rounded-[12px] border border-line px-3" />
        </div>
        <input name="imageUrl" placeholder="Image path" className="h-11 rounded-[12px] border border-line px-3" />
        <label className="flex gap-2 text-[14px]"><input name="active" type="checkbox" defaultChecked /> Active</label>
        <button className="h-11 rounded-[12px] bg-coral text-white">Create special</button>
      </form>
      <ul className="mt-4">
        {specials.map((special) => (
          <li key={special.id} className="border-b border-line py-3 text-[14px]">
            <p className="font-medium">{special.name}</p>
            <p className="text-muted">
              {special.startDate} – {special.endDate} · {special.active ? "Active flag on" : "Off"}
            </p>
            <button type="button" className="mt-1 text-coral" onClick={() => void send({ action: "delete-special", id: special.id })}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SettingsPanel({ business }: { business: PublicBusiness }) {
  const { send, message } = useSaver();
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Settings</h1>
      {message ? <p className="mt-3 text-[14px] text-brown">{message}</p> : null}
      <form
        className="mt-4 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void send({
            action: "settings",
            businessName: form.get("businessName"),
            phone: form.get("phone"),
            whatsapp: form.get("whatsapp"),
            instagram: form.get("instagram"),
            locationText: form.get("locationText"),
            bookingPolicy: form.get("bookingPolicy"),
            depositPolicy: form.get("depositPolicy"),
            currencyCode: form.get("currencyCode"),
            currencySymbol: form.get("currencySymbol"),
            timezone: form.get("timezone"),
            slotIntervalMinutes: Number(form.get("slotIntervalMinutes")),
            minNoticeMinutes: Number(form.get("minNoticeMinutes")),
            heroImageUrl: form.get("heroImageUrl"),
            tagline: form.get("tagline"),
            supportLine: form.get("supportLine"),
          });
        }}
      >
        <Field name="businessName" label="Business name" defaultValue={business.businessName} />
        <Field name="phone" label="Phone" defaultValue={business.phoneDisplay} />
        <Field name="whatsapp" label="WhatsApp" defaultValue={business.whatsappDisplay} />
        <Field name="instagram" label="Instagram" defaultValue={business.instagram} />
        <Field name="locationText" label="Location" defaultValue={business.locationText} />
        <Field name="currencyCode" label="Currency code" defaultValue={business.currencyCode} />
        <Field name="currencySymbol" label="Currency symbol" defaultValue={business.currencySymbol} />
        <Field name="timezone" label="Timezone" defaultValue={business.timezone} />
        <Field name="slotIntervalMinutes" label="Slot interval" defaultValue={String(business.slotIntervalMinutes)} type="number" />
        <Field name="minNoticeMinutes" label="Minimum notice" defaultValue={String(business.minNoticeMinutes)} type="number" />
        <Field name="heroImageUrl" label="Opening photo" defaultValue={business.heroImageUrl} />
        <label className="text-[14px]">
          Opening lines
          <textarea name="tagline" defaultValue={business.tagline} className="mt-1 w-full rounded-[12px] border border-line px-3 py-2" />
        </label>
        <Field name="supportLine" label="Support line" defaultValue={business.supportLine} />
        <label className="text-[14px]">
          Booking policy
          <textarea name="bookingPolicy" defaultValue={business.bookingPolicy} className="mt-1 min-h-24 w-full rounded-[12px] border border-line px-3 py-2" />
        </label>
        <label className="text-[14px]">
          Deposit policy
          <textarea name="depositPolicy" defaultValue={business.depositPolicy} className="mt-1 min-h-24 w-full rounded-[12px] border border-line px-3 py-2" />
        </label>
        <button className="h-11 rounded-[12px] bg-coral text-white">Save settings</button>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <label className="text-[14px]">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-11 w-full rounded-[12px] border border-line px-3" />
    </label>
  );
}

function useSaver() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  async function send(body: unknown) {
    setMessage(null);
    try {
      await postJson("/api/admin/content", body);
      router.refresh();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save that.");
    }
  }
  return { send, message };
}
