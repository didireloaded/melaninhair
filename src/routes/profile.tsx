import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChevronRight, Calendar, Heart, LogOut, Instagram, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Melanin Hair" }] }),
  component: ProfilePage,
});

type Booking = {
  id: string;
  style_title: string;
  booking_date: string;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  price_cents: number | null;
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [name, setName] = useState<string>("");
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/profile" } });
      return;
    }
    setLoadingBookings(true);
    Promise.all([
      supabase.from("bookings").select("id,style_title,booking_date,booking_time,status,price_cents")
        .order("booking_date", { ascending: false }).limit(20),
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      supabase.from("favorites").select("id", { count: "exact", head: true }),
    ]).then(([b, p, f]) => {
      setBookings((b.data ?? []) as Booking[]);
      setName(p.data?.display_name ?? user.email?.split("@")[0] ?? "Friend");
      setFavCount(f.count ?? 0);
      setLoadingBookings(false);
    });
  }, [user, loading, navigate]);

  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.booking_date) >= new Date(new Date().toDateString())
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-5 animate-spin text-gold" />
      </div>
    );
  }

  const initial = (name || "M").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-32 px-5">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-full bg-gradient-gold flex items-center justify-center font-display text-2xl text-primary-foreground">
            {initial}
          </div>
          <div>
            <h1 className="font-display text-2xl">{name}</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Link to="/book" className="inline-block mt-2 text-[11px] text-gold">Book again →</Link>
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-[0.2em] text-gold/80 mt-8 mb-3">Upcoming</p>
        <div className="rounded-3xl bg-card overflow-hidden border border-border/50">
          {loadingBookings ? (
            <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading bookings…
            </div>
          ) : upcoming.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No upcoming bookings yet.</p>
              <Link to="/book" className="inline-block mt-3 text-[11px] text-gold">Book a session →</Link>
            </div>
          ) : (
            upcoming.map((b, i) => (
              <div key={b.id} className={`p-4 ${i ? "border-t border-border/50" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{b.style_title}</p>
                  <StatusPill status={b.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(b.booking_date + "T00:00:00").toLocaleDateString("en", {
                    weekday: "long", month: "short", day: "numeric",
                  })} · {b.booking_time}
                </p>
              </div>
            ))
          )}
        </div>

        {bookings.length > upcoming.length && (
          <>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mt-6 mb-3">Past</p>
            <div className="rounded-3xl bg-card overflow-hidden border border-border/50">
              {bookings.filter((b) => !upcoming.includes(b)).slice(0, 5).map((b, i) => (
                <div key={b.id} className={`p-4 ${i ? "border-t border-border/50" : ""}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{b.style_title}</p>
                    <StatusPill status={b.status} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(b.booking_date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} · {b.booking_time}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 rounded-3xl bg-card overflow-hidden border border-border/50">
          <Link to="/favorites" className="w-full flex items-center gap-4 p-4 text-left">
            <div className="size-10 rounded-xl glass-light flex items-center justify-center">
              <Heart className="size-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm">Saved looks</p>
              <p className="text-[11px] text-muted-foreground">{favCount} {favCount === 1 ? "style" : "styles"}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link to="/book" className="w-full flex items-center gap-4 p-4 text-left border-t border-border/50">
            <div className="size-10 rounded-xl glass-light flex items-center justify-center">
              <Calendar className="size-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm">New booking</p>
              <p className="text-[11px] text-muted-foreground">Pick a style & time</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          {isAdmin && (
            <Link to="/admin" className="w-full flex items-center gap-4 p-4 text-left border-t border-border/50">
              <div className="size-10 rounded-xl glass-light flex items-center justify-center">
                <Shield className="size-4 text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Studio admin</p>
                <p className="text-[11px] text-muted-foreground">Bookings & availability</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          )}
        </div>

        <a
          href="https://www.instagram.com/_melanin._.hair_/"
          target="_blank" rel="noreferrer"
          className="mt-4 flex items-center gap-3 p-4 rounded-3xl glass-light"
        >
          <Instagram className="size-4 text-gold" />
          <p className="text-sm">Follow @_melanin._.hair_</p>
          <ChevronRight className="size-4 text-muted-foreground ml-auto" />
        </a>

        <button
          onClick={async () => {
            await signOut();
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
          className="mt-6 w-full p-4 rounded-3xl text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </main>
      <BottomNav />
    </div>
  );
}

function StatusPill({ status }: { status: Booking["status"] }) {
  const map: Record<Booking["status"], string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    completed: "bg-muted-foreground/10 text-muted-foreground border-border",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}
