import { motion } from "framer-motion";
import s1 from "@/assets/style-1.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";

const items = [
  { img: s1, title: "Sleek Bob", tag: "Worldwide #1" },
  { img: s2, title: "Honey Braids", tag: "Trending" },
  { img: s3, title: "Cloud Afro", tag: "Editorial" },
];

export function Trending() {
  return (
    <section className="px-5 mt-16">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-1">Inspiration</p>
          <h2 className="font-display text-3xl md:text-4xl">Trending worldwide</h2>
        </div>
        <span className="text-xs text-muted-foreground">3 looks</span>
      </div>
      <div className="-mx-5 px-5 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {items.map((it, i) => (
          <motion.article
            key={it.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1 }}
            className="relative snap-start shrink-0 w-[78%] md:w-80 aspect-[3/4] rounded-3xl overflow-hidden group"
          >
            <img src={it.img} alt={it.title} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 glass-light rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest">
              {it.tag}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-display text-2xl">{it.title}</h3>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
