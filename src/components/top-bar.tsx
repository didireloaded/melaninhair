"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { whatsappHref } from "@/lib/booking/phone";

export function TopBar({
  businessName,
  whatsapp,
  instagram,
}: {
  businessName: string;
  whatsapp: string;
  instagram: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="flex items-center justify-between px-3 pt-[max(10px,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-full text-ink"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <a
          aria-label="WhatsApp Entranced Beauty"
          href={whatsappHref(whatsapp, "Hi Entranced Beauty, I would like to ask about an appointment.")}
          className="grid h-11 w-11 place-items-center rounded-full text-ink"
        >
          <MessageCircle size={21} strokeWidth={1.75} />
        </a>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-chocolate/30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 rounded-t-[26px] border border-white/70 bg-white/88 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(70,51,50,0.08)] backdrop-blur-xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-nude" />
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] text-muted">Studio</p>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center">
                <X size={18} />
              </button>
            </div>
            <nav className="grid">
              {[
                ["/portfolio", "Portfolio"],
                ["/services", "Services"],
                ["/contact", "Contact"],
                ["/policies", "Before you book"],
              ].map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="border-b border-line py-3.5 text-[17px]">
                  {label}
                </Link>
              ))}
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 text-[17px]"
              >
                Instagram
              </a>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
