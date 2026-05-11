import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Clock, X, Sparkles, Loader2, Calendar as Cal, MessageCircle } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { buildWhatsAppLink } from "@/lib/notifications";

export const Route = createFileRoute("/booking/$bookingId")({
  head: () => ({ meta: [{ title: "Booking Status — Melanin Hair" }] }),
  component: BookingStatusPage,
});

type Booking = {
  id: string;
  user_id: string;
  style_title: string;
  booking_date: string;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
  price_cents: number | null;
  created_at: string;
};

const STEPS: { key: Booking["status"]; label: string; sub: string }[] = [
  { key: "pending", label: "Request received", sub: "We've got your booking" },
  { key: "confirmed", label: "Confirmed by Hermine", sub: "Your slot is locked in" },
  { key: "completed", label: "Completed", sub: "Hope you loved it" },
];

function BookingStatusPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/booking/${bookingId}` } });
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (!data) setNotFound(true);
        else setBooking(data as Booking);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId, user, authLoading, navigate]);

  // Realtime: watch this booking's status changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
        (payload) => {
          setBooking((prev) => (prev ? { ...prev, ...(payload.new as Booking) } : (payload.new as Booking)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-5 animate-spin text-gold" />
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="mx-auto max-w-md pt-24 pb-32 px-5 text-center">
          <p className="font-display text-xl">Booking not found</p>
          <Link to="/profile" className="inline-block mt-4 text-xs text-gold">Back to your profile →</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const prettyDate = new Date(booking.booking_date + "T00:00:00").toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const cancelled = booking.status === "cancelled";
  const currentIdx = cancelled
    ? -1
    : Math.max(0, STEPS.findIndex((s) => s.key === booking.status));

  const waMsg = `Hi Hermine, I'm checking in about my ${booking.style_title} booking for ${prettyDate} at ${booking.booking_time}.`;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-32 px-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate({ to: "/notifications" })}
            className="size-10 rounded-full glass-light flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h1 className="font-display text-xl">Your booking</h1>
          <div className="size-10" />
        </div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 border border-gold/20"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Style</p>
          <p className="font-display text-2xl mt-1">{booking.style_title}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Cal className="size-3.5 text-gold" />
              {prettyDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-gold" />
              {booking.booking_time}
            </span>
          </div>
          <div className="mt-5">
            <StatusBadge status={booking.status} />
          </div>
        </motion.div>

        {/* Timeline */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold/80 mt-8 mb-4">Progress</p>
        <div className="rounded-3xl bg-card border border-border/50 p-5">
          {cancelled ? (
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <X className="size-4 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Booking cancelled</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reach out on WhatsApp if you'd like to reschedule.
                </p>
              </div>
            </div>
          ) : (
            <ol className="space-y-5">
              {STEPS.map((s, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <li key={s.key} className="flex items-start gap-3">
                    <div className="relative">
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: done || active ? "var(--color-gold, #c9a84c)" : "transparent",
                          scale: active ? 1.05 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`size-9 rounded-full flex items-center justify-center border ${
                          done || active ? "border-gold" : "border-border"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {done ? (
                            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check className="size-4 text-primary-foreground" />
                            </motion.span>
                          ) : active ? (
                            <motion.span
                              key="pulse"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Sparkles className="size-4 text-primary-foreground" />
                            </motion.span>
                          ) : (
                            <motion.span
                              key="num"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-[11px] text-muted-foreground"
                            >
                              {i + 1}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      {i < STEPS.length - 1 && (
                        <span
                          className={`absolute left-1/2 top-9 -translate-x-1/2 w-px h-5 ${
                            done ? "bg-gold/60" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm ${active ? "font-medium" : done ? "" : "text-muted-foreground"}`}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                      {active && booking.status === "pending" && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] text-gold mt-1"
                        >
                          Waiting on Hermine to confirm…
                        </motion.p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Details */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mt-8 mb-3">Details</p>
        <div className="rounded-3xl bg-card border border-border/50 divide-y divide-border/50">
          <Row label="Name" value={booking.contact_name ?? "—"} />
          <Row label="Phone" value={booking.contact_phone ?? "—"} />
          {booking.notes && <Row label="Notes" value={booking.notes} />}
          <Row
            label="Reference"
            value={`#${booking.id.slice(0, 8).toUpperCase()}`}
          />
        </div>

        {/* Actions */}
        <a
          href={buildWhatsAppLink(waMsg)}
          target="_blank"
          rel="noreferrer"
          className="mt-6 w-full p-4 rounded-3xl bg-gradient-gold text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="size-4" /> Message Hermine
        </a>
        <Link
          to="/profile"
          className="mt-3 w-full p-4 rounded-3xl glass-light text-sm flex items-center justify-center"
        >
          Back to profile
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-right">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const map: Record<Booking["status"], { label: string; cls: string }> = {
    pending: { label: "Pending confirmation", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    completed: { label: "Completed", cls: "bg-muted-foreground/10 text-muted-foreground border-border" },
    cancelled: { label: "Cancelled", cls: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
  };
  const s = map[status];
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border ${s.cls}`}
    >
      {s.label}
    </motion.span>
  );
}
