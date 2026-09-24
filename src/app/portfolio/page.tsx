import Link from "next/link";
import { PhoneFrame } from "@/components/phone-frame";
import { Photo } from "@/components/photo";
import { TopBar } from "@/components/top-bar";
import { getPortfolio, getPublicBusiness } from "@/lib/data/public";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const [business, items] = await Promise.all([getPublicBusiness(), getPortfolio()]);
  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const category = params.category && categories.includes(params.category) ? params.category : "All";
  const visible = items.filter((item) => category === "All" || item.category === category);

  return (
    <PhoneFrame>
      <TopBar businessName={business.businessName} whatsapp={business.whatsapp} instagram={business.instagram} />
      <main className="px-5 pb-8">
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.03em]">Portfolio</h1>
        <p className="mt-1 text-[14px] text-muted">Recent sets from the studio.</p>
        <div className="mt-4 flex gap-4 overflow-x-auto text-[14px]">
          {categories.map((item) => (
            <Link
              key={item}
              href={item === "All" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(item)}`}
              className={`shrink-0 border-b-2 pb-1 ${category === item ? "border-coral text-coral" : "border-transparent text-muted"}`}
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="mt-5 grid gap-5">
          {visible.map((item, index) => (
            <figure key={item.id} className={index % 5 === 0 ? "" : ""}>
              <div className={`relative overflow-hidden rounded-[18px] bg-blush ${index % 4 === 0 ? "aspect-[4/5]" : "aspect-[5/4]"}`}>
                <Photo src={item.imageUrl} alt={item.caption || item.category} sizes="430px" />
              </div>
              <figcaption className="mt-2 flex items-center justify-between gap-3 text-[14px]">
                <span>{item.caption || item.category}</span>
                {item.serviceSlug ? (
                  <Link href={`/book?service=${item.serviceSlug}`} className="text-coral">
                    Book this look
                  </Link>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
        {visible.length === 0 ? <p className="mt-8 text-[15px] text-muted">No photos in this category yet.</p> : null}
      </main>
    </PhoneFrame>
  );
}
