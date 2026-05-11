import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Instagram, ExternalLink, Play, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";

type Item = {
  src: string;          // poster / thumbnail (always an image URL)
  videoSrc?: string;    // present for reels/videos
  mediaType: "image" | "video";
  caption: string;
  permalink?: string;
  span?: string;
};

const fallback: Item[] = [
  { src: g1, mediaType: "image", span: "row-span-2", caption: "Mirror, mirror — silk press magic" },
  { src: g2, mediaType: "image", span: "", caption: "Behind every braid, an hour of love" },
  { src: g3, mediaType: "image", span: "", caption: "Gold hour, gold hoops" },
  { src: s3, mediaType: "image", span: "row-span-2", caption: "Volume that speaks for itself" },
  { src: s2, mediaType: "image", span: "", caption: "Honey-tipped knotless" },
  { src: g4, mediaType: "image", span: "", caption: "Studio sessions, all day" },
];

const spans = ["row-span-2", "", "", "row-span-2", "", ""];

export function Studio() {
  const [active, setActive] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>(fallback);
  const [source, setSource] = useState<"instagram" | "studio" | "curated">("curated");
  const [galleryFallbacks, setGalleryFallbacks] = useState<string[]>([]);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const galleryPromise = supabase
        .from("gallery_items")
        .select("media_url,caption,instagram_permalink")
        .order("sort_order", { ascending: true })
        .limit(12);

      try {
        const res = await fetch("/api/instagram");
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.items) && data.items.length) {
          setItems(
            data.items.slice(0, 6).map((n: any, i: number) => ({
              // Always use a still for the tile; videos get a poster from thumbnail_url.
              src: n.thumbnail_url || n.media_url,
              videoSrc: n.media_type === "video" ? n.media_url : undefined,
              mediaType: n.media_type === "video" ? "video" : "image",
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

      const { data: gallery } = await galleryPromise;
      if (!cancelled && gallery && gallery.length) {
        setItems(
          gallery.slice(0, 6).map((g, i) => ({
            src: g.media_url,
            mediaType: "image" as const,
            caption: g.caption ?? "From the studio",
            permalink: g.instagram_permalink ?? undefined,
            span: spans[i] ?? "",
          }))
        );
        setSource("studio");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset mute state when modal opens; pause video when closed.
  useEffect(() => {
    if (active === null) {
      videoRef.current?.pause();
      setMuted(true);
    }
  }, [active]);

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

  const activeItem = active !== null ? items[active] : null;

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
            {g.mediaType === "video" && (
              <>
                <div className="absolute top-2 right-2 glass-light px-1.5 py-0.5 rounded-full text-[10px] tracking-wide flex items-center gap-1">
                  <Play className="size-2.5 fill-current" /> Reel
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="size-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="size-5 fill-white text-white translate-x-0.5" />
                  </div>
                </div>
              </>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeItem && (
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
              <div className="relative w-full aspect-square bg-black">
                {activeItem.mediaType === "video" && activeItem.videoSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      src={activeItem.videoSrc}
                      poster={activeItem.src}
                      autoPlay
                      loop
                      muted={muted}
                      playsInline
                      controls={false}
                      crossOrigin="anonymous"
                      onError={() => {
                        // Drop to poster image if video fails.
                        if (videoRef.current) videoRef.current.style.display = "none";
                      }}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <button
                      onClick={() => {
                        const next = !muted;
                        setMuted(next);
                        if (videoRef.current) {
                          videoRef.current.muted = next;
                          if (!next) videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="absolute bottom-3 right-3 z-10 size-9 rounded-full glass flex items-center justify-center"
                      aria-label={muted ? "Unmute" : "Mute"}
                    >
                      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                    </button>
                  </>
                ) : (
                  <img
                    src={activeItem.src}
                    alt=""
                    onError={handleImgError(active!)}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <p className="text-sm leading-relaxed line-clamp-4">{activeItem.caption}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button className="text-xs text-gold flex items-center gap-1.5">
                    <Heart className="size-3.5" /> Save look
                  </button>
                  {activeItem.permalink ? (
                    <a
                      href={activeItem.permalink}
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
