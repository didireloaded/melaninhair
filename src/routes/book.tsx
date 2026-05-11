import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Upload, Calendar as Cal, Clock, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import s1 from "@/assets/style-1.jpg";
import s2 from "@/assets/style-2.jpg";
import s3 from "@/assets/style-3.jpg";

export const Route = createFileRoute("/book")({
  head: () => ({ meta: [{ title: "Book Your Session — Melanin Hair" }] }),
  component: BookPage,
});

const styles = [
  { img: s1, title: "Silk Press", price: "N$650", duration: "2h" },
  { img: s2, title: "Knotless", price: "N$1,200", duration: "5h" },
  { img: s3, title: "Naturals", price: "N$450", duration: "1.5h" },
];
const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});
const times = ["09:00", "11:00", "13:00", "15:00", "17:00"];

function BookPage() {
  const [step, setStep] = useState(0);
  const [style, setStyle] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext =
    (step === 0 && style !== null) ||
    (step === 1 && day !== null && time !== null) ||
    step === 2 ||
    step === 3;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md md:max-w-2xl pt-24 pb-40 px-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={step === 0 ? undefined : back}
            className="size-10 rounded-full glass-light flex items-center justify-center disabled:opacity-30"
            disabled={step === 0}
            aria-label="Back"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Step {step + 1} of 4
          </p>
          <div className="size-10" />
        </div>

        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mb-8">
          <motion.div
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            className="h-full bg-gradient-gold"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">Pick your look.</h1>
                <p className="text-xs text-muted-foreground mt-2">Choose the style you'd love this time.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                  {styles.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setStyle(i)}
                      className={`relative text-left rounded-3xl overflow-hidden transition-all ${
                        style === i ? "ring-2 ring-gold" : ""
                      }`}
                    >
                      <div className="aspect-[5/3] md:aspect-[3/4] overflow-hidden">
                        <img src={s.img} alt={s.title} className="size-full object-cover" />
                      </div>
                      <div className="p-4 bg-card flex justify-between items-end">
                        <div>
                          <p className="font-display text-lg leading-tight">{s.title}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" /> {s.duration}
                          </p>
                        </div>
                        <p className="text-sm text-gold">{s.price}</p>
                      </div>
                      {style === i && (
                        <div className="absolute top-3 right-3 size-7 rounded-full bg-gradient-gold flex items-center justify-center">
                          <Check className="size-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">When works?</h1>
                <p className="text-xs text-muted-foreground mt-2">Pick a day & time that feels right.</p>
                <p className="text-[11px] uppercase tracking-widest text-gold/80 mt-6 mb-3 flex items-center gap-1.5">
                  <Cal className="size-3" /> Date
                </p>
                <div className="-mx-5 px-5 flex gap-2 overflow-x-auto scrollbar-hide">
                  {days.map((d, i) => {
                    const sel = day === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setDay(i)}
                        className={`shrink-0 w-16 py-3 rounded-2xl text-center transition-all ${
                          sel ? "bg-gradient-gold text-primary-foreground" : "glass-light"
                        }`}
                      >
                        <p className="text-[10px] uppercase">{d.toLocaleDateString("en", { weekday: "short" })}</p>
                        <p className="font-display text-xl mt-0.5">{d.getDate()}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] uppercase tracking-widest text-gold/80 mt-7 mb-3 flex items-center gap-1.5">
                  <Clock className="size-3" /> Time
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-3 rounded-2xl text-sm transition-all ${
                        time === t ? "bg-gradient-gold text-primary-foreground" : "glass-light"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">A few details.</h1>
                <p className="text-xs text-muted-foreground mt-2">Optional — but helpful.</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Any inspirations, sensitivities, or special requests…"
                  className="mt-6 w-full bg-card rounded-2xl p-4 text-sm outline-none border border-border/50 focus:border-gold/40 transition-colors resize-none"
                />
                <label className="mt-3 flex items-center gap-3 p-4 rounded-2xl glass-light cursor-pointer">
                  <div className="size-10 rounded-xl bg-gradient-gold flex items-center justify-center">
                    <Upload className="size-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add inspiration photo</p>
                    <p className="text-[11px] text-muted-foreground">Send a vibe to match</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </>
            )}

            {step === 3 && !done && (
              <>
                <h1 className="font-display text-3xl md:text-4xl">All set.</h1>
                <p className="text-xs text-muted-foreground mt-2">Confirm your booking.</p>
                <div className="mt-6 rounded-3xl bg-card p-5 space-y-3 border border-border/50">
                  <Row label="Style" value={style !== null ? styles[style].title : "—"} />
                  <Row
                    label="Date"
                    value={
                      day !== null
                        ? days[day].toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })
                        : "—"
                    }
                  />
                  <Row label="Time" value={time ?? "—"} />
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="text-sm">Total</span>
                    <span className="text-sm text-gold">{style !== null ? styles[style].price : "—"}</span>
                  </div>
                </div>
              </>
            )}

            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center pt-12"
              >
                <div className="size-20 rounded-full bg-gradient-gold mx-auto flex items-center justify-center shadow-[var(--shadow-glow)]">
                  <Sparkles className="size-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-3xl mt-6">You're booked, love.</h2>
                <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
                  I'll message you on WhatsApp shortly to confirm everything ✨
                </p>
                <Link to="/" className="mt-8 inline-block px-6 py-3 rounded-full bg-gradient-gold text-primary-foreground text-sm">
                  Back home
                </Link>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!done && (
        <div className="fixed bottom-24 inset-x-0 px-5 z-30">
          <div className="mx-auto max-w-md">
            <button
              onClick={step === 3 ? () => setDone(true) : next}
              disabled={!canNext}
              className="w-full h-14 rounded-full bg-gradient-gold text-primary-foreground font-medium shadow-[var(--shadow-glow)] disabled:opacity-40 transition-opacity"
            >
              {step === 3 ? "Confirm Booking" : "Continue"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
