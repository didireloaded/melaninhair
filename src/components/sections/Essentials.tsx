import { motion } from "framer-motion";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";

const products = [
  { img: p1, name: "Edge Trio", note: "Daily care set", price: "N$320" },
  { img: p2, name: "Glow Hair Oil", note: "Cold-pressed", price: "N$240" },
  { img: p3, name: "Boar Brush", note: "Hand-finished", price: "N$180" },
];

export function Essentials() {
  return (
    <section className="px-5 mt-20">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-1">Curated</p>
          <h2 className="font-display text-3xl md:text-4xl">Essentials I love</h2>
        </div>
        <span className="text-xs text-muted-foreground">Hand-picked</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {products.map((p, i) => (
          <motion.a
            key={p.name}
            href="#"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.08 }}
            className="block group"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-cream/5 mb-2">
              <img src={p.img} alt={p.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="text-xs font-medium leading-tight">{p.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{p.note}</p>
            <p className="text-[11px] text-gold mt-1">{p.price}</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
