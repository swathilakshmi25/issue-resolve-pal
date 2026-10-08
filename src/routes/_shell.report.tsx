import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ImagePlus, Copy, Pencil, RefreshCw, Building2, Gauge, Clock, Send, Loader2, AlertCircle, Tag } from "lucide-react";
import { analyzeComplaint } from "@/lib/ai.functions";
import { fallbackAnalyze, type Analysis } from "@/lib/fixmate";
import { actions } from "@/lib/store";
import { PriorityBadge } from "@/components/fm";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_shell/report")({
  head: () => seo("Report a Problem — FixMate AI", "Describe your problem in plain words and let AI categorize, prioritize and route it."),
  component: Report,
});

const field = "w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring";

function Report() {
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("Email");
  const [anon, setAnon] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const nav = useNavigate();

  async function analyze() {
    if (text.trim().length < 10) { setError("Please describe your problem in at least 10 characters."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const r = await analyzeComplaint({ data: { text, location } });
      if ("notice" in r && r.notice) toast.warning(r.notice);
      setResult(r); setDraft(r.professional_complaint);
      toast.success("AI analysis completed");
    } catch {
      const r = fallbackAnalyze(text, location);
      setResult(r); setDraft(r.professional_complaint);
      toast.warning("Network issue — used Demo AI Mode.");
    } finally { setLoading(false); }
  }

  function submit() {
    if (!result) return;
    const id = actions.addComplaint({ ...result, professional_complaint: draft }, { original_text: text, location, contact, anonymous: anon });
    toast.success(`Complaint ${id} submitted to ${result.department}`);
    nav({ to: "/complaints/$id", params: { id } });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">What problem are you facing?</h1>
        <p className="mt-1 text-muted-foreground">Write it the way you'd tell a friend. FixMate AI will do the formal part.</p>
      </div>

      <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={3000}
          placeholder="Example: The Wi-Fi in my department has not been working for three days and I have an online exam tomorrow."
          className={field + " resize-y text-base"} />
        {error && <p className="flex items-center gap-1.5 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">Location / building
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Block C, Lab 2" className={field} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">Contact preference
            <select value={contact} onChange={(e) => setContact(e.target.value)} className={field}>
              <option>Email</option><option>Phone</option><option>In-app only</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3.5 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary">
            <ImagePlus className="h-4 w-4" /> {image ? "Change image" : "Attach image (optional)"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              if (f.size > 5e6) { toast.error("Image must be under 5 MB"); return; }
              setImage(URL.createObjectURL(f));
            }} />
          </label>
          {image && <img src={image} alt="Attachment preview" className="h-12 w-12 rounded-lg object-cover" />}
          <label className="flex items-center gap-2 text-sm"><Switch checked={anon} onCheckedChange={setAnon} /> Submit anonymously</label>
        </div>
        <Button onClick={analyze} disabled={loading} size="lg" className="w-full rounded-xl bg-ai shadow-glow sm:w-auto">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} {loading ? "Analyzing…" : "Analyze with AI"}
        </Button>
      </section>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          <Skeleton className="h-48 rounded-2xl sm:col-span-3" />
        </div>
      )}

      {result && !loading && (
        <section className="animate-rise space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold">AI Analysis</h2>
            <span className={result.mode === "demo" ? "rounded-full bg-p-medium/20 px-3 py-1 text-xs font-semibold" : "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"}>
              {result.mode === "demo" ? "Demo AI Mode" : "✨ Generative AI"}
            </span>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Complaint summary</div>
            <h3 className="mt-1 text-lg font-semibold">{result.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.keywords.map((k) => <span key={k} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"><Tag className="h-3 w-3" />{k}</span>)}
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">Sentiment: {result.sentiment}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Info icon={Tag} label="Category" value={result.category} />
            <Info icon={Building2} label="Responsible department" value={result.department}
              foot={<span title="AI-generated estimate, not a calibrated probability">AI confidence estimate: {result.confidence}%</span>} />
            <div className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><Gauge className="h-3.5 w-3.5" />Priority</div>
              <div className="mt-2"><PriorityBadge p={result.priority} className="text-sm" /></div>
              <p className="mt-2 text-xs text-muted-foreground"><b>Why?</b> {result.urgency_reason}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">AI-Generated Professional Complaint</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(draft); toast.success("Copied"); }}><Copy /> Copy</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing((e) => !e)}><Pencil /> {editing ? "Done" : "Edit"}</Button>
                <Button size="sm" variant="outline" onClick={analyze}><RefreshCw /> Regenerate</Button>
              </div>
            </div>
            <textarea value={draft} readOnly={!editing} onChange={(e) => setDraft(e.target.value)} rows={9}
              className={field + (editing ? "" : " bg-muted/40")} />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-semibold">Recommended Action Plan</h3>
              <ol className="mt-3 space-y-2">
                {result.action_plan.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>{s}</li>
                ))}
              </ol>
              <p className="mt-4 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground"><b>Next step:</b> {result.recommended_next_step}</p>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><Clock className="h-3.5 w-3.5" />Estimated resolution</div>
              <div className="mt-2 font-display text-2xl font-bold">{result.estimated_resolution_time}</div>
              <p className="mt-1 text-xs text-muted-foreground">AI estimate — not a guaranteed resolution time.</p>
            </div>
          </div>

          <Button onClick={submit} size="lg" className="w-full rounded-xl bg-ai shadow-glow"><Send /> Submit Complaint</Button>
        </section>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value, foot }: { icon: typeof Tag; label: string; value: string; foot?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
      {foot && <div className="mt-2 text-xs text-muted-foreground">{foot}</div>}
    </div>
  );
}
