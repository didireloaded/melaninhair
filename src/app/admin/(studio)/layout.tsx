import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { StudioNav } from "@/features/admin/studio-nav";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-dvh bg-[#F3E6E4]">
      <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-paper">
        <StudioNav />
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
