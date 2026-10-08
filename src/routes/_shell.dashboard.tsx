import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Plus, FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { ComplaintList, StatCard } from "@/components/fm";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => seo("Dashboard — FixMate AI", "Track your complaints, priorities and resolutions at a glance."),
  component: Dashboard,
});

function greet() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const cs = useStore((s) => s.complaints);
  const name = useStore((s) => s.profile.name.split(" ")[0]);
  const open = cs.filter((c) => c.status !== "Resolved").length;
  return (
    <div className="space-y-6">
      <section className="animate-rise relative overflow-hidden rounded-3xl bg-ai p-6 text-primary-foreground shadow-glow sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-foreground/10 blur-2xl" />
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{greet()}, {name} 👋</h1>
        <p className="mt-1 opacity-90">Let AI help you turn problems into solutions.</p>
        <Button asChild size="lg" variant="secondary" className="mt-5 rounded-xl">
          <Link to="/report"><Plus /> Report New Problem</Link>
        </Button>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Complaints" value={cs.length} icon={FileText} />
        <StatCard label="Open" value={open} icon={Clock} tone="glow" />
        <StatCard label="Resolved" value={cs.length - open} icon={CheckCircle2} tone="success" />
        <StatCard label="High Priority" value={cs.filter((c) => c.priority === "High" || c.priority === "Critical").length} icon={AlertTriangle} tone="critical" />
      </div>

      <section className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-5 shadow-soft sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground"><Sparkles className="h-5 w-5" /></span>
        <div className="flex-1">
          <h2 className="font-semibold">AI Complaint Analyzer</h2>
          <p className="text-sm text-muted-foreground">Not sure how to explain your problem? Let FixMate AI understand it for you.</p>
        </div>
        <Button asChild className="rounded-xl bg-ai shadow-glow"><Link to="/report">Analyze a Problem ✨</Link></Button>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Complaints</h2>
          <Link to="/complaints" className="text-sm font-medium text-primary">View all</Link>
        </div>
        <ComplaintList items={cs.slice(0, 6)} />
      </section>
    </div>
  );
}
