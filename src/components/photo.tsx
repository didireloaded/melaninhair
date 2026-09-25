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
        preload={priority}
        sizes={sizes}
        className={className}
        unoptimized={src.startsWith("/api/")}
      />
    </div>
  );
}
