"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { normalizeNamibianPhone } from "@/lib/booking/phone";
import { formatMoney } from "@/lib/booking/pricing";
import { tap } from "@/lib/http";
import type { BookingReceipt, PublicBusiness, PublicService, SelectedService } from "@/types/domain";
import { DetailsStep, type DetailValues } from "./details-step";
import { ReviewStep } from "./review-step";
import { ScheduleStep } from "./schedule-step";
import { ServiceStep } from "./service-step";

type Step = "services" | "schedule" | "details" | "review" | "done";

export function BookingFlow({
  services,
  business,
  initialSlug,
  initialDate,
}: {
  services: PublicService[];
  business: PublicBusiness;
  initialSlug?: string;
  initialDate?: string;
}) {
  const router = useRouter();
  const initial = services.find((service) => service.slug === initialSlug && service.bookingEnabled);
  const [step, setStep] = useState<Step>(initial ? "schedule" : "services");
  const [selected, setSelected] = useState<SelectedService[]>(initial ? [{ serviceId: initial.id, addons: [] }] : []);
  const [date, setDate] = useState<string | null>(initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<DetailValues>({ name: "", phone: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const chosen = services.filter((service) => selected.some((item) => item.serviceId === service.id));
  const needsPhoto = chosen.some((service) => service.requiresInspiration);
  const title = step === "services" ? "Choose your service" : step === "schedule" ? "Select date & time" : step === "details" ? "Your details" : step === "review" ? "Booking summary" : "Booking received";

  const estimate = useMemo(() => {
    return chosen.reduce(
      (sum, service) => {
        const choice = selected.find((item) => item.serviceId === service.id);
        const price = service.special && date && service.special.startDate <= date && service.special.endDate >= date ? service.special.price : service.price;
        const addons = (choice?.addons ?? []).reduce((addonSum, addon) => {
          const found = service.addons.find((item) => item.id === addon.addonId);
          if (!found) return addonSum;
          return addonSum + (found.pricingType === "quantity" ? found.price * addon.quantity : found.price);
        }, 0);
        return { total: sum.total + price + addons, duration: sum.duration + service.durationMinutes };
      },
      { total: 0, duration: 0 },
    );
  }, [chosen, date, selected]);

  function back() {
    setError(null);
    if (step === "schedule") setStep("services");
    else if (step === "details") setStep("schedule");
    else if (step === "review") setStep("details");
    else if (step === "done") router.push("/home");
    else router.back();
  }

  function toggle(service: PublicService) {
    setSelected((current) => {
      if (current.some((item) => item.serviceId === service.id)) return current.filter((item) => item.serviceId !== service.id);
      if (current.length >= 4) {
        setError("Four services is the most for one appointment.");
        return current;
      }
      setError(null);
      return [...current, { serviceId: service.id, addons: [] }];
    });
    setTime(null);
  }

  async function onFile(next: File) {
    const compressed = await compressImage(next);
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  async function submit() {
    if (!date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("No connection. Check your internet and try again.");
      }
      const payload = {
        clientName: details.name,
        clientPhone: details.phone,
        date,
        startTime: time,
        notes: details.notes,
        services: selected.map((item) => ({
          serviceId: item.serviceId,
          addons: item.addons.filter((addon) => addon.quantity > 0),
        })),
      };
      const body = new FormData();
      body.append("payload", JSON.stringify(payload));
      if (file) body.append("inspiration", file);
      const response = await fetch("/api/bookings", { method: "POST", body });
      const data = (await response.json()) as BookingReceipt & { message?: string; error?: string };
      if (!response.ok) {
        if (data.error === "slot_taken") setStep("schedule");
        throw new Error(data.message || "The booking did not go through. Please try again.");
      }
      tap("success");
      setReceipt(data);
      setStep("done");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The booking did not go through. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="flex items-center bg-[#3D4A3D] px-2 pb-2 pt-[max(8px,env(safe-area-inset-top))] text-white">
        <button type="button" aria-label="Back" onClick={back} className="grid h-11 w-11 place-items-center">
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold">{title}</h1>
        <span className="w-11" />
      </header>
      {step === "services" ? <ServiceStep services={services} selected={selected} symbol={business.currencySymbol} onToggle={toggle} /> : null}
      {step === "schedule" ? (
        <ScheduleStep
          services={services}
          selected={selected}
          business={business}
          date={date}
          time={time}
          onDate={(next) => {
            setDate(next);
            setTime(null);
          }}
          onTime={(next) => setTime(next || null)}
          onAddons={(serviceId, addonId, quantity) => {
            setSelected((current) =>
              current.map((item) => {
                if (item.serviceId !== serviceId) return item;
                const addons = item.addons.filter((addon) => addon.addonId !== addonId);
                return quantity > 0 ? { ...item, addons: [...addons, { addonId, quantity }] } : { ...item, addons };
              }),
            );
          }}
        />
      ) : null}
      {step === "details" ? (
        <DetailsStep
          values={details}
          preview={preview}
          required={needsPhoto}
          onChange={(next) => {
            if (!normalizeNamibianPhone(next.phone)) {
              setError("Enter a Namibian number, like 081 123 4567.");
              return;
            }
            if (needsPhoto && !file) {
              setError("Add an inspiration photo for this service.");
              return;
            }
            setDetails(next);
            setError(null);
            setStep("review");
          }}
          onFile={onFile}
          onClearFile={() => {
            setFile(null);
            setPreview(null);
          }}
        />
      ) : null}
      {step === "review" && date && time ? (
        <ReviewStep business={business} selected={selected} date={date} time={time} name={details.name} phone={details.phone} notes={details.notes} preview={preview} />
      ) : null}
      {step === "done" && receipt ? <Success receipt={receipt} /> : null}
      {error ? <p className="px-5 pb-3 text-[14px] text-coral">{error}</p> : null}
      {step !== "done" ? (
        <div className="sticky bottom-0 border-t border-white/70 bg-white/85 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl">
          {step === "services" ? (
            <button type="button" disabled={!selected.length} onClick={() => setStep("schedule")} className="press h-[52px] w-full rounded-[16px] bg-coral text-[16px] font-medium text-white disabled:opacity-40">
              Continue{selected.length ? ` · ${formatMoney(estimate.total, business.currencySymbol)}` : ""}
            </button>
          ) : null}
          {step === "schedule" ? (
            <button type="button" disabled={!date || !time} onClick={() => setStep("details")} className="press h-[52px] w-full rounded-[16px] bg-coral text-[16px] font-medium text-white disabled:opacity-40">
              Continue
            </button>
          ) : null}
          {step === "details" ? (
            <button type="submit" form="details-form" className="press h-[52px] w-full rounded-[16px] bg-coral text-[16px] font-medium text-white">
              Review booking
            </button>
          ) : null}
          {step === "review" ? (
            <button type="button" disabled={submitting} onClick={submit} className="press h-[52px] w-full rounded-[16px] bg-coral text-[16px] font-medium text-white disabled:opacity-50">
              {submitting ? "Sending…" : "Confirm booking"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Success({ receipt }: { receipt: BookingReceipt }) {
  return (
    <div className="px-5 pb-10 pt-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blush text-coral">
        <Check size={28} />
      </div>
      <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.03em]">Booking received</h2>
      <p className="mt-2 text-[14px] text-muted">{receipt.reference}</p>
      <p className="mt-5 text-[17px] font-medium">{receipt.services.map((service) => service.name).join(" + ")}</p>
      <p className="mt-1 text-[15px] text-muted">
        {receipt.dateLabel} · {receipt.startTime}
      </p>
      <p className="mt-1 text-[15px]">{formatMoney(receipt.total, receipt.currencySymbol)}</p>
      <p className="mx-auto mt-4 max-w-[280px] text-[14px] leading-6 text-muted">{receipt.businessName} will confirm your appointment shortly.</p>
      <a href={receipt.whatsappUrl} className="press mt-8 flex h-[52px] items-center justify-center rounded-[16px] bg-coral text-[16px] font-medium text-white">
        WhatsApp Us
      </a>
      <a href="/home" className="mt-2 flex h-12 items-center justify-center text-[15px] text-brown">
        Done
      </a>
    </div>
  );
}

async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], "inspiration.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
