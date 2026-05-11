import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { FloatingChat } from "@/components/FloatingChat";
import { Hero } from "@/components/sections/Hero";
import { Trending } from "@/components/sections/Trending";

// Below-the-fold sections are lazy-loaded to shrink the initial JS payload.
const Styles = lazy(() => import("@/components/sections/Styles").then((m) => ({ default: m.Styles })));
const Founder = lazy(() => import("@/components/sections/Founder").then((m) => ({ default: m.Founder })));
const Studio = lazy(() => import("@/components/sections/Studio").then((m) => ({ default: m.Studio })));
const Essentials = lazy(() => import("@/components/sections/Essentials").then((m) => ({ default: m.Essentials })));
const Footer = lazy(() => import("@/components/sections/Footer").then((m) => ({ default: m.Footer })));

const SITE_URL = "https://melaninhair.lovable.app";
const DESCRIPTION =
  "Melanin Hair — Hermine's premium hair studio in Windhoek. Book braids, twists, and signature styles in seconds.";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Melanin Hair",
  description: DESCRIPTION,
  url: SITE_URL,
  telephone: "+264 81 322 2210",
  priceRange: "$$",
  founder: { "@type": "Person", name: "Hermine" },
  areaServed: "Windhoek, Namibia",
  sameAs: ["https://www.instagram.com/_melanin._.hair_/"],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Melanin Hair — Premium Hair Studio in Windhoek" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Melanin Hair — Premium Hair Studio" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Melanin Hair" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "theme-color", content: "#0d0d0d" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd),
      },
    ],
  }),
  component: Index,
});

function SectionFallback() {
  return <div className="h-64 animate-pulse bg-card/30 rounded-3xl mx-5 my-6" />;
}

function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-3xl">
        <Hero />
        <Trending />
        <Suspense fallback={<SectionFallback />}>
          <Styles />
          <Founder />
          <Studio />
          <Essentials />
          <Footer />
        </Suspense>
      </main>
      <BottomNav />
      <FloatingChat />
    </div>
  );
}
