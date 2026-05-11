import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/lib/notifications";

export function NotificationBell() {
  const { user } = useAuth();
  const { unread } = useNotifications(user?.id ?? null);

  return (
    <Link
      to="/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className="relative size-9 rounded-full hover:bg-white/5 flex items-center justify-center"
    >
      <Bell className="size-4 text-muted-foreground" />
      <AnimatePresence>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-gold text-primary-foreground text-[9px] font-semibold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
