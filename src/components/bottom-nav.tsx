"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, LayoutGrid, Phone, Sparkles } from "lucide-react";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: LayoutGrid },
  { href: "/book", label: "Book", icon: CalendarDays },
  { href: "/portfolio", label: "Work", icon: Sparkles },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-3 pb-[max(10px,env(safe-area-inset-bottom))]">
      <ul className="pointer-events-auto grid grid-cols-5 items-end rounded-[24px] border border-white/70 bg-[#FBF7EF]/90 px-1.5 pt-2 shadow-[0_8px_30px_rgba(61,74,61,0.15)] backdrop-blur-xl">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] tracking-wide ${item.href === "/book" ? "-mt-7" : ""} ${active ? "text-[#3D4A3D]" : "text-[#8A8A8A]"}`}
              >
                <span className={item.href === "/book" ? "grid h-14 w-14 place-items-center rounded-full border-4 border-[#F5F1E8] bg-[#3D4A3D] text-white shadow-[0_5px_16px_rgba(61,74,61,0.28)]" : "grid h-8 w-8 place-items-center"}>
                  <Icon size={item.href === "/book" ? 22 : 20} strokeWidth={active || item.href === "/book" ? 2.3 : 1.7} />
                </span>
                <span className={item.href === "/book" ? "mt-0.5 font-medium text-[#3D4A3D]" : active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
