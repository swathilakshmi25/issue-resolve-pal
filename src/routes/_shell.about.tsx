import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Lightbulb, Cpu, User, ArrowDown } from "lucide-react";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_shell/about")({
  head: () => seo("About FixMate AI", "How FixMate AI turns unstructured complaints into structured, actionable requests."),
  component: About,
});

const FLOW = ["User", "React Frontend", "Complaint Submission", "Secure Server API", "Generative AI", "Structured Complaint Analysis", "Storage", "Dashboard + Tracking + Analytics"];
const TECH = ["Generative AI", "React", "TypeScript", "Tailwind CSS", "Server-side API", "Data visualization"];

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">About <span className="text-ai">FixMate AI</span></h1>
        <p className="mt-2 text-muted-foreground">FixMate AI is a Generative AI-powered complaint management application designed to transform unstructured complaints into structured, actionable requests.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Box icon={AlertCircle} title="Problem">Traditional complaint systems require users to know which department to contact and often involve manual sorting.</Box>
        <Box icon={Lightbulb} title="Solution">FixMate AI uses Generative AI to understand complaints, classify them, detect urgency and recommend the correct department.</Box>
        <Box icon={Cpu} title="Technology">
          <div className="flex flex-wrap gap-1.5">{TECH.map((t) => <span key={t} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">{t}</span>)}</div>
        </Box>
        <Box icon={User} title="Developer"><b>Swathi Lakshmi</b><br />Third-Year Artificial Intelligence & Data Science</Box>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-semibold">System architecture</h2>
        <div className="mx-auto flex max-w-xs flex-col items-center gap-1">
          {FLOW.map((f, i) => (
            <div key={f} className="flex w-full flex-col items-center gap-1">
              <div className={i === 4 ? "w-full rounded-xl bg-ai px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-glow" : "w-full rounded-xl border bg-muted/50 px-4 py-2.5 text-center text-sm font-medium"}>{f}</div>
              {i < FLOW.length - 1 && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Box({ icon: Icon, title, children }: { icon: typeof Cpu; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>{title}</div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
