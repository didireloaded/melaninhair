"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, ImagePlus } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(80),
  phone: z.string().trim().min(8, "Enter a Namibian number, like 081 123 4567.").max(24),
  notes: z.string().max(500),
});

export type DetailValues = z.infer<typeof schema>;

export function DetailsStep({
  values,
  preview,
  required,
  onChange,
  onFile,
  onClearFile,
}: {
  values: DetailValues;
  preview: string | null;
  required: boolean;
  onChange: (values: DetailValues) => void;
  onFile: (file: File) => void;
  onClearFile: () => void;
}) {
  const form = useForm<DetailValues>({
    resolver: zodResolver(schema),
    defaultValues: values,
  });

  return (
    <form
      id="details-form"
      className="px-5 pb-4"
      onSubmit={form.handleSubmit((next) => onChange(next))}
    >
      <label className="block text-[14px]" htmlFor="name">
        Your name
        <input id="name" autoComplete="name" className="mt-1.5 h-12 w-full rounded-[14px] border border-line bg-white px-4 text-[16px] outline-none" {...form.register("name")} />
      </label>
      {form.formState.errors.name ? <p className="mt-1 text-[13px] text-coral">{form.formState.errors.name.message}</p> : null}
      <label className="mt-4 block text-[14px]" htmlFor="phone">
        Phone number
        <div className="mt-1.5 flex h-12 overflow-hidden rounded-[14px] border border-line bg-white">
          <span className="grid place-items-center px-3 text-[15px] text-muted">+264</span>
          <input id="phone" inputMode="tel" autoComplete="tel" placeholder="81 123 4567" className="h-full min-w-0 flex-1 bg-transparent pr-4 text-[16px] outline-none" {...form.register("phone")} />
        </div>
      </label>
      {form.formState.errors.phone ? <p className="mt-1 text-[13px] text-coral">{form.formState.errors.phone.message}</p> : null}
      <label className="mt-4 block text-[14px]" htmlFor="notes">
        Anything we should know?
        <textarea id="notes" rows={3} placeholder="Short almond shape" className="mt-1.5 w-full rounded-[14px] border border-line bg-white px-4 py-3 text-[16px] outline-none" {...form.register("notes")} />
      </label>
      <div className="mt-5">
        <p className="text-[16px] font-semibold">Have a reference?</p>
        <p className="mt-1 text-[14px] text-muted">{required ? "This service needs a photo of the look." : "Upload the look you have in mind. Optional."}</p>
        {preview ? (
          <div className="mt-3 flex items-center gap-3">
            {/* Local preview is a data URL, not a remote asset. */}
            <img src={preview} alt="Inspiration preview" className="h-20 w-20 rounded-[14px] object-cover" />
            <div className="flex gap-3 text-[14px]">
              <label className="text-coral">
                Replace
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
              </label>
              <button type="button" onClick={onClearFile} className="text-muted">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="flex h-24 flex-col items-center justify-center gap-1 rounded-[16px] border border-dashed border-nude bg-white text-[13px] text-brown">
              <ImagePlus size={18} />
              Choose photo
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
            </label>
            <label className="flex h-24 flex-col items-center justify-center gap-1 rounded-[16px] border border-dashed border-nude bg-white text-[13px] text-brown">
              <Camera size={18} />
              Take photo
              <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
            </label>
          </div>
        )}
      </div>
      </form>
  );
}
