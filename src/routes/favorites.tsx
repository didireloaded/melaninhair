import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Heart } from "lucide-react";
import s2 from "@/assets/style-2.jpg";
import g1 from "@/assets/g1.jpg";
import g3 from "@/assets/g3.jpg";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Saved looks — Melanin Hair" }] }),
  component: FavoritesPage,
});

const saved = [
  { img: s2, title: "Honey Knotless" },
  { img: g3, title: "Soft Curls" },
  { img: g1, title: "Mirror Press" },
];

function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-32 px-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Your library</p>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Saved looks</h1>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {saved.map((s, i) => (
            <Link to="/book" key={i} className="block">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={s.img} alt={s.title} loading="lazy" className="size-full object-cover" />
                <div className="absolute top-2 right-2 size-8 rounded-full glass flex items-center justify-center">
                  <Heart className="size-3.5 text-gold fill-gold" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="font-display text-sm">{s.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
