import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Instagram, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";

type Item = {
  src: string;
  caption: string;
  permalink?: string;
  span?: string;
};

const fallback: Item[] = [
  { src: g1, span: "row-span-2", caption: "Mirror, mirror — silk press magic" },
  { src: g2, span: "", caption: "Behind every braid, an hour of love" },
  { src: g3, span: "", caption: "Gold hour, gold hoops" },
  { src: s3, span: "row-span-2", caption: "Volume that speaks for itself" },
  { src: s2, span: "", caption: "Honey-tipped knotless" },
  { src: g4, span: "", caption: "Studio sessions, all day" },
];

const spans = ["row-span-2", "", "", "row-span-2", "", ""];

export function Studio() {
  const [active, setActive] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>(fallback);
  const [source, setSource] = useState<"instagram" | "studio" | "curated">("curated");
  // Per-tile fallback chain: gallery_items url → curated local image.
  const [galleryFallbacks, setGalleryFallbacks] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Always fetch the curated gallery in parallel — used as a fallback layer
      // for any individual broken Instagram tile (CDN URLs expire).
      const galleryPromise = supabase
        .from("gallery_items")
        .select("media_url,caption,instagram_permalink")
        .order("sort_order", { ascending: true })
        .limit(12);

      // 1) Try live Instagram (server route already validated reachability).
      try {
        const res = await fetch("/api/instagram");
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.items) && data.items.length) {
          setItems(
            data.items.slice(0, 6).map((n: any, i: number) => ({
              src: n.media_url,
              caption: n.caption?.split("\n")[0] || "From the studio",
              permalink: n.permalink,
              span: spans[i] ?? "",
            }))
          );
          setSource("instagram");
          const { data: gallery } = await galleryPromise;
          if (!cancelled && gallery) {
            setGalleryFallbacks(gallery.map((g) => g.media_url).filter(Boolean));
          }
          return;
        }
      } catch {}

      // 2) Fall back to admin-curated gallery_items.
      const { data: gallery } = await galleryPromise;
      if (!cancelled && gallery && gallery.length) {
        setItems(
          gallery.slice(0, 6).map((g, i) => ({
            src: g.media_url,
            caption: g.caption ?? "From the studio",
            permalink: g.instagram_permalink ?? undefined,
            span: spans[i] ?? "",
          }))
        );
        setSource("studio");
      }
      // 3) Otherwise the initial `fallback` (local images) stays in place.
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Per-tile error fallback: try a gallery_items url first, then the curated
  // local image at the same position. Mutates the img element directly so the
  // chain only advances on the next failure.
  const handleImgError = (i: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const stage = Number(img.dataset.stage ?? "0");
    if (stage === 0 && galleryFallbacks[i]) {
      img.dataset.stage = "1";
      img.src = galleryFallbacks[i];
      return;
    }
    img.dataset.stage = "2";
    img.src = fallback[i % fallback.length].src;
  };

  return (
    <section className="px-5 mt-20">
      <div className="flex items-end justify-between mb-5">
        <div>
          <a
            href="https://www.instagram.com/_melanin._.hair_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-1 flex items-center gap-1.5 hover:text-gold transition-colors"
          >
            <Instagram className="size-3" /> @_melanin._.hair_
            {source === "instagram" && <span className="size-1.5 rounded-full bg-gold animate-pulse" aria-label="live" />}
          </a>
          <h2 className="font-display text-3xl md:text-4xl">Live from the studio</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 auto-rows-[44vw] sm:auto-rows-[180px] md:auto-rows-[160px]">
        {items.map((g, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActive(i)}
            className={`relative rounded-2xl overflow-hidden group bg-secondary/40 ${g.span ?? ""}`}
          >
            <img
              src={g.src}
              alt=""
              loading="lazy"
              onError={handleImgError(i)}
              referrerPolicy="no-referrer"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
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
              <img
                src={items[active].src}
                alt=""
                onError={handleImgError(active)}
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-cover"
              />
              <div className="p-5">
                <p className="text-sm leading-relaxed line-clamp-4">{items[active].caption}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button className="text-xs text-gold flex items-center gap-1.5">
                    <Heart className="size-3.5" /> Save look
                  </button>
                  {items[active].permalink ? (
                    <a
                      href={items[active].permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs glass-light px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    >
                      View on Instagram <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <button className="text-xs glass-light px-3 py-1.5 rounded-full">Book this style</button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
