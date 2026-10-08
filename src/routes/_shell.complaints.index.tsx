import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { z } from "zod";
import { ComplaintList, PageHeader } from "@/components/fm";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/fixmate";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_shell/complaints/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => seo("Complaints — FixMate AI", "Search, filter and track every complaint and its resolution status."),
  component: Complaints,
});

const sel = "h-10 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Complaints() {
  const { q: initialQ } = Route.useSearch();
  const all = useStore((s) => s.complaints);
  const [q, setQ] = useState(initialQ ?? "");
  const [f, setF] = useState({ category: "", department: "", priority: "", status: "", range: "" });
  const departments = [...new Set(all.map((c) => c.department))].sort();

  const items = useMemo(() => {
    const term = q.toLowerCase();
    const days = Number(f.range);
    return all.filter((c) =>
      (!term || [c.id, c.title, c.original_text, c.category, c.department, ...c.keywords].join(" ").toLowerCase().includes(term)) &&
      (!f.category || c.category === f.category) && (!f.department || c.department === f.department) &&
      (!f.priority || c.priority === f.priority) && (!f.status || c.status === f.status) &&
      (!days || Date.now() - new Date(c.created_at).getTime() < days * 86400_000));
  }, [all, q, f]);

  const S = (k: keyof typeof f, label: string, opts: readonly string[]) => (
    <select value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={sel} aria-label={label}>
      <option value="">All {label}</option>{opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div>
      <PageHeader title="Complaints" sub={`${items.length} of ${all.length} complaints`}>
        <Button asChild className="rounded-xl bg-ai"><Link to="/report"><Plus /> New complaint</Link></Button>
      </PageHeader>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keyword…" className={sel + " w-full pl-9"} />
        </div>
        {S("category", "categories", CATEGORIES)}
        {S("department", "departments", departments)}
        {S("priority", "priorities", PRIORITIES)}
        {S("status", "statuses", STATUSES)}
        <select value={f.range} onChange={(e) => setF({ ...f, range: e.target.value })} className={sel} aria-label="Date">
          <option value="">Any date</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>
        </select>
      </div>
      <ComplaintList items={items} />
    </div>
  );
}
