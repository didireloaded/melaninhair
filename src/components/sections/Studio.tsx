import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Instagram } from "lucide-react";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";

const grid = [
  { src: g1, span: "row-span-2", caption: "Mirror, mirror — silk press magic" },
  { src: g2, span: "", caption: "Behind every braid, an hour of love" },
  { src: g3, span: "", caption: "Gold hour, gold hoops" },
  { src: s3, span: "row-span-2", caption: "Volume that speaks for itself" },
  { src: s2, span: "", caption: "Honey-tipped knotless" },
  { src: g4, span: "", caption: "Studio sessions, all day" },
];

export function Studio() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section className="px-5 mt-20">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-1 flex items-center gap-1.5">
            <Instagram className="size-3" /> @_melanin._.hair_
          </p>
          <h2 className="font-display text-3xl md:text-4xl">Live from the studio</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-[repeat(4,minmax(120px,1fr))] gap-3 auto-rows-[140px]">
        {grid.map((g, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActive(i)}
            className={`relative rounded-2xl overflow-hidden group ${g.span}`}
          >
            <img src={g.src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 24 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md z-50 rounded-3xl overflow-hidden bg-card shadow-[var(--shadow-soft)]"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 z-10 size-9 rounded-full glass flex items-center justify-center"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <img src={grid[active].src} alt="" className="w-full aspect-square object-cover" />
              <div className="p-5">
                <p className="text-sm leading-relaxed">{grid[active].caption}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button className="text-xs text-gold flex items-center gap-1.5">
                    <Heart className="size-3.5" /> Save look
                  </button>
                  <button className="text-xs glass-light px-3 py-1.5 rounded-full">Book this style</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
