import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Calendar as Cal, Clock, Sparkles, Loader2, Phone, User as UserIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { buildWhatsAppLink, requestPushPermission } from "@/lib/notifications";

export const Route = createFileRoute("/book")({
  head: () => ({ meta: [{ title: "Book Your Session — Melanin Hair" }] }),
  component: BookPage,
});

type Style = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number | null;
  duration_minutes: number | null;
};

const SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"];
// Mon–Sat (closed Sundays).
const isOpenDay = (d: Date) => d.getDay() !== 0;

const fmtPrice = (c: number | null) =>
  c == null ? "—" : `N$${(c / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtDuration = (m: number | null) =>
  m == null ? "" : m >= 60 ? `${Math.round((m / 60) * 10) / 10}h` : `${m}m`;
const ymd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function BookPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [styles, setStyles] = useState<Style[]>([]);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null); // yyyy-mm-dd
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // availability: { 'yyyy-mm-dd': Set<'HH:MM' | '*'> } — '*' means full day blocked
  const [blocks, setBlocks] = useState<Record<string, Set<string>>>({});
  // existing bookings to prevent double-booking
  const [taken, setTaken] = useState<Record<string, Set<string>>>({});

  // 14-day horizon
  const horizon = useMemo(() => {
    const out: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push(d);
    }
    return out;
  }, []);

  // Load styles + availability + existing bookings
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const startDate = ymd(horizon[0]);
      const endDate = ymd(horizon[horizon.length - 1]);

      const [stylesRes, blocksRes, bookingsRes] = await Promise.all([
        supabase.from("styles").select("id,title,description,price_cents,duration_minutes")
          .eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("availability_blocks").select("blocked_date,blocked_time")
          .gte("blocked_date", startDate).lte("blocked_date", endDate),
        supabase.from("bookings").select("booking_date,booking_time,status")
          .gte("booking_date", startDate).lte("booking_date", endDate)
          .in("status", ["pending", "confirmed"]),
      ]);

      if (cancelled) return;
      if (stylesRes.data) setStyles(stylesRes.data as Style[]);

      const b: Record<string, Set<string>> = {};
      for (const row of blocksRes.data ?? []) {
        const k = row.blocked_date as string;
        if (!b[k]) b[k] = new Set();
        b[k].add(row.blocked_time ?? "*");
      }
      setBlocks(b);

      const t: Record<string, Set<string>> = {};
      for (const row of bookingsRes.data ?? []) {
        const k = row.booking_date as string;
        if (!t[k]) t[k] = new Set();
        t[k].add(row.booking_time as string);
      }
      setTaken(t);
    })();
    return () => { cancelled = true; };
  }, [horizon]);

  // Is a date selectable?
  const dateUnavailable = (d: Date) => {
    if (!isOpenDay(d)) return true;
    const k = ymd(d);
    const blocked = blocks[k];
    if (blocked?.has("*")) return true;
    // All slots gone (blocked + booked combined)?
    const used = new Set<string>([
      ...Array.from(blocked ?? []).filter((s) => s !== "*"),
      ...Array.from(taken[k] ?? []),
    ]);
    // Also consider past times for today
    const now = new Date();
    if (ymd(now) === k) {
      for (const slot of SLOTS) {
        const [h, m] = slot.split(":").map(Number);
        const slotDate = new Date(d);
        slotDate.setHours(h, m, 0, 0);
        if (slotDate.getTime() <= now.getTime()) used.add(slot);
      }
    }
    return SLOTS.every((s) => used.has(s));
  };

  const slotUnavailable = (d: string, t: string) => {
    if (blocks[d]?.has("*")) return true;
    if (blocks[d]?.has(t)) return true;
    if (taken[d]?.has(t)) return true;
    const today = ymd(new Date());
    if (d === today) {
      const [h, m] = t.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (slotDate.getTime() <= Date.now()) return true;
    }
    return false;
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const phoneOk = /^[+\d][\d\s()-]{6,}$/.test(contactPhone.trim());
  const canNext =
    (step === 0 && styleId !== null) ||
    (step === 1 && date !== null && time !== null) ||
    (step === 2 && contactName.trim().length >= 2 && phoneOk) ||
    step === 3;

  const selectedStyle = styles.find((s) => s.id === styleId) ?? null;

  const confirm = async () => {
    if (!user) {
      toast.info("Please sign in to confirm your booking");
      navigate({ to: "/login", search: { redirect: "/book" } });
      return;
    }
    if (!styleId || !date || !time || !selectedStyle) return;
    setSubmitting(true);
    try {
      // Re-check the slot at submit time (someone may have grabbed it)
      const { data: clash } = await supabase
        .from("bookings")
        .select("id")
        .eq("booking_date", date)
        .eq("booking_time", time)
        .in("status", ["pending", "confirmed"])
        .limit(1);
      if (clash && clash.length > 0) {
        toast.error("That slot was just taken — please pick another time.");
        setSubmitting(false);
        setStep(1);
        return;
      }
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        style_id: styleId,
        style_title: selectedStyle.title,
        price_cents: selectedStyle.price_cents,
        booking_date: date,
        booking_time: time,
        notes: notes || null,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        status: "pending",
      });
      if (error) throw error;

      // Build the WhatsApp message for the owner
      const prettyDate = new Date(date + "T00:00:00").toLocaleDateString("en", {
        weekday: "long", month: "short", day: "numeric",
      });
      const priceLine = selectedStyle.price_cents != null
        ? `\nPrice: ${fmtPrice(selectedStyle.price_cents)}` : "";
      const notesLine = notes ? `\nNotes: ${notes}` : "";
      const message =
        `Hi Hermine — I just booked on Melanin Hair ✨\n\n` +
        `Name: ${contactName.trim()}\n` +
        `Phone: ${contactPhone.trim()}\n` +
        `Style: ${selectedStyle.title}\n` +
        `Date: ${prettyDate}\n` +
        `Time: ${time}` + priceLine + notesLine;

      // Open WhatsApp in a new tab so the owner gets a direct message
      window.open(buildWhatsAppLink(message), "_blank", "noopener");

      // Politely ask for notification permission so we can ping on confirmation
      requestPushPermission();

      toast.success("Booking sent — opening WhatsApp to notify Hermine.");
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-40 px-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={step === 0 ? undefined : back}
            className="size-10 rounded-full glass-light flex items-center justify-center disabled:opacity-30"
            disabled={step === 0}
            aria-label="Back"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Step {step + 1} of 4
          </p>
          <div className="size-10" />
        </div>

        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mb-8">
          <motion.div animate={{ width: `${((step + 1) / 4) * 100}%` }} className="h-full bg-gradient-gold" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {step === 0 && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">Pick your look.</h1>
                <p className="text-xs text-muted-foreground mt-2">Choose the style you'd love this time.</p>
                {styles.length === 0 ? (
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Loading services…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    {styles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyleId(s.id)}
                        className={`relative text-left rounded-3xl overflow-hidden transition-all bg-card p-5 ${
                          styleId === s.id ? "ring-2 ring-gold" : "border border-border/50"
                        }`}
                      >
                        <p className="font-display text-xl leading-tight">{s.title}</p>
                        {s.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" /> {fmtDuration(s.duration_minutes)}
                          </p>
                          <p className="text-sm text-gold">{fmtPrice(s.price_cents)}</p>
                        </div>
                        {styleId === s.id && (
                          <div className="absolute top-3 right-3 size-7 rounded-full bg-gradient-gold flex items-center justify-center">
                            <Check className="size-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">When works?</h1>
                <p className="text-xs text-muted-foreground mt-2">Pick a day & time. Greyed-out dates aren't available.</p>
                <p className="text-[11px] uppercase tracking-widest text-gold/80 mt-6 mb-3 flex items-center gap-1.5">
                  <Cal className="size-3" /> Date · next 14 days
                </p>
                <div className="-mx-5 px-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {horizon.map((d, i) => {
                    const k = ymd(d);
                    const off = dateUnavailable(d);
                    const sel = date === k;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (off) return;
                          setDate(k);
                          setTime(null);
                        }}
                        disabled={off}
                        className={`shrink-0 w-16 py-3 rounded-2xl text-center transition-all ${
                          sel ? "bg-gradient-gold text-primary-foreground"
                          : off ? "bg-secondary/40 text-muted-foreground/40 line-through cursor-not-allowed"
                          : "glass-light"
                        }`}
                      >
                        <p className="text-[10px] uppercase">{d.toLocaleDateString("en", { weekday: "short" })}</p>
                        <p className="font-display text-xl mt-0.5">{d.getDate()}</p>
                        <p className="text-[9px] uppercase mt-0.5 opacity-70">{d.toLocaleDateString("en", { month: "short" })}</p>
                      </button>
                    );
                  })}
                </div>
                {date && (
                  <>
                    <p className="text-[11px] uppercase tracking-widest text-gold/80 mt-7 mb-3 flex items-center gap-1.5">
                      <Clock className="size-3" /> Time
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {SLOTS.map((t) => {
                        const off = slotUnavailable(date, t);
                        const sel = time === t;
                        return (
                          <button
                            key={t}
                            onClick={() => !off && setTime(t)}
                            disabled={off}
                            className={`py-3 rounded-2xl text-sm transition-all ${
                              sel ? "bg-gradient-gold text-primary-foreground"
                              : off ? "bg-secondary/40 text-muted-foreground/40 line-through cursor-not-allowed"
                              : "glass-light"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">Your details.</h1>
                <p className="text-xs text-muted-foreground mt-2">So Hermine can reach you on WhatsApp.</p>

                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Full name"
                      autoComplete="name"
                      className="w-full bg-card rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border border-border/50 focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="WhatsApp number (e.g. +264 81 …)"
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full bg-card rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border border-border/50 focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Inspirations, sensitivities, or special requests… (optional)"
                    className="w-full bg-card rounded-2xl p-4 text-sm outline-none border border-border/50 focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </>
            )}

            {step === 3 && !done && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">All set.</h1>
                <p className="text-xs text-muted-foreground mt-2">Review and confirm your booking.</p>
                <div className="mt-6 rounded-3xl bg-card p-5 space-y-3 border border-border/50">
                  <Row label="Style" value={selectedStyle?.title ?? "—"} />
                  <Row
                    label="Date"
                    value={date ? new Date(date + "T00:00:00").toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" }) : "—"}
                  />
                  <Row label="Time" value={time ?? "—"} />
                  <Row label="Name" value={contactName || "—"} />
                  <Row label="Phone" value={contactPhone || "—"} />
                  {notes && <Row label="Notes" value={notes} />}
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="text-sm">Total</span>
                    <span className="text-sm text-gold">{fmtPrice(selectedStyle?.price_cents ?? null)}</span>
                  </div>
                </div>
                {!authLoading && !user && (
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    You'll be asked to sign in to confirm.
                  </p>
                )}
              </>
            )}

            {done && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-12">
                <div className="size-20 rounded-full bg-gradient-gold mx-auto flex items-center justify-center shadow-[var(--shadow-glow)]">
                  <Sparkles className="size-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-3xl mt-6">You're booked, love.</h2>
                <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
                  Your request is in — you'll get a confirmation once Melanin reviews it. Track it in your profile.
                </p>
                <div className="mt-8 flex gap-2 justify-center">
                  <Link to="/profile" className="px-6 py-3 rounded-full bg-gradient-gold text-primary-foreground text-sm">
                    View bookings
                  </Link>
                  <Link to="/" className="px-6 py-3 rounded-full glass-light text-sm">
                    Back home
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!done && (
        <div className="fixed bottom-24 inset-x-0 px-5 z-30">
          <div className="mx-auto max-w-md">
            <button
              onClick={step === 3 ? confirm : next}
              disabled={!canNext || submitting}
              className="w-full h-14 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-[var(--shadow-glow)] disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {step === 3 ? "Confirm Booking" : "Continue"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
