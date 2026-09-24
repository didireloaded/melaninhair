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
    <div className="absolute inset-0 overflow-hidden bg-[#EDE7DA]">
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
