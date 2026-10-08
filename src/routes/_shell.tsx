import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, LayoutDashboard, PlusCircle, ListChecks, BarChart3, User, Info, Search, ShieldCheck } from "lucide-react";
import { Logo, fmtTime } from "@/components/fm";
import { Assistant } from "@/components/Assistant";
import { actions, hydrateStore, useStore } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell")({ component: Shell });

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/report", label: "Report", icon: PlusCircle },
  { to: "/complaints", label: "Complaints", icon: ListChecks },
  { to: "/admin", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/about", label: "About", icon: Info },
] as const;

function Shell() {
  useEffect(() => hydrateStore(), []);
  const profile = useStore((s) => s.profile);
  const role = useStore((s) => s.role);
  const notes = useStore((s) => s.notifications);
  const unread = notes.filter((n) => !n.read).length;
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-soft">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar/90 px-4 py-5 backdrop-blur lg:flex">
        <Logo className="px-2" />
        <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
              <n.icon className="h-4.5 w-4.5" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-ai p-4 text-primary-foreground">
          <div className="text-sm font-semibold">Got a problem?</div>
          <p className="mt-1 text-xs opacity-85">Describe it in plain words — AI handles the rest.</p>
          <Link to="/report" className="mt-3 inline-flex rounded-lg bg-primary-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-primary-foreground/30">Report now ✨</Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Logo className="lg:hidden" />
          <form className="relative ml-auto hidden max-w-sm flex-1 sm:block lg:ml-0" onSubmit={(e) => { e.preventDefault(); nav({ to: "/complaints", search: { q } }); }}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search complaints…" className="h-10 w-full rounded-xl border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => actions.setRole(role === "admin" ? "user" : "admin")} title="Switch demo role"
              className={cn("hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:flex", role === "admin" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>
              <ShieldCheck className="h-3.5 w-3.5" /> {role === "admin" ? "Admin" : "Student"}
            </button>
            <Popover>
              <PopoverTrigger className="relative grid h-10 w-10 place-items-center rounded-xl border bg-card" aria-label="Notifications">
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-p-critical px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="font-semibold">Notifications</span>
                  <button onClick={() => actions.markAllRead()} className="text-xs text-primary">Mark all read</button>
                </div>
                <ul className="max-h-80 divide-y overflow-y-auto">
                  {notes.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</li>}
                  {notes.slice(0, 15).map((n) => (
                    <li key={n.id} className={cn("px-4 py-3 text-sm", !n.read && "bg-accent/50")}>
                      {n.complaintId ? <Link to="/complaints/$id" params={{ id: n.complaintId }} className="hover:text-primary">{n.text}</Link> : n.text}
                      <div className="text-xs text-muted-foreground">{fmtTime(n.created_at)}</div>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <Link to="/profile" className="flex items-center gap-2 rounded-xl border bg-card py-1 pl-1 pr-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-ai text-xs font-bold text-primary-foreground">{profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <span className="hidden text-sm font-medium md:block">{profile.name.split(" ")[0]}</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background/95 backdrop-blur lg:hidden">
        {NAV.slice(0, 5).map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
      </nav>
      <Assistant />
    </div>
  );
}
