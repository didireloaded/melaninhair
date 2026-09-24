"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#F3E6E4] px-5">
      <form
        className="w-full max-w-[400px]"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          const form = new FormData(event.currentTarget);
          const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
          });
          const data = (await response.json()) as { message?: string };
          setPending(false);
          if (!response.ok) {
            setError(data.message || "Check the email and password.");
            return;
          }
          router.push("/admin");
          router.refresh();
        }}
      >
        <p className="text-[13px] uppercase tracking-[0.16em] text-muted">Entranced Beauty</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em]">Studio</h1>
        <p className="mt-2 text-[15px] text-muted">Sign in to manage bookings. Clients do not need an account.</p>
        <label className="mt-6 block text-[14px]" htmlFor="email">
          Email
          <input id="email" name="email" type="email" autoComplete="username" required className="mt-1.5 h-12 w-full rounded-[14px] border border-line bg-white px-4 text-[16px]" />
        </label>
        <label className="mt-4 block text-[14px]" htmlFor="password">
          Password
          <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1.5 h-12 w-full rounded-[14px] border border-line bg-white px-4 text-[16px]" />
        </label>
        {error ? <p className="mt-3 text-[14px] text-coral">{error}</p> : null}
        <button type="submit" disabled={pending} className="press mt-5 h-12 w-full rounded-[16px] bg-coral text-white disabled:opacity-50">
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <details className="mt-6 text-[13px] text-muted">
          <summary>Preview access</summary>
          <p className="mt-2">studio@entrancedbeauty.com</p>
          <p>Windhoek160</p>
        </details>
      </form>
    </main>
  );
}
