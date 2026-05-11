import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, CheckCheck, ChevronLeft, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, requestPushPermission } from "@/lib/notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Melanin Hair" }] }),
  component: NotificationsPage,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { items, unread, markRead, markAllRead } = useNotifications(user?.id ?? null);
  const [perm, setPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPerm(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/notifications" } });
  }, [loading, user, navigate]);

  const enablePush = async () => {
    const result = await requestPushPermission();
    setPerm(result);
    if (result === "granted") toast.success("Notifications enabled");
    else if (result === "denied") toast.error("Permission blocked — enable in browser settings");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-32 px-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate({ to: "/" })}
            className="size-10 rounded-full glass-light flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h1 className="font-display text-2xl">Notifications</h1>
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="size-10 rounded-full glass-light flex items-center justify-center disabled:opacity-30"
            aria-label="Mark all as read"
            title="Mark all as read"
          >
            <CheckCheck className="size-4" />
          </button>
        </div>

        {perm !== "granted" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={enablePush}
            className="w-full mb-5 glass rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <div className="size-10 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
              {perm === "denied" ? (
                <BellOff className="size-4 text-primary-foreground" />
              ) : (
                <Bell className="size-4 text-primary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {perm === "denied" ? "Notifications blocked" : "Turn on notifications"}
              </p>
              <p className="text-xs text-muted-foreground">
                {perm === "denied"
                  ? "Enable in your browser settings to get booking updates."
                  : "Get instant alerts when your booking is confirmed."}
              </p>
            </div>
          </motion.button>
        )}

        {items.length === 0 ? (
          <div className="text-center pt-16">
            <div className="size-16 rounded-full glass-light mx-auto flex items-center justify-center">
              <Sparkles className="size-6 text-gold" />
            </div>
            <p className="font-display text-xl mt-4">All caught up</p>
            <p className="text-xs text-muted-foreground mt-2">New activity will show up here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((n) => {
                const Item = (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`rounded-2xl p-4 transition-colors cursor-pointer ${
                      n.read ? "bg-card/50 border border-border/40" : "glass border border-gold/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!n.read && <span className="mt-1.5 size-2 rounded-full bg-gradient-gold shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link to={n.link} className="block">
                        {Item}
                      </Link>
                    ) : (
                      Item
                    )}
                  </li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
