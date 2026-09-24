"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-[28px] font-semibold">Something went wrong</h1>
        <p className="mt-2 text-[15px] text-muted">Check your connection and try again.</p>
        <button type="button" onClick={reset} className="press mt-6 h-12 w-full rounded-[16px] bg-coral text-white">
          Try again
        </button>
      </div>
    </main>
  );
}
