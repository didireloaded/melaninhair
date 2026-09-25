"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
        },
      }),
  );
  useEffect(() => {
    const start = () => {
      void import("@/lib/firebase/app-check").then(({ startFirebaseAppCheck }) => startFirebaseAppCheck());
      void import("@/lib/firebase/client").then(({ startFirebaseAnalytics }) => startFirebaseAnalytics());
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 5_000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 3_000);
    return () => clearTimeout(id);
  }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
