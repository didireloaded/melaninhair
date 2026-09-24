"use client";

import Image from "next/image";

export function Photo({
  src,
  alt,
  className = "object-cover",
  priority = false,
  sizes = "430px",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src.startsWith("/")) {
    return <div className="absolute inset-0 bg-blush" aria-label={alt} />;
  }
  const stock = stockImage(src);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#EDE7DA]">
      {/* Stock imagery is a presentation fallback; admin-uploaded backend media still wins when available. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={stock} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={`${className} opacity-0 transition-opacity [&.loaded]:opacity-100`}
        unoptimized={src.startsWith("/api/")}
        onLoad={(event) => event.currentTarget.classList.add("loaded")}
      />
    </div>
  );
}

function stockImage(src: string): string {
  const key = src.toLowerCase();
  if (key.includes("hero") || key.includes("makeup")) return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=82";
  if (key.includes("hair") || key.includes("ponytail") || key.includes("bun")) return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=82";
  if (key.includes("nail") || key.includes("french") || key.includes("polish") || key.includes("nude")) return "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=82";
  if (key.includes("pedi")) return "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=82";
  return "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=82";
}
