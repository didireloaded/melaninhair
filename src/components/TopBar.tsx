import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { NotificationBell } from "@/components/NotificationBell";

export function TopBar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 inset-x-0 z-40"
    >
      <div className="mx-auto max-w-md md:max-w-6xl px-5 pt-4">
        <div className="glass rounded-full flex items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-semibold">
              M
            </span>
            <span className="font-display text-lg leading-none">
              Melanin<span className="text-gold">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <a
              href="https://www.instagram.com/_melanin._.hair_/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="size-9 rounded-full hover:bg-white/5 flex items-center justify-center"
            >
              <Instagram className="size-4 text-gold" />
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
