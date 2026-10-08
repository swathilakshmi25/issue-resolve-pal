import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareText, Brain, Route as RouteIcon, CheckCircle2, Tags, Siren, Building2, FileSignature, ListChecks, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { Logo, PriorityBadge } from "@/components/fm";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("FixMate AI — Smart Complaint & Resolution Assistant", "Describe the problem. Let AI find the fix. AI categorizes complaints, detects urgency and routes them to the right department."),
  component: Landing,
});

const STEPS = [
  { icon: MessageSquareText, t: "Describe", d: "Write your problem in plain, everyday language." },
  { icon: Brain, t: "Analyze", d: "Generative AI understands, categorizes and scores urgency." },
  { icon: RouteIcon, t: "Route", d: "The complaint goes straight to the responsible department." },
  { icon: CheckCircle2, t: "Resolve", d: "Track every step until it's fixed." },
];
const FEATURES = [
  { icon: Tags, t: "Smart Classification", d: "11 categories detected from free text." },
  { icon: Siren, t: "Urgency Detection", d: "Low to Critical, with a clear reason." },
  { icon: Building2, t: "Department Routing", d: "Wi-Fi to IT, buses to Transport — automatically." },
  { icon: FileSignature, t: "Professional Complaint", d: "A formal, ready-to-send version of your words." },
  { icon: ListChecks, t: "AI Action Plan", d: "Concrete next steps for faster resolution." },
  { icon: BarChart3, t: "Complaint Analytics", d: "Live charts and insights for administrators." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link to="/about" className="hidden px-2 text-muted-foreground hover:text-foreground sm:block">About</Link>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/dashboard">Open app</Link></Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft"><Sparkles className="h-3.5 w-3.5 text-primary" /> Generative AI grievance assistant</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Describe the problem.<br /><span className="text-ai">Let AI find the fix.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">An AI-powered complaint assistant that understands your problem, identifies the right department, detects urgency and creates an actionable resolution plan.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-ai shadow-glow"><Link to="/report">Report a Problem <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl bg-card"><Link to="/dashboard">View Dashboard</Link></Button>
          </div>
        </div>

        <div className="animate-rise relative [animation-delay:150ms]">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-ai opacity-15 blur-3xl" />
          <div className="rounded-3xl border bg-card p-5 shadow-soft">
            <div className="rounded-2xl bg-muted p-4 text-sm">“The Wi-Fi in my department has not been working for three days and I have an online exam tomorrow.”</div>
            <div className="my-3 flex items-center gap-2 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5" /> FixMate AI analysis</div>
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <Mini k="Category" v="IT & Network" />
              <Mini k="Department" v="IT Support" />
              <div className="rounded-xl border p-3"><div className="text-xs text-muted-foreground">Priority</div><div className="mt-1"><PriorityBadge p="High" /></div></div>
              <Mini k="AI estimate" v="4–8 hours" />
            </div>
            <div className="mt-3 rounded-xl bg-accent p-3 text-xs text-accent-foreground"><b>Why High?</b> Network outage for 3 days with an exam tomorrow.</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.t} className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-ai text-primary-foreground"><s.icon className="h-5 w-5" /></span><span className="font-display text-3xl font-bold text-muted">0{i + 1}</span></div>
              <h3 className="mt-4 font-semibold">{s.t}</h3><p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-3xl font-bold">AI features</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
              <f.icon className="h-6 w-6 text-primary" /><h3 className="mt-3 font-semibold">{f.t}</h3><p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-8 rounded-3xl bg-ai p-8 text-primary-foreground shadow-glow sm:p-12 lg:grid-cols-2">
          <div><h2 className="font-display text-3xl font-bold">Why FixMate AI?</h2>
            <p className="mt-3 opacity-90">Manual complaint sorting is slow: someone has to read every message, guess the department and decide what's urgent. FixMate AI does this instantly, so problems reach the right team faster and critical issues never wait in a queue.</p></div>
          <ul className="grid gap-3 text-sm">
            {["No more guessing which department to contact", "Urgent problems surface automatically", "Clear, professional complaints every time", "Live analytics for administrators"].map((t) => (
              <li key={t} className="flex items-center gap-2 rounded-xl bg-primary-foreground/15 px-4 py-3"><CheckCircle2 className="h-4 w-4 shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <nav className="flex flex-wrap gap-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/about" className="hover:text-foreground">Features</Link>
            <Link to="/about" className="hover:text-foreground">Privacy</Link>
            <a href="mailto:swathi.demo@fixmate.ai" className="hover:text-foreground">Contact</a>
          </nav>
          <span>Developed by Swathi Lakshmi</span>
        </div>
      </footer>
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return <div className="rounded-xl border p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="mt-1 font-semibold">{v}</div></div>;
}
