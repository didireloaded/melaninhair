import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight } from "lucide-react";
import s1 from "@/assets/style-1.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";
import g1 from "@/assets/g1.jpg";

const styles = [
  { img: s1, title: "Silk Press", duration: "2h", price: "₦35k" },
  { img: s2, title: "Knotless Braids", duration: "5h", price: "₦60k" },
  { img: s3, title: "Natural Curls", duration: "1.5h", price: "₦25k" },
  { img: g1, title: "Sleek Ponytail", duration: "1h", price: "₦20k" },
];

export function Styles() {
  return (
    <section className="px-5 mt-16">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-1">The Collection</p>
          <h2 className="font-display text-3xl md:text-4xl">Signature styles</h2>
        </div>
        <Link to="/explore" className="text-xs text-muted-foreground hover:text-gold transition-colors">View all →</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {styles.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.07 }}
          >
            <Link to="/book" className="block group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5">
                <img src={s.img} alt={s.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-2 right-2 size-8 rounded-full glass-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="size-3.5" />
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 px-0.5">
                <div>
                  <h3 className="font-display text-base leading-tight">{s.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" /> {s.duration}
                  </div>
                </div>
                <span className="text-xs text-gold font-medium">{s.price}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
