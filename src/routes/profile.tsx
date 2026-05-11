import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChevronRight, Calendar, Heart, Bell, Settings, LogOut, Instagram } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Melanin Hair" }] }),
  component: ProfilePage,
});

const items = [
  { icon: Calendar, label: "My bookings", note: "1 upcoming" },
  { icon: Heart, label: "Saved looks", note: "3 styles" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-32 px-5">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-full bg-gradient-gold flex items-center justify-center font-display text-2xl text-primary-foreground">
            Z
          </div>
          <div>
            <h1 className="font-display text-2xl">Zara A.</h1>
            <p className="text-xs text-muted-foreground">Member since 2024</p>
            <Link to="/book" className="inline-block mt-2 text-[11px] text-gold">Book again →</Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-card overflow-hidden">
          {items.map(({ icon: Icon, label, note }, i) => (
            <button
              key={label}
              className={`w-full flex items-center gap-4 p-4 text-left ${i ? "border-t border-border/50" : ""}`}
            >
              <div className="size-10 rounded-xl glass-light flex items-center justify-center">
                <Icon className="size-4 text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{label}</p>
                {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <a
          href="https://www.instagram.com/_melanin._.hair_/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-3 p-4 rounded-3xl glass-light"
        >
          <Instagram className="size-4 text-gold" />
          <p className="text-sm">Follow @_melanin._.hair_</p>
          <ChevronRight className="size-4 text-muted-foreground ml-auto" />
        </a>

        <button className="mt-6 w-full p-4 rounded-3xl text-sm text-muted-foreground flex items-center justify-center gap-2">
          <LogOut className="size-4" /> Sign out
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
