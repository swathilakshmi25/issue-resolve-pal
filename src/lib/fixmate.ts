export const CATEGORIES = [
  "IT & Network", "Academic", "Hostel", "Transport", "Electrical", "Maintenance",
  "Security", "Finance", "Library", "Administration", "Other",
] as const;
export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export const STATUSES = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Analysis {
  title: string;
  summary: string;
  category: string;
  department: string;
  priority: Priority;
  urgency_reason: string;
  sentiment: string;
  keywords: string[];
  professional_complaint: string;
  action_plan: string[];
  recommended_next_step: string;
  estimated_resolution_time: string;
  confidence: number;
  mode: "live" | "demo";
}

export interface ComplaintUpdate { status: Status | "AI Analyzed"; note: string; created_at: string }

export interface Complaint extends Analysis {
  id: string;
  original_text: string;
  location: string;
  contact: string;
  anonymous: boolean;
  status: Status;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_notes: string;
  updates: ComplaintUpdate[];
}

export const ROUTING: { category: string; department: string; keywords: string[]; eta: string }[] = [
  { category: "IT & Network", department: "IT Support", keywords: ["wifi", "wi-fi", "internet", "network", "portal", "login", "computer", "lab", "server", "password", "email"], eta: "4–8 hours" },
  { category: "Academic", department: "Academic Department", keywords: ["classroom", "faculty", "exam", "attendance", "marks", "grade", "lecture", "syllabus", "assignment", "timetable"], eta: "1–3 days" },
  { category: "Hostel", department: "Hostel Administration", keywords: ["hostel", "mess", "food", "warden", "roommate"], eta: "1–2 days" },
  { category: "Electrical", department: "Maintenance", keywords: ["electricity", "power", "fan", "light", "socket", "ac ", "air conditioner", "short circuit"], eta: "6–12 hours" },
  { category: "Maintenance", department: "Maintenance", keywords: ["water", "cleaning", "leak", "toilet", "washroom", "dispenser", "broken", "door", "room", "repair", "pipe"], eta: "1–2 days" },
  { category: "Transport", department: "Transport Department", keywords: ["bus", "route", "transport", "driver", "late", "van", "parking"], eta: "2–3 days" },
  { category: "Finance", department: "Finance Department", keywords: ["payment", "fee", "refund", "scholarship", "receipt", "fine"], eta: "3–5 days" },
  { category: "Library", department: "Library", keywords: ["library", "book", "books", "journal", "reading room"], eta: "1–2 days" },
  { category: "Security", department: "Security Department", keywords: ["security", "lost", "stolen", "theft", "safety", "harassment", "unsafe", "cctv"], eta: "2–6 hours" },
];

export const PRIORITY_HELP: Record<Priority, string> = {
  Low: "Minor inconvenience, no deadline impact.",
  Medium: "Affects routine work; should be addressed within days.",
  High: "Blocks studies or work, or has a near deadline.",
  Critical: "Safety risk or affects many people urgently.",
};

