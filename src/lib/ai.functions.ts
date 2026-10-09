import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATEGORIES, PRIORITIES, ROUTING, fallbackAnalyze, type Analysis } from "./fixmate";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const SYSTEM = `You are FixMate AI, an intelligent complaint analysis assistant. Analyze the user's complaint objectively. Categorize it, determine the responsible department, estimate urgency, summarize it, rewrite it as a professional complaint and suggest a practical action plan. Do not invent facts that are not in the complaint.
Categories: ${CATEGORIES.join(", ")}.
Priorities: ${PRIORITIES.join(", ")}.
Routing rules: ${ROUTING.map((r) => `${r.keywords.slice(0, 5).join("/")} -> ${r.department}`).join("; ")}; unclear -> General Administration.
Return ONLY a JSON object with keys: title, summary, category, department, priority, urgency_reason, sentiment, keywords (array of strings), professional_complaint, action_plan (array of 3-5 strings), recommended_next_step, estimated_resolution_time (e.g. "4–8 hours"), confidence (integer 0-100).`;

async function callAI(messages: { role: string; content: string }[], json: boolean) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("NO_KEY");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, ...(json ? { response_format: { type: "json_object" } } : {}) }),
  });
  if (!res.ok) throw new Error(`AI_${res.status}`);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content ?? "");
}

export const analyzeComplaint = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(10).max(3000), location: z.string().max(200).default("") }).parse(d))
  .handler(async ({ data }): Promise<Analysis & { notice?: string }> => {
    try {
      const raw = await callAI([
        { role: "system", content: SYSTEM },
        { role: "user", content: `Complaint: ${data.text}\nLocation: ${data.location || "not specified"}` },
      ], true);
      const p = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
      const fb = fallbackAnalyze(data.text, data.location);
      const priority = PRIORITIES.includes(p.priority) ? p.priority : fb.priority;
      return {
        title: String(p.title || fb.title),
        summary: String(p.summary || fb.summary),
        category: String(p.category || fb.category),
        department: String(p.department || fb.department),
        priority,
        urgency_reason: String(p.urgency_reason || fb.urgency_reason),
        sentiment: String(p.sentiment || "Neutral"),
        keywords: Array.isArray(p.keywords) ? p.keywords.map(String).slice(0, 8) : fb.keywords,
        professional_complaint: String(p.professional_complaint || fb.professional_complaint),
        action_plan: Array.isArray(p.action_plan) ? p.action_plan.map(String) : fb.action_plan,
        recommended_next_step: String(p.recommended_next_step || fb.recommended_next_step),
        estimated_resolution_time: String(p.estimated_resolution_time || fb.estimated_resolution_time),
        confidence: Math.max(0, Math.min(100, Number(p.confidence) || 80)),
        mode: "live",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      return {
        ...fallbackAnalyze(data.text, data.location),
        notice: msg === "AI_429" ? "AI is busy right now — used Demo AI Mode." : msg === "AI_402" ? "AI credits exhausted — used Demo AI Mode." : "AI unavailable — used Demo AI Mode.",
      };
    }
  });

const HELP = `You are FixMate AI Assistant, a help bot inside the FixMate AI complaint app. Only answer questions about using FixMate: reporting problems, categories, departments, priorities, statuses and tracking. Politely decline unrelated topics. Be concise (under 120 words), friendly, and use short bullet lists when helpful.
Categories: ${CATEGORIES.join(", ")}.
Routing: ${ROUTING.map((r) => `${r.category} (${r.keywords.slice(0, 4).join(", ")}) -> ${r.department}`).join("; ")}; unclear -> General Administration.
Priorities: Low = minor; Medium = affects routine; High = blocks work or near deadline; Critical = safety risk or many affected.
Statuses: Submitted -> Under Review -> Assigned -> In Progress -> Resolved.
Good complaints include: what happened, where (building/room), since when, who is affected, any deadline, and a photo if possible.
To report: go to "Report a Problem", describe the issue, click "Analyze with AI", review and submit.`;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(20) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const reply = await callAI([{ role: "system", content: HELP }, ...data.messages], false);
      return { reply, mode: "live" as const };
    } catch {
      const q = data.messages[data.messages.length - 1]?.content.toLowerCase() ?? "";
      const r = ROUTING.find((x) => x.keywords.some((k) => q.includes(k.trim())));
      let reply = "I can help with reporting problems, departments, priorities and tracking. Try asking “Which department handles Wi-Fi problems?”";
      if (r) reply = `**${r.category}** issues are handled by **${r.department}**. Typical AI-estimated resolution: ${r.eta}.`;
      else if (q.includes("priority")) reply = "- **Low**: minor\n- **Medium**: affects routine\n- **High**: blocks work or near deadline\n- **Critical**: safety risk";
      else if (q.includes("include") || q.includes("information")) reply = "Include what happened, where, since when, who is affected, any deadline, and a photo if possible.";
      return { reply: reply + "\n\n_Demo AI Mode_", mode: "demo" as const };
    }
  });
