import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <motion.img
        src={hero}
        alt="Editorial portrait"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-overlay" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex h-full flex-col justify-between px-6 pt-24 pb-32 md:pb-12 max-w-md md:max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="self-start glass-light rounded-full px-3 py-1.5 flex items-center gap-1.5"
        >
          <Sparkles className="size-3 text-gold" />
          <span className="text-[11px] tracking-widest uppercase">Independent Stylist · Lagos</span>
        </motion.div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-display text-[15vw] md:text-7xl leading-[0.95] tracking-tight"
          >
            Hair as
            <br />
            <span className="italic text-gradient-gold">your crown.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-sm md:text-base text-cream/80 max-w-sm leading-relaxed"
          >
            A private hairstyling experience by Melanin Hair —
            crafted in studio or at home, just for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-7 flex items-center gap-3"
          >
            <Link
              to="/book"
              className="group flex items-center gap-2 bg-gradient-gold text-primary-foreground rounded-full pl-5 pr-2 py-2 font-medium text-sm shadow-[var(--shadow-glow)]"
            >
              Book Your Session
              <span className="size-8 rounded-full bg-background/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <Link
              to="/explore"
              className="text-sm font-medium text-cream/90 px-4 py-2 rounded-full glass-light"
            >
              Explore Styles
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
