import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileText, Clock, CheckCircle2, AlertOctagon, Timer, Lightbulb } from "lucide-react";
import { PageHeader, StatCard } from "@/components/fm";
import { PRIORITIES, STATUSES } from "@/lib/fixmate";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_shell/admin")({
  head: () => seo("Admin Analytics — FixMate AI", "Live complaint analytics: categories, departments, priorities, status and trends."),
  component: Admin,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const PCOL: Record<string, string> = { Low: "var(--p-low)", Medium: "var(--p-medium)", High: "var(--p-high)", Critical: "var(--p-critical)" };
const count = (arr: string[]) => Object.entries(arr.reduce<Record<string, number>>((a, k) => ((a[k] = (a[k] || 0) + 1), a), {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

function Admin() {
  const cs = useStore((s) => s.complaints);
  const d = useMemo(() => {
    const resolved = cs.filter((c) => c.resolved_at);
    const avgH = resolved.length ? resolved.reduce((s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) / 3600_000, 0) / resolved.length : 0;
    const days = [...Array(14)].map((_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400_000);
      const key = d.toDateString();
      return { name: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: cs.filter((c) => new Date(c.created_at).toDateString() === key).length };
    });
    const byCat = count(cs.map((c) => c.category));
    const byDept = count(cs.map((c) => c.department));
    const openByDept = count(cs.filter((c) => c.status !== "Resolved").map((c) => c.department));
    const week = cs.filter((c) => Date.now() - new Date(c.created_at).getTime() < 7 * 86400_000);
    const weekTop = count(week.map((c) => c.category))[0];
    const crit = cs.filter((c) => c.priority === "Critical" && c.status !== "Resolved").length;
    const insights = [
      weekTop && `${weekTop.name} complaints lead this week with ${weekTop.value} report${weekTop.value > 1 ? "s" : ""}.`,
      openByDept[0] && `${openByDept[0].name} has the highest number of unresolved complaints (${openByDept[0].value}).`,
      crit ? `${crit} critical complaint${crit > 1 ? "s" : ""} require immediate attention.` : "No unresolved critical complaints — great work.",
      resolved.length && `Resolution rate is ${Math.round((resolved.length / cs.length) * 100)}% with an average of ${avgH.toFixed(1)} hours.`,
    ].filter(Boolean) as string[];
    return {
      resolved: resolved.length, avgH, days, byCat, byDept, insights,
      byPri: PRIORITIES.map((p) => ({ name: p, value: cs.filter((c) => c.priority === p).length })),
      byStatus: STATUSES.map((s) => ({ name: s, value: cs.filter((c) => c.status === s).length })),
    };
  }, [cs]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Analytics" sub="Calculated live from stored complaint records." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Total" value={cs.length} icon={FileText} />
        <StatCard label="Open" value={cs.length - d.resolved} icon={Clock} tone="glow" />
        <StatCard label="Resolved" value={d.resolved} icon={CheckCircle2} tone="success" />
        <StatCard label="Critical" value={d.byPri[3]?.value ?? 0} icon={AlertOctagon} tone="critical" />
        <StatCard label="Avg. Resolution" value={`${d.avgH.toFixed(1)}h`} icon={Timer} hint="Resolved complaints only" />
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-primary" /> AI Insights</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {d.insights.map((t) => <li key={t} className="rounded-xl bg-accent px-3.5 py-2.5 text-sm text-accent-foreground">{t}</li>)}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Complaints by Category">
          <BarChart data={d.byCat} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" allowDecimals={false} fontSize={12} /><YAxis type="category" dataKey="name" width={100} fontSize={12} /><Tooltip />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>{d.byCat.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}</Bar>
          </BarChart>
        </Chart>
        <Chart title="Complaints by Department">
          <BarChart data={d.byDept}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
            <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </Chart>
        <Chart title="Priority Distribution">
          <PieChart><Tooltip /><Pie data={d.byPri} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} label={({ name, value }) => (value ? `${name} ${value}` : "")}>
            {d.byPri.map((p) => <Cell key={p.name} fill={PCOL[p.name]} />)}</Pie></PieChart>
        </Chart>
        <Chart title="Complaint Status">
          <BarChart data={d.byStatus}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>{d.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}</Bar>
          </BarChart>
        </Chart>
        <div className="lg:col-span-2">
          <Chart title="Complaints Over Time (last 14 days)">
            <LineChart data={d.days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
              <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </Chart>
        </div>
      </div>
    </div>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="min-w-0 rounded-2xl border bg-card p-5 shadow-soft">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="h-64"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  );
}
