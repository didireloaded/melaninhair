import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import s1 from "@/assets/style-1.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Styles — Melanin Hair" },
      { name: "description", content: "Browse the full Melanin Hair style collection." },
    ],
  }),
  component: ExplorePage,
});

const cats = ["All", "Braids", "Naturals", "Silk Press", "Wigs", "Color"];
const all = [
  { img: s2, title: "Honey Knotless", price: "₦60k" },
  { img: s1, title: "Glass Bob", price: "₦35k" },
  { img: s3, title: "Cloud Afro", price: "₦25k" },
  { img: g1, title: "Mirror Press", price: "₦40k" },
  { img: g3, title: "Soft Curls", price: "₦28k" },
  { img: g2, title: "French Braid", price: "₦22k" },
];

function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-3xl pt-24 pb-32 px-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80">The collection</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Explore styles</h1>
        </motion.div>
        <div className="-mx-5 px-5 mt-5 flex gap-2 overflow-x-auto scrollbar-hide">
          {cats.map((c, i) => (
            <button
              key={c}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs ${i === 0 ? "bg-gradient-gold text-primary-foreground" : "glass-light"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {all.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to="/book" className="block">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2">
                  <img src={s.img} alt={s.title} loading="lazy" className="size-full object-cover" />
                </div>
                <div className="flex justify-between px-0.5">
                  <p className="font-display text-base">{s.title}</p>
                  <p className="text-xs text-gold">{s.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
