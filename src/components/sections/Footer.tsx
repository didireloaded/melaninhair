import { Instagram, MessageCircle, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="px-5 mt-20 pb-32 md:pb-12">
      <div className="rounded-3xl bg-card p-8 md:p-10 text-center">
        <h3 className="font-display text-3xl md:text-4xl leading-tight">
          Ready when <span className="italic text-gradient-gold">you are.</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-3 max-w-xs mx-auto">
          Reach out on the platform you live on — replies within the hour, most days.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/_melanin._.hair_/"
            target="_blank"
            rel="noreferrer"
            className="size-11 rounded-full glass-light flex items-center justify-center"
            aria-label="Instagram"
          >
            <Instagram className="size-4 text-gold" />
          </a>
          <a
            href="https://wa.me/"
            className="size-11 rounded-full glass-light flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <MessageCircle className="size-4 text-gold" />
          </a>
          <Link
            to="/book"
            className="px-5 h-11 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium flex items-center whitespace-nowrap"
          >
            Book a session
          </Link>
        </div>
        <div className="mt-7 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="size-3" /> Ongwediva, Namibia · home calls across town
        </div>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-6 tracking-widest uppercase">
        © Melanin Hair Studio
      </p>
    </footer>
  );
}
