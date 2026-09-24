"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PushOptIn } from "./push-opt-in";

const links = [
  ["/admin", "Bookings"],
  ["/admin/calendar", "Calendar"],
  ["/admin/services", "Services"],
  ["/admin/portfolio", "Portfolio"],
  ["/admin/specials", "Specials"],
  ["/admin/settings", "Settings"],
];

export function StudioNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 px-5 pb-3 pt-[max(14px,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted">Studio</p>
          <p className="text-[18px] font-semibold">Entranced Beauty</p>
        </div>
        <button
          type="button"
          className="text-[14px] text-brown"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
      <nav className="mt-3 flex gap-4 overflow-x-auto text-[14px]">
        {links.map(([href, label]) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`shrink-0 border-b-2 pb-1 ${active ? "border-coral text-coral" : "border-transparent text-muted"}`}>
              {label}
            </Link>
          );
        })}
      </nav>
      <PushOptIn />
    </header>
  );
}
