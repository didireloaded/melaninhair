"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useEffect } from "react";
import { startFirebaseAnalytics } from "@/lib/firebase/client";
import { startFirebaseAppCheck } from "@/lib/firebase/app-check";

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
    startFirebaseAppCheck();
    void startFirebaseAnalytics();
  }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
