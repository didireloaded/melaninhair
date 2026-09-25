"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDKgYCIMm0ndMCVnBBuJSA65FEWLPy2ehw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "entranced-beauty.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "entranced-beauty",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "entranced-beauty.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "533473470448",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:533473470448:web:bec173297caf1c225a1f35",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-FR6LEHP2L6",
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp, "entranced-beauty");

export async function startFirebaseAnalytics() {
  if (await isSupported()) return getAnalytics(firebaseApp);
  return null;
}

export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "BBmEBWNmpUx4L1JgBPwgYH_41NH4FwU2BI6qoShJB09ZmpRqWPXlV_S004X0Mo8cfcJAxnElbCybjyqrFVbzoKw";
