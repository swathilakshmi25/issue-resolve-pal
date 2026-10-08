import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Mail, RotateCcw } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_shell/profile")({
  head: () => seo("Profile — FixMate AI", "Your FixMate AI profile, skills and complaint activity."),
  component: Profile,
});

const field = "w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Profile() {
  const p = useStore((s) => s.profile);
  const mine = useStore((s) => s.complaints.length);
  const [form, setForm] = useState(p);
  useEffect(() => setForm(p), [p]);

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border bg-card p-6 text-center shadow-soft">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-ai font-display text-3xl font-bold text-primary-foreground shadow-glow">
          {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <h1 className="mt-4 font-display text-xl font-bold">{p.name}</h1>
        <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><GraduationCap className="h-4 w-4" />{p.title}</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{p.email}</p>
        <p className="mt-3 text-sm">{p.bio}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {p.skills.map((s) => <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{s}</span>)}
        </div>
        <div className="mt-5 rounded-xl bg-muted px-3 py-2 text-sm"><b>{mine}</b> complaints in workspace</div>
      </div>
      <form className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        actions.updateProfile({ ...form, skills: form.skills.filter(Boolean) }); toast.success("Profile saved");
      }}>
        <h2 className="font-display text-lg font-semibold">Edit profile</h2>
        <label className="block space-y-1.5 text-sm font-medium">Name<input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block space-y-1.5 text-sm font-medium">Email<input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="block space-y-1.5 text-sm font-medium">Title<input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="block space-y-1.5 text-sm font-medium">Bio<textarea rows={3} className={field} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
        <label className="block space-y-1.5 text-sm font-medium">Skills (comma separated)
          <input className={field} value={form.skills.join(", ")} onChange={(e) => setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()) })} /></label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="rounded-xl bg-ai">Save changes</Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => { actions.reset(); toast.success("Demo data restored"); }}><RotateCcw /> Reset demo data</Button>
        </div>
      </form>
    </div>
  );
}
