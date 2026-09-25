"use client";

import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";
import { firebaseApp } from "./client";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

let appCheck: AppCheck | null = null;

export function startFirebaseAppCheck(): AppCheck | null {
  if (typeof window === "undefined" || appCheck) return appCheck;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment && debugToken) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (!siteKey && !(isDevelopment && debugToken)) return null;

  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(siteKey ?? "debug-only"),
    isTokenAutoRefreshEnabled: true,
  });
  return appCheck;
}
