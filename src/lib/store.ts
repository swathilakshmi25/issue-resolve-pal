import { useSyncExternalStore } from "react";
import { demoComplaints, type Analysis, type Complaint, type Status } from "./fixmate";

export interface Notification { id: string; text: string; complaintId?: string; created_at: string; read: boolean }
export interface Profile { name: string; email: string; title: string; bio: string; skills: string[] }
export interface State {
  complaints: Complaint[];
  notifications: Notification[];
  profile: Profile;
  role: "user" | "admin";
  hydrated: boolean;
}

const KEY = "fixmate-state-v1";
const initial = (): State => ({
  complaints: demoComplaints(),
  notifications: [
    { id: "n1", text: "FM-1012 is now In Progress at IT Support", complaintId: "FM-1012", created_at: new Date(Date.now() - 3600_000).toISOString(), read: false },
    { id: "n2", text: "FM-1011 assigned to Maintenance", complaintId: "FM-1011", created_at: new Date(Date.now() - 7200_000).toISOString(), read: false },
    { id: "n3", text: "FM-1008 has been resolved", complaintId: "FM-1008", created_at: new Date(Date.now() - 86400_000).toISOString(), read: true },
  ],
  profile: {
    name: "Swathi Lakshmi",
    email: "swathi.demo@fixmate.ai",
    title: "Third-Year AI & DS Student",
    bio: "Building practical Generative AI tools for campus life.",
    skills: ["Python", "Power BI", "HTML", "CSS", "JavaScript", "Artificial Intelligence", "Data Science", "Generative AI"],
  },
  role: "user",
  hydrated: false,
});

let state: State = initial();
const serverState = state;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  if (typeof window !== "undefined") {
    const { hydrated, ...rest } = state;
    void hydrated;
    localStorage.setItem(KEY, JSON.stringify(rest));
  }
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  if (state.hydrated) return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...state, ...JSON.parse(raw), hydrated: true };
    else state = { ...state, hydrated: true };
  } catch {
    state = { ...state, hydrated: true };
  }
  listeners.forEach((l) => l());
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => sel(state),
    () => sel(serverState),
  );
}

const notify = (text: string, complaintId?: string) => ({
  id: crypto.randomUUID(), text, complaintId, created_at: new Date().toISOString(), read: false,
});

export const actions = {
  addComplaint(a: Analysis, extra: { original_text: string; location: string; contact: string; anonymous: boolean }) {
    const max = Math.max(1000, ...state.complaints.map((c) => Number(c.id.split("-")[1]) || 0));
    const id = `FM-${max + 1}`;
    const now = new Date().toISOString();
    const c: Complaint = {
      ...a, ...extra, id, status: "Assigned", created_at: now, updated_at: now, resolved_at: null, resolution_notes: "",
      updates: [
        { status: "Submitted", note: "Complaint submitted.", created_at: now },
        { status: "AI Analyzed", note: `AI categorized as ${a.category}, ${a.priority} priority.`, created_at: now },
        { status: "Assigned", note: `Assigned to ${a.department}.`, created_at: now },
      ],
    };
    set({
      complaints: [c, ...state.complaints],
      notifications: [
        notify(`${id} assigned to ${a.department}`, id),
        notify(`AI analysis completed for ${id}`, id),
        notify(`Complaint ${id} submitted`, id),
        ...state.notifications,
      ],
    });
    return id;
  },
  updateStatus(id: string, status: Status, note: string) {
    const now = new Date().toISOString();
    set({
      complaints: state.complaints.map((c) =>
        c.id !== id ? c : {
          ...c, status, updated_at: now,
          resolved_at: status === "Resolved" ? now : null,
          resolution_notes: note && status === "Resolved" ? note : c.resolution_notes,
          updates: [...c.updates, { status, note: note || `Status changed to ${status}.`, created_at: now }],
        }),
      notifications: [notify(status === "Resolved" ? `${id} has been resolved` : `${id} status changed to ${status}`, id), ...state.notifications],
    });
  },
  markAllRead() { set({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }); },
  updateProfile(p: Partial<Profile>) { set({ profile: { ...state.profile, ...p } }); },
  setRole(role: State["role"]) { set({ role }); },
  reset() { const i = initial(); set({ ...i, hydrated: true }); },
};
