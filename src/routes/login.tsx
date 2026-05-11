import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/" }),
  head: () => ({ meta: [{ title: "Sign in — Melanin Hair" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: search.redirect });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${search.redirect}`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: search.redirect });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
            <span className="size-8 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-semibold">
              M
            </span>
            <span className="font-display text-xl">Melanin<span className="text-gold">.</span></span>
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80 text-center">Welcome</p>
          <h1 className="font-display text-3xl text-center mt-1">
            {mode === "signin" ? "Sign back in." : "Create your account."}
          </h1>

          <button
            onClick={google}
            disabled={busy}
            className="mt-8 w-full h-12 rounded-full glass-light flex items-center justify-center gap-2 text-sm"
          >
            <svg className="size-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 11-3.4-13l5.7-5.7A20 20 0 1024 44a20 20 0 0019.6-23.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0124 16a12 12 0 017.9 3l5.7-5.7A20 20 0 006.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0013.5-5.2l-6.2-5.3A12 12 0 0124 36a12 12 0 01-11.3-7.9L6 33.2A20 20 0 0024 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 01-4.1 5.5l6.2 5.3C40.4 35.4 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-12 px-4 rounded-2xl bg-card border border-border/50 text-sm outline-none focus:border-gold/40"
              />
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border/50 text-sm outline-none focus:border-gold/40"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border/50 text-sm outline-none focus:border-gold/40"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-full bg-gradient-gold text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-xs text-muted-foreground"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
