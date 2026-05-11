import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { FloatingChat } from "@/components/FloatingChat";
import { Hero } from "@/components/sections/Hero";
import { Trending } from "@/components/sections/Trending";
import { Styles } from "@/components/sections/Styles";
import { Founder } from "@/components/sections/Founder";
import { Studio } from "@/components/sections/Studio";
import { Essentials } from "@/components/sections/Essentials";
import { Footer } from "@/components/sections/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-3xl">
        <Hero />
        <Trending />
        <Styles />
        <Founder />
        <Studio />
        <Essentials />
        <Footer />
      </main>
      <BottomNav />
      <FloatingChat />
    </div>
  );
}