export function fallbackAnalyze(text: string, location = ""): Analysis {
  const t = ` ${text.toLowerCase()} `;
  let best = { r: null as (typeof ROUTING)[number] | null, hits: [] as string[] };
  for (const r of ROUTING) {
    const hits = r.keywords.filter((k) => t.includes(k));
    if (hits.length > best.hits.length) best = { r, hits };
  }
  const r = best.r;
  const category = r?.category ?? "Administration";
  const department = r?.department ?? "General Administration";
  const critical = /(fire|injur|unsafe|harass|emergency|spark|shock|stolen|theft)/.test(t);
  const high = /(exam|tomorrow|urgent|deadline|days|cannot|can't|not working|since)/.test(t);
  const low = /(minor|suggest|would be nice|sometimes)/.test(t);
  const priority: Priority = critical ? "Critical" : high ? "High" : low ? "Low" : "Medium";
  const reasons: Record<Priority, string> = {
    Critical: "The complaint mentions a potential safety or security risk that needs immediate attention.",
    High: "The issue is blocking normal activity or is tied to a time-sensitive deadline.",
    Medium: "The issue affects routine activities but has no immediate deadline mentioned.",
    Low: "The issue appears to be a minor inconvenience or suggestion.",
  };
  const first = (text.trim().split(/[.!?]/)[0] ?? "").slice(0, 70);
  const title = first.length > 5 ? first.charAt(0).toUpperCase() + first.slice(1) : `${category} issue`;
  const where = location ? ` at ${location}` : "";
  const negative = /(not|never|again|third time|frustrat|angry|worst)/.test(t);
  return {
    title,
    summary: `${category} issue reported${where}: ${text.trim().slice(0, 160)}${text.length > 160 ? "…" : ""}`,
    category,
    department,
    priority,
    urgency_reason: reasons[priority],
    sentiment: negative ? "Frustrated" : "Neutral",
    keywords: best.hits.length ? best.hits.map((h) => h.trim()) : ["general"],
    professional_complaint: `Dear ${department},\n\nI would like to formally report the following issue${where}:\n\n${text.trim()}\n\nI kindly request that this matter be reviewed and resolved at the earliest. Please let me know if any further information is required.\n\nThank you for your assistance.\n\nSincerely,\nA concerned student`,
    action_plan: [
      `Submit the complaint to ${department}.`,
      location ? `Mention the affected location (${location}).` : "Mention the exact building or room affected.",
      "Attach a photo or screenshot if available.",
      priority === "High" || priority === "Critical" ? "Request priority handling due to the urgency." : "Follow up if there is no response within the estimated time.",
    ],
    recommended_next_step: `Submit this complaint so it is routed to ${department}.`,
    estimated_resolution_time: priority === "Critical" ? "1–4 hours" : r?.eta ?? "2–4 days",
    confidence: r ? Math.min(95, 62 + best.hits.length * 10) : 45,
    mode: "demo",
  };
}

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

function demo(id: number, text: string, location: string, status: Status, hoursAgo: number, over: Partial<Analysis> = {}): Complaint {
  const a = { ...fallbackAnalyze(text, location), ...over };
  const order: Status[] = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
  const idx = order.indexOf(status);
  const updates: ComplaintUpdate[] = [
    { status: "Submitted", note: "Complaint submitted.", created_at: ago(hoursAgo) },
    { status: "AI Analyzed", note: `Routed to ${a.department} as ${a.priority} priority.`, created_at: ago(hoursAgo - 0.05) },
  ];
  order.slice(1, idx + 1).forEach((s, i) =>
    updates.push({ status: s, note: s === "Resolved" ? "Issue fixed and verified." : `Status updated to ${s}.`, created_at: ago(hoursAgo - (i + 1) * Math.max(1, hoursAgo / 6)) }),
  );
  return {
    ...a, id: `FM-${id}`, original_text: text, location, contact: "Email", anonymous: false, status,
    created_at: ago(hoursAgo), updated_at: updates[updates.length - 1]!.created_at,
    resolved_at: status === "Resolved" ? updates[updates.length - 1]!.created_at : null,
    resolution_notes: status === "Resolved" ? "Issue fixed and verified by the department." : "", updates,
  };
}

export function demoComplaints(): Complaint[] {
  return [
    demo(1012, "The Wi-Fi in the AI & DS lab has been disconnected since yesterday and we cannot do our practicals.", "AI & DS Lab, Block C", "In Progress", 20, { category: "IT & Network", department: "IT Support", priority: "High" }),
    demo(1011, "The water dispenser near the hostel block is not working.", "Hostel Block B", "Assigned", 30, { category: "Maintenance", department: "Maintenance", priority: "Medium" }),
    demo(1010, "My bus arrived 30 minutes late for the third time this week.", "Route 7", "Under Review", 44, { category: "Transport", department: "Transport Department", priority: "Medium" }),
    demo(1009, "I cannot access my internal marks on the student portal.", "Student Portal", "Submitted", 6, { category: "Academic", department: "Academic Administration", priority: "High" }),
    demo(1008, "Sparks are coming from the switch board in classroom 204, it looks unsafe.", "Classroom 204", "Resolved", 120, { category: "Electrical", department: "Maintenance", priority: "Critical" }),
    demo(1007, "The library has not restocked the data science reference books for two weeks.", "Central Library", "Resolved", 200),
    demo(1006, "My fee payment was deducted twice but the receipt shows only one payment.", "Online", "In Progress", 90),
    demo(1005, "The mess food quality in the hostel has been poor this week.", "Hostel Mess", "Resolved", 260),
    demo(1004, "I lost my ID card near the main gate, please help.", "Main Gate", "Resolved", 300),
    demo(1003, "Fans in the seminar hall are not working.", "Seminar Hall", "Resolved", 340),
  ];
}
