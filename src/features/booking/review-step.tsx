"use client";

import { useQuery } from "@tanstack/react-query";
import { Photo } from "@/components/photo";
import { formatMoney } from "@/lib/booking/pricing";
import { formatAppointmentDate } from "@/lib/dates";
import { postJson } from "@/lib/http";
import type { PublicBusiness, Quote, SelectedService } from "@/types/domain";

export function ReviewStep({
  business,
  selected,
  date,
  time,
  name,
  phone,
  notes,
  preview,
}: {
  business: PublicBusiness;
  selected: SelectedService[];
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
  preview: string | null;
}) {
  const quote = useQuery({
    queryKey: ["quote", date, time, selected],
    queryFn: () => postJson<Quote>("/api/bookings/quote", { date, startTime: time, services: selected }),
  });
  const line = quote.data?.lines[0];

  return (
    <div className="px-5 pb-4">
      <p className="text-[14px] text-muted">Review your booking details</p>
      <article className="mt-4 flex gap-3 rounded-[18px] bg-white p-3 shadow-[0_8px_24px_rgba(70,51,50,0.05)]">
        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-blush">
          {line?.imageUrl ? <Photo src={line.imageUrl} alt="" sizes="84px" /> : null}
        </div>
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-5">{quote.data?.lines.map((item) => item.name).join(" + ") || "Appointment"}</h2>
          <p className="mt-1 text-[14px] text-muted">{formatAppointmentDate(date, business.timezone)}</p>
          <p className="text-[14px] text-muted">{time}</p>
          <p className="mt-1 text-[13px] text-muted">{business.locationText}</p>
        </div>
      </article>
      <dl className="mt-5 space-y-3 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Name</dt>
          <dd>{name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Phone</dt>
          <dd>{phone}</dd>
        </div>
        {quote.data?.lines.map((item) => (
          <div key={item.serviceId}>
            <div className="flex justify-between gap-4">
              <dt>{item.name}</dt>
              <dd>{formatMoney(item.price, business.currencySymbol)}</dd>
            </div>
            {item.addons.map((addon) => (
              <div key={addon.name} className="mt-2 flex justify-between gap-4 text-muted">
                <dt>
                  {addon.name}
                  {addon.quantity > 1 ? ` × ${addon.quantity}` : ""}
                </dt>
                <dd>{formatMoney(addon.lineTotal, business.currencySymbol)}</dd>
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-line pt-3 font-semibold">
          <dt>Estimated total</dt>
          <dd>{quote.data ? formatMoney(quote.data.total, business.currencySymbol) : "…"}</dd>
        </div>
        {quote.data && quote.data.deposit > 0 ? (
          <>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Deposit</dt>
              <dd>{formatMoney(quote.data.deposit, business.currencySymbol)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Balance</dt>
              <dd>{formatMoney(quote.data.total - quote.data.deposit, business.currencySymbol)}</dd>
            </div>
          </>
        ) : null}
        {quote.data ? (
          <div className="flex justify-between gap-4 text-muted">
            <dt>Duration</dt>
            <dd>{quote.data.duration} min</dd>
          </div>
        ) : null}
      </dl>
      {notes ? <p className="mt-4 text-[14px] leading-6 text-muted">{notes}</p> : null}
      {preview ? <img src={preview} alt="Inspiration" className="mt-4 h-24 w-24 rounded-[14px] object-cover" /> : null}
      {quote.isError ? <p className="mt-4 text-[14px] text-coral">{quote.error instanceof Error ? quote.error.message : "Could not price this booking."}</p> : null}
    </div>
  );
}
