export async function postJson<T>(url: string, body: unknown): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("No connection. Check your internet and try again.");
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong. Please try again.") as Error & { code?: string };
    error.code = data.error;
    throw error;
  }
  return data as T;
}

export function tap(kind: "select" | "success" = "select") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate(kind === "success" ? [10, 36, 14] : 8);
}
