import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-5 md:bottom-6 z-40 size-13 rounded-full bg-gradient-gold shadow-[var(--shadow-glow)] flex items-center justify-center hidden md:flex"
        aria-label="Chat"
      >
        <MessageCircle className="size-5 text-primary-foreground" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:right-6 z-50 md:w-96 md:rounded-3xl rounded-t-3xl bg-card border border-border/50 overflow-hidden flex flex-col h-[80vh] md:h-[70vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-gold" />
                  <div>
                    <p className="font-display text-base leading-tight">Melanin Studio</p>
                    <p className="text-xs text-muted-foreground">Usually replies in minutes</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm">
                  Hi love 💛 Tell me about the look you're dreaming of.
                </div>
              </div>
              <div className="p-3 border-t border-border/50">
                <div className="flex items-center gap-2 bg-secondary rounded-full pl-4 pr-1.5 py-1.5">
                  <input
                    placeholder="Write a message…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button className="size-9 rounded-full bg-gradient-gold flex items-center justify-center" aria-label="Send">
                    <Send className="size-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
