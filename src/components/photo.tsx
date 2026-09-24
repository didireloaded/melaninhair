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
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#d9d1ff,#6a69ba_52%,#0a0814)]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
        unoptimized={src.startsWith("/api/")}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
