"use client";

import { Check } from "lucide-react";
import { Photo } from "@/components/photo";
import { formatMoney } from "@/lib/booking/pricing";
import { tap } from "@/lib/http";
import type { PublicService, SelectedService } from "@/types/domain";

export function ServiceStep({
  services,
  selected,
  symbol,
  onToggle,
}: {
  services: PublicService[];
  selected: SelectedService[];
  symbol: string;
  onToggle: (service: PublicService) => void;
}) {
  const categories = [...new Map(services.map((service) => [service.categoryName, service.categoryName])).keys()];
  return (
    <div className="bg-paper px-5 pb-4 pt-4">
      <p className="text-[14px] text-muted">Choose one or more services for your appointment.</p>
      {categories.map((category) => (
        <section key={category} className="mt-5">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted">{category}</h2>
          <ul>
            {services
              .filter((service) => service.categoryName === category && service.bookingEnabled)
              .map((service) => {
                const active = selected.some((item) => item.serviceId === service.id);
                return (
                  <li key={service.id}>
                    <button
                      type="button"
                      onClick={() => {
                        tap("select");
                        onToggle(service);
                      }}
                      className="flex w-full items-center gap-3 border-b border-line py-3.5 text-left"
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-blush">
                        {service.imageUrl ? <Photo src={service.imageUrl} alt="" sizes="56px" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-medium">{service.name}</span>
                        <span className="block text-[13px] text-muted">
                          {service.durationMinutes} min · {formatMoney(service.special?.price && service.special.startDate <= new Date().toISOString().slice(0, 10) ? service.special.price : service.price, symbol)}
                        </span>
                      </span>
                      <span className={`grid h-7 w-7 place-items-center rounded-full border ${active ? "border-[#8d6cff] bg-[#8d6cff] text-white" : "border-line"}`}>
                        {active ? <Check size={14} /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
