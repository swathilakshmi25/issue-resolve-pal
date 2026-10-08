import { useRef, useState, useEffect } from "react";
import { Bot, Send, X, MessageCircle } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
const SUGGEST = ["Which department handles Wi-Fi problems?", "How should I report a hostel issue?", "What information should I include in a complaint?", "What does High Priority mean?"];

function md(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/^- (.*)$/gm, "• $1")
    .replace(/\n/g, "<br/>");
}

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: "Hi! I'm the **FixMate AI Assistant**. Ask me about departments, priorities or how to report a problem." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await askAssistant({ data: { messages: next.slice(1).slice(-10) } });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Sorry, I couldn't reach the assistant. Check your connection and try again." }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label="Open FixMate AI Assistant"
        className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-ai text-primary-foreground shadow-glow transition hover:scale-105 lg:bottom-6 lg:right-6">
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div className="animate-rise fixed bottom-36 right-4 z-40 flex h-[min(520px,70vh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-soft lg:bottom-24 lg:right-6">
          <div className="flex items-center gap-3 bg-ai px-4 py-3 text-primary-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/20"><Bot className="h-5 w-5" /></span>
            <div><div className="font-semibold">FixMate AI Assistant</div><div className="text-xs opacity-80">Help with complaints & routing</div></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2 text-sm", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}
                dangerouslySetInnerHTML={{ __html: md(m.content) }} />
            ))}
            {busy && <div className="w-16 rounded-2xl bg-muted px-3.5 py-2 text-sm"><span className="animate-pulse">•••</span></div>}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1 text-left text-xs text-muted-foreground transition hover:border-primary hover:text-primary">{s}</button>)}
              </div>
            )}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about FixMate…" className="min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button disabled={busy || !input.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
