import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import { EmptyState, PriorityBadge, StatusBadge, fmtTime } from "@/components/fm";
import { STATUSES, type Status } from "@/lib/fixmate";
import { actions, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/complaints/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Complaint ${params.id} — FixMate AI` },
      { name: "description", content: `Timeline, AI analysis and status for complaint ${params.id}.` },
      { property: "og:title", content: `Complaint ${params.id} — FixMate AI` },
      { property: "og:description", content: "Complaint timeline and AI analysis." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detail,
});

const STEPS = ["Submitted", "AI Analyzed", "Assigned", "Under Review", "In Progress", "Resolved"] as const;

function Detail() {
  const { id } = Route.useParams();
  const c = useStore((s) => s.complaints.find((x) => x.id === id));
  const role = useStore((s) => s.role);
  const [status, setStatus] = useState<Status>("In Progress");
  const [note, setNote] = useState("");

  if (!c) return <EmptyState title="Complaint not found" text={`We couldn't find ${id}.`} action={<Button asChild variant="outline"><Link to="/complaints">Back to complaints</Link></Button>} />;

  const order: Record<string, number> = { Submitted: 0, "Under Review": 3, Assigned: 2, "In Progress": 4, Resolved: 5 };
  const reached = Math.max(1, order[c.status]);

  return (
    <div className="space-y-5">
      <Link to="/complaints" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All complaints</Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-sm text-muted-foreground">{c.id} · {fmtTime(c.created_at)}</div>
          <h1 className="mt-1 font-display text-2xl font-bold">{c.title}</h1>
          {c.location && <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{c.location}</div>}
        </div>
        <div className="flex gap-2"><PriorityBadge p={c.priority} /><StatusBadge s={c.status} /></div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="mb-4 font-semibold">Timeline</h2>
        <ol className="grid gap-3 sm:grid-cols-6">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 sm:flex-col sm:text-center">
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", i <= reached ? "bg-ai text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {i <= reached ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("text-xs", i <= reached ? "font-medium" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
        <ul className="mt-5 space-y-2 border-t pt-4">
          {[...c.updates].reverse().map((u, i) => (
            <li key={i} className="flex gap-3 text-sm"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div><b>{u.status}</b> — {u.note}<div className="text-xs text-muted-foreground">{fmtTime(u.created_at)}</div></div></li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Original complaint"><p className="whitespace-pre-wrap text-sm">{c.original_text}</p></Card>
        <Card title={`AI summary ${c.mode === "demo" ? "· Demo AI Mode" : ""}`}>
          <p className="text-sm">{c.summary}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Category</dt><dd>{c.category}</dd>
            <dt className="text-muted-foreground">Department</dt><dd>{c.department}</dd>
            <dt className="text-muted-foreground">AI estimate</dt><dd>{c.estimated_resolution_time}</dd>
            <dt className="text-muted-foreground">Confidence (AI est.)</dt><dd>{c.confidence}%</dd>
          </dl>
        </Card>
        <Card title="AI action plan">
          <ol className="list-decimal space-y-1 pl-5 text-sm">{c.action_plan.map((a, i) => <li key={i}>{a}</li>)}</ol>
        </Card>
        <Card title="Resolution notes">
          <p className="text-sm text-muted-foreground">{c.resolution_notes || "No resolution notes yet."}</p>
        </Card>
      </div>

      {role === "admin" ? (
        <Card title="Admin · Update status">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="h-10 rounded-xl border bg-card px-3 text-sm">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note / resolution notes" className="h-10 flex-1 rounded-xl border bg-card px-3 text-sm" />
            <Button className="rounded-xl" onClick={() => { actions.updateStatus(c.id, status, note.trim()); setNote(""); toast.success(`Status updated to ${status}`); }}>Update</Button>
          </div>
        </Card>
      ) : (
        <p className="text-center text-xs text-muted-foreground">Switch to the Admin role (top bar) to update status and add resolution notes.</p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-soft"><h2 className="mb-2 font-semibold">{title}</h2>{children}</div>;
}
