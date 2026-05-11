import { motion } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import s3 from "@/assets/style-3.jpg";

export function TryOn() {
  return (
    <section className="px-5 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-secondary p-6 md:p-10"
      >
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="size-20 md:size-32 rounded-2xl overflow-hidden">
              <img src={s3} alt="" loading="lazy" className="size-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">New</p>
            <h3 className="font-display text-xl md:text-3xl mt-1 leading-tight">Try it on, virtually.</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1.5 line-clamp-2">
              See any style on you before booking — gentle, private, magical.
            </p>
            <button className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-gold">
              <Camera className="size-3.5" /> Open camera
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
