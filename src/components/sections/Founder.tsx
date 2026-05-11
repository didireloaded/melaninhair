import { motion } from "framer-motion";
import { Home, Heart, Sparkles } from "lucide-react";
import founder from "@/assets/founder.jpg";

export function Founder() {
  return (
    <section className="px-5 mt-20">
      <div className="relative overflow-hidden rounded-3xl bg-card">
        <div className="grid md:grid-cols-2 gap-0">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] md:aspect-auto"
          >
            <img src={founder} alt="The founder" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r" />
          </motion.div>
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-2">Meet your stylist</p>
            <h2 className="font-display text-4xl md:text-5xl leading-[0.95]">
              Hi, I'm <span className="italic text-gradient-gold">Amara.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              For seven years I've made hair feel like a love letter — from
              quiet wash days to wedding-morning glamour. Every appointment
              is just you, me, and the look you've been holding onto.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: Heart, label: "Curls & Naturals" },
                { icon: Sparkles, label: "Braids & Wigs" },
                { icon: Home, label: "Home calls" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl bg-secondary/60 p-3 text-center">
                  <Icon className="size-4 text-gold mx-auto mb-1.5" />
                  <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
