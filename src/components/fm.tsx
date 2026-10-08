import { Link } from "@tanstack/react-router";
import { Wrench, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Complaint, Priority, Status } from "@/lib/fixmate";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ai text-primary-foreground shadow-glow">
        <Wrench className="h-4.5 w-4.5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        FixMate <span className="text-ai">AI</span>
      </span>
    </Link>
  );
}

const pStyle: Record<Priority, string> = {
  Low: "bg-p-low/12 text-p-low ring-p-low/25",
  Medium: "bg-p-medium/15 text-foreground ring-p-medium/40",
  High: "bg-p-high/12 text-p-high ring-p-high/30",
  Critical: "bg-p-critical/12 text-p-critical ring-p-critical/30",
};
const pDot: Record<Priority, string> = { Low: "bg-p-low", Medium: "bg-p-medium", High: "bg-p-high", Critical: "bg-p-critical" };

export function PriorityBadge({ p, className }: { p: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", pStyle[p] ?? pStyle.Medium, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", pDot[p] ?? pDot.Medium)} />
      {p}
    </span>
  );
}

const sStyle: Record<Status, string> = {
  Submitted: "bg-muted text-muted-foreground",
  "Under Review": "bg-accent text-accent-foreground",
  Assigned: "bg-secondary text-secondary-foreground",
  "In Progress": "bg-primary/10 text-primary",
  Resolved: "bg-success/12 text-success",
};
export function StatusBadge({ s }: { s: Status }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", sStyle[s])}>{s}</span>;
}

export function StatCard({ label, value, icon: Icon, tone = "primary", hint }: { label: string; value: string | number; icon: LucideIcon; tone?: "primary" | "success" | "critical" | "glow"; hint?: string }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    critical: "bg-p-critical/12 text-p-critical",
    glow: "bg-primary-glow/12 text-primary-glow",
  };
  return (
    <div className="animate-rise rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function ComplaintList({ items }: { items: Complaint[] }) {
  if (!items.length) return <EmptyState title="No complaints found" text="Try adjusting filters or report a new problem." />;
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="hidden grid-cols-[90px_1fr_130px_150px_90px_110px_90px_40px] gap-3 border-b bg-muted/50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
        <span>ID</span><span>Title</span><span>Category</span><span>Department</span><span>Priority</span><span>Status</span><span>Date</span><span />
      </div>
      <ul className="divide-y">
        {items.map((c) => (
          <li key={c.id}>
            <Link to="/complaints/$id" params={{ id: c.id }} className="group grid gap-2 px-4 py-3.5 transition-colors hover:bg-muted/40 lg:grid-cols-[90px_1fr_130px_150px_90px_110px_90px_40px] lg:items-center lg:gap-3">
              <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
              <span className="min-w-0 truncate font-medium">{c.title}</span>
              <span className="hidden truncate text-sm text-muted-foreground lg:block">{c.category}</span>
              <span className="hidden truncate text-sm text-muted-foreground lg:block">{c.department}</span>
              <span className="flex flex-wrap items-center gap-2 lg:contents">
                <span><PriorityBadge p={c.priority} /></span>
                <span><StatusBadge s={c.status} /></span>
                <span className="text-xs text-muted-foreground">{fmtDate(c.created_at)}</span>
                <span className="lg:hidden text-xs text-muted-foreground">· {c.department}</span>
              </span>
              <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground transition group-hover:text-primary lg:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><Wrench className="h-5 w-5" /></div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
