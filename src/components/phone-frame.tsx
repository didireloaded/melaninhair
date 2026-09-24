import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function PhoneFrame({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="min-h-dvh bg-[#F5F1E8]">
      <div className={`relative mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden bg-paper shadow-[0_18px_70px_rgba(10,8,20,0.12)] ${nav ? "pb-24" : ""}`}>
        {children}
        {nav ? <BottomNav /> : null}
      </div>
    </div>
  );
}
