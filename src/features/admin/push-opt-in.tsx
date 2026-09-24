"use client";
import { useState } from "react";
export function PushOptIn() {
  const [message, setMessage] = useState<string | null>(null);
  async function enable() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Push notifications are not supported in this browser.");
      if (await Notification.requestPermission() !== "granted") throw new Error("Allow notifications in browser settings to receive booking alerts.");
      const registration = await navigator.serviceWorker.register("/sw.js");
      const response = await fetch("/api/push/subscribe");
      const { publicKey } = (await response.json()) as { publicKey?: string };
      if (!response.ok || !publicKey) throw new Error("Push notifications are not configured yet.");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(publicKey) });
      const saved = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) });
      if (!saved.ok) throw new Error("Could not save this device.");
      setMessage("Booking alerts are on for this device.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not enable notifications."); }
  }
  return <button type="button" onClick={enable} className="mt-3 text-left text-[13px] text-coral">{message ?? "Enable booking alerts on this device"}</button>;
}
function decodeKey(value: string) { const padding = "=".repeat((4 - value.length % 4) % 4); const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...raw].map((character) => character.charCodeAt(0))); }
