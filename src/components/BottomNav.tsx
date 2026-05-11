import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, Calendar, Heart, User } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = {
  to: "/" | "/explore" | "/book" | "/favorites" | "/profile";
  label: string;
  icon: typeof Home;
  primary?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/book", label: "Book", icon: Calendar, primary: true },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", damping: 20 }}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md"
    >
      <div className="glass rounded-full px-3 py-2.5 flex items-center justify-between shadow-[var(--shadow-soft)]">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to;
          if (primary) {
            return (
              <Link
                key={to}
                to={to}
                className="relative -mt-7 flex flex-col items-center"
                aria-label={label}
              >
                <div className="size-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-[var(--shadow-glow)] ring-4 ring-background">
                  <Icon className="size-6 text-primary-foreground" strokeWidth={2.2} />
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
              aria-label={label}
            >
              <Icon
                className={`size-5 transition-colors ${active ? "text-gold" : "text-muted-foreground"}`}
                strokeWidth={1.8}
              />
              <span className={`text-[10px] tracking-wide ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="navdot"
                  className="absolute -bottom-0.5 size-1 rounded-full bg-gold"
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
