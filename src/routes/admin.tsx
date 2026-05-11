import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, X, Calendar as Cal, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Studio Admin — Melanin Hair" }] }),
  component: AdminPage,
});

const SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"];

type Booking = {
  id: string;
  user_id: string;
  style_title: string;
  booking_date: string;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  price_cents: number | null;
  notes: string | null;
  created_at: string;
};
type Block = { id: string; blocked_date: string; blocked_time: string | null; reason: string | null };

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"bookings" | "availability">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [busy, setBusy] = useState(false);
  const [newDate, setNewDate] = useState<string>(ymd(new Date()));
  const [newTime, setNewTime] = useState<string>("*");
  const [newReason, setNewReason] = useState("");

  const refresh = useCallback(async () => {
    setBusy(true);
    const [b, a] = await Promise.all([
      supabase.from("bookings").select("*").order("booking_date", { ascending: true }).order("booking_time", { ascending: true }).limit(100),
      supabase.from("availability_blocks").select("*").order("blocked_date", { ascending: true }).limit(100),
    ]);
    setBookings((b.data ?? []) as Booking[]);
    setBlocks((a.data ?? []) as Block[]);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", search: { redirect: "/admin" } }); return; }
    if (!isAdmin) return;
    refresh();
  }, [user, isAdmin, loading, navigate, refresh]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-5 animate-spin text-gold" /></div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="pt-32 px-5 mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl">Studio only.</h1>
          <p className="text-sm text-muted-foreground mt-3">This area is for the stylist. Ask Melanin to grant you access.</p>
          <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-full glass-light text-sm">Back home</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const setStatus = async (id: string, status: Booking["status"]) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking ${status}`);
    setBookings((bs) => bs.map((b) => b.id === id ? { ...b, status } : b));
  };

  const addBlock = async () => {
    if (!newDate) return;
    const payload: { blocked_date: string; blocked_time: string | null; reason: string | null } = {
      blocked_date: newDate,
      blocked_time: newTime === "*" ? null : newTime,
      reason: newReason || null,
    };
    const { error } = await supabase.from("availability_blocks").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Block added");
    setNewReason("");
    refresh();
  };

  const removeBlock = async (id: string) => {
    const { error } = await supabase.from("availability_blocks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-3xl pt-24 pb-32 px-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Studio</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1">Admin</h1>

        <div className="mt-6 inline-flex p-1 rounded-full glass-light">
          {(["bookings", "availability"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-colors ${
                tab === t ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {busy && <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>}

        {tab === "bookings" && (
          <div className="mt-6 space-y-2">
            {bookings.length === 0 && !busy && (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
            {bookings.map((b) => (
              <div key={b.id} className="rounded-2xl bg-card border border-border/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg truncate">{b.style_title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(b.booking_date + "T00:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })} · {b.booking_time}
                    </p>
                    {b.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{b.notes}"</p>}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                    b.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : b.status === "cancelled" ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-muted-foreground/10 text-muted-foreground border-border"
                  }`}>{b.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status !== "confirmed" && (
                    <button onClick={() => setStatus(b.id, "confirmed")} className="text-xs px-3 py-1.5 rounded-full bg-gradient-gold text-primary-foreground flex items-center gap-1">
                      <Check className="size-3" /> Confirm
                    </button>
                  )}
                  {b.status !== "completed" && (
                    <button onClick={() => setStatus(b.id, "completed")} className="text-xs px-3 py-1.5 rounded-full glass-light">
                      Mark done
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button onClick={() => setStatus(b.id, "cancelled")} className="text-xs px-3 py-1.5 rounded-full glass-light text-rose-400 flex items-center gap-1">
                      <X className="size-3" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "availability" && (
          <div className="mt-6">
            <div className="rounded-3xl bg-card border border-border/50 p-5">
              <p className="text-[11px] uppercase tracking-widest text-gold/80 mb-3 flex items-center gap-1.5">
                <Cal className="size-3" /> Block a date or slot
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="date"
                  value={newDate}
                  min={ymd(new Date())}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-secondary/40 rounded-xl px-3 py-2.5 text-sm outline-none"
                />
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-secondary/40 rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  <option value="*">Whole day</option>
                  {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  placeholder="Reason (optional)"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="bg-secondary/40 rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <button onClick={addBlock} className="mt-3 px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground text-xs flex items-center gap-1.5">
                <Plus className="size-3" /> Add block
              </button>
            </div>

            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70 mt-6 mb-3">Existing blocks</p>
            <div className="space-y-2">
              {blocks.length === 0 && <p className="text-sm text-muted-foreground">Nothing blocked — you're fully open.</p>}
              {blocks.map((b) => (
                <div key={b.id} className="rounded-2xl bg-card border border-border/50 p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">
                      {new Date(b.blocked_date + "T00:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      <span className="text-muted-foreground">{b.blocked_time ?? "Whole day"}</span>
                    </p>
                    {b.reason && <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.reason}</p>}
                  </div>
                  <button onClick={() => removeBlock(b.id)} className="size-9 rounded-full glass-light flex items-center justify-center text-rose-400" aria-label="Remove">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
