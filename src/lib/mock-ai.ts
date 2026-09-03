/**
 * Deterministic, realistic mock generators for the AI productivity modules.
 * These run entirely in the browser so the app works with no API key.
 */

export type Tone = "Formal" | "Friendly" | "Persuasive" | "Conciliatory";
export type Length = "Short" | "Balanced" | "Detailed";
export type FocusArea = "Market Analysis" | "Technical Summary" | "Executive Brief";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function titleCase(s: string) {
  return s
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function sentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+|;\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

function lines(text: string): string[] {
  return text
    .split(/\n|•|- |\d+\.\s/)
    .map((s) => s.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}

/* ------------------------------ Email ------------------------------ */

export interface EmailInput {
  topic: string;
  recipient: string;
  tone: Tone;
  length: Length;
  sender?: string;
}

const salutations: Record<Tone, (r: string) => string> = {
  Formal: (r) => `Dear ${r},`,
  Friendly: (r) => `Hi ${r},`,
  Persuasive: (r) => `Hello ${r},`,
  Conciliatory: (r) => `Dear ${r},`,
};

const openers: Record<Tone, string> = {
  Formal: "I hope this message finds you well. I am writing to share an update regarding",
  Friendly: "Hope you're having a good week! Wanted to give you a quick update on",
  Persuasive: "I want to bring something to your attention that I believe is a meaningful opportunity:",
  Conciliatory: "Thank you for your patience, and I want to acknowledge the impact of the situation regarding",
};

const ctas: Record<Tone, string> = {
  Formal: "Could you please confirm your availability for a 30-minute review this week?",
  Friendly: "Any chance you're free for a quick 20-minute chat this week to align?",
  Persuasive: "I'd like to secure your approval to proceed — can we lock in a decision by Friday?",
  Conciliatory: "I would welcome the chance to walk you through our corrective plan at your convenience.",
};

const signoffs: Record<Tone, string> = {
  Formal: "Kind regards",
  Friendly: "Thanks so much",
  Persuasive: "Looking forward to your decision",
  Conciliatory: "With appreciation",
};

export function generateEmail(input: EmailInput): string {
  const recipient = input.recipient.trim() || "Team";
  const topic = input.topic.trim() || "our current project status";
  const subject = `Subject: ${titleCase(topic)} — ${
    input.tone === "Conciliatory" ? "Update & Next Steps" : "Update and Proposed Next Steps"
  }`;

  const context = sentences(topic);
  const detail =
    context.length > 1
      ? context.slice(1).map((s) => `• ${s.replace(/\.$/, "")}.`).join("\n")
      : [
          "• Current status: work is progressing against the agreed milestones.",
          "• Key dependency: sign-off is required before the next delivery window.",
          "• Risk: any slippage compresses the validation phase later in the cycle.",
        ].join("\n");

  const body = [
    `${openers[input.tone]} ${topic.replace(/\.$/, "")}.`,
    "",
    input.length === "Short" ? "" : "Here is a short summary of where things stand:",
    input.length === "Short"
      ? detail.split("\n").slice(0, 1).join("\n")
      : input.length === "Balanced"
        ? detail.split("\n").slice(0, 3).join("\n")
        : detail,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const extended =
    input.length === "Detailed"
      ? [
          "",
          "Context and rationale:",
          "This approach keeps the delivery date intact while protecting quality. We have reviewed the trade-offs with the delivery leads and believe the plan below is the lowest-risk path forward.",
          "",
          "Proposed next steps:",
          "1. Confirm scope and owners for the remaining workstreams.",
          "2. Agree the review checkpoint and the decision deadline.",
          "3. Circulate the final summary to the wider stakeholder group.",
        ].join("\n")
      : "";

  return [
    subject,
    "",
    salutations[input.tone](recipient),
    "",
    body,
    extended,
    "",
    ctas[input.tone],
    "",
    `${signoffs[input.tone]},`,
    input.sender?.trim() || "Alex Morgan",
    "Workplace Productivity Office",
  ]
    .filter((l) => l !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/* -------------------------- Meeting notes -------------------------- */

export interface ActionItem {
  task: string;
  owner: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
}

export interface MeetingSummary {
  title: string;
  date: string;
  summary: string[];
  decisions: string[];
  actions: ActionItem[];
}

const ownerPool = ["Priya N.", "Daniel K.", "Sofia R.", "Marcus L.", "Team Lead"];
const priorityPool: ActionItem["priority"][] = ["High", "Medium", "Low"];

function relativeDate(daysFromNow: number, base: string) {
  const d = base ? new Date(base) : new Date();
  const safe = isNaN(d.getTime()) ? new Date() : d;
  safe.setDate(safe.getDate() + daysFromNow);
  return safe.toISOString().slice(0, 10);
}

export function generateMeetingSummary(
  transcript: string,
  title: string,
  date: string,
): MeetingSummary {
  const src = lines(transcript);
  const sents = sentences(transcript);

  const summary =
    sents.length >= 2
      ? sents.slice(0, 3).map((s) => s.replace(/\.$/, ""))
      : [
          "The team reviewed current delivery progress and confirmed the milestone plan remains achievable",
          "Two dependencies were flagged as the main risk to the next release window",
          "Stakeholder communication cadence was agreed as weekly written updates",
        ];

  const decisionCandidates = src.filter((l) =>
    /(decide|decided|agree|agreed|approve|approved|will|go ahead|sign-?off)/i.test(l),
  );
  const decisions =
    decisionCandidates.length > 0
      ? decisionCandidates.slice(0, 4).map((d) => d.replace(/\.$/, ""))
      : [
          "Proceed with the phased rollout rather than a single cutover",
          "Freeze scope for the current sprint; new requests go to the next cycle",
          "Escalate the vendor dependency to the steering committee",
        ];

  const actionCandidates = src.filter((l) =>
    /(action|todo|to-do|follow up|follow-up|owner|by (mon|tue|wed|thu|fri|next)|prepare|send|draft|review)/i.test(
      l,
    ),
  );
  const raw =
    actionCandidates.length > 0
      ? actionCandidates.slice(0, 6)
      : [
          "Draft the phased rollout plan and circulate for review",
          "Confirm vendor SLA and contract dependency dates",
          "Update the risk register with the two flagged dependencies",
          "Prepare the stakeholder summary for the weekly update",
        ];

  const actions: ActionItem[] = raw.map((task, i) => ({
    task: task.replace(/^(action item|action|todo)[:\-\s]*/i, "").replace(/\.$/, ""),
    owner: ownerPool[i % ownerPool.length],
    deadline: relativeDate(3 + i * 2, date),
    priority: priorityPool[i % 3],
  }));

  return {
    title: title.trim() || "Untitled Meeting",
    date: date || new Date().toISOString().slice(0, 10),
    summary,
    decisions,
    actions,
  };
}

/* ----------------------------- Tasks ------------------------------- */

export type Quadrant =
  | "Urgent & Important"
  | "Important, Not Urgent"
  | "Urgent, Not Important"
  | "Neither Urgent nor Important";

export interface ScheduledBlock {
  start: string;
  end: string;
  task: string;
  quadrant: Quadrant;
  durationMinutes: number;
  day: string;
}

export interface TaskPlan {
  blocks: ScheduledBlock[];
  quadrants: Record<Quadrant, string[]>;
  view: "Daily" | "Weekly";
  notes: string[];
}

function classify(task: string): Quadrant {
  const t = task.toLowerCase();
  const urgent = /(today|asap|urgent|deadline|tomorrow|overdue|escalat|blocker|critical|now)/.test(t);
  const important =
    /(strategy|strategic|plan|client|revenue|hire|roadmap|review|design|report|board|budget|security|customer)/.test(
      t,
    );
  if (urgent && important) return "Urgent & Important";
  if (!urgent && important) return "Important, Not Urgent";
  if (urgent && !important) return "Urgent, Not Important";
  return "Neither Urgent nor Important";
}

function estimate(task: string): number {
  const words = task.split(/\s+/).length;
  const base = /(write|draft|design|build|prepare|analyz|analys|research)/i.test(task) ? 90 : 45;
  return Math.min(150, Math.max(30, base + (words > 8 ? 30 : 0)));
}

const quadrantOrder: Quadrant[] = [
  "Urgent & Important",
  "Important, Not Urgent",
  "Urgent, Not Important",
  "Neither Urgent nor Important",
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function fmt(minutesFrom9: number) {
  const total = 9 * 60 + minutesFrom9;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function generateTaskPlan(
  rawTasks: string,
  hoursPerDay: number,
  view: "Daily" | "Weekly",
): TaskPlan {
  const items = lines(rawTasks);
  const tasks = items.length
    ? items
    : [
        "Finalize Q3 board report (deadline Friday)",
        "Review security audit findings",
        "Respond to urgent vendor invoice query",
        "Draft product roadmap for next quarter",
        "Reorganize shared drive folders",
      ];

  const quadrants: Record<Quadrant, string[]> = {
    "Urgent & Important": [],
    "Important, Not Urgent": [],
    "Urgent, Not Important": [],
    "Neither Urgent nor Important": [],
  };
  tasks.forEach((t) => quadrants[classify(t)].push(t));

  const ordered = quadrantOrder.flatMap((q) => quadrants[q].map((t) => ({ task: t, quadrant: q })));

  const capacity = Math.max(1, hoursPerDay) * 60;
  const blocks: ScheduledBlock[] = [];
  let cursor = 0;
  let dayIndex = 0;

  for (const { task, quadrant } of ordered) {
    const dur = estimate(task);
    if (cursor + dur > capacity) {
      if (view === "Weekly" && dayIndex < weekdays.length - 1) {
        dayIndex += 1;
        cursor = 0;
      } else if (view === "Weekly") {
        break;
      } else {
        break;
      }
    }
    const day = view === "Weekly" ? weekdays[dayIndex] : "Today";
    blocks.push({
      start: fmt(cursor),
      end: fmt(cursor + dur),
      task,
      quadrant,
      durationMinutes: dur,
      day,
    });
    cursor += dur + 15; // buffer
  }

  const scheduled = blocks.length;
  const notes = [
    `${scheduled} of ${ordered.length} tasks time-blocked within ${hoursPerDay}h/day capacity.`,
    "15-minute buffers inserted between blocks to absorb overruns.",
    quadrants["Neither Urgent nor Important"].length
      ? `Consider dropping or batching: ${quadrants["Neither Urgent nor Important"].join(", ")}.`
      : "No low-value tasks detected — good signal on backlog hygiene.",
    quadrants["Urgent, Not Important"].length
      ? `Delegation candidates: ${quadrants["Urgent, Not Important"].join(", ")}.`
      : "Nothing obvious to delegate this cycle.",
  ];

  return { blocks, quadrants, view, notes };
}

/* ---------------------------- Research ----------------------------- */

export interface ResearchBrief {
  topic: string;
  focus: FocusArea;
  highlights: string[];
  insights: string[];
  recommendations: string[];
  risks: string[];
}

export function generateResearchBrief(input: string, focus: FocusArea): ResearchBrief {
  const topic = input.trim() ? titleCase(input) : "Cloud Migration Strategy";
  const sents = sentences(input);
  const seed = sents.length ? sents : [];

  const byFocus: Record<FocusArea, { insights: string[]; recs: string[] }> = {
    "Market Analysis": {
      insights: [
        "Demand is concentrating around vendors that bundle governance with core capability, not feature breadth.",
        "Mid-market buyers show the fastest adoption curve, with procurement cycles shortening to 6–9 weeks.",
        "Pricing pressure is emerging from bundled platform offerings rather than direct point-solution rivals.",
      ],
      recs: [
        "Segment the go-to-market by buying-committee maturity and lead with governance proof points.",
        "Package a low-friction entry tier to capture mid-market pipeline before incumbents bundle.",
        "Instrument win/loss reasons for two quarters before repricing.",
      ],
    },
    "Technical Summary": {
      insights: [
        "The architecture decision hinges on data gravity: latency-sensitive workloads resist full centralization.",
        "Observability and rollback tooling are the strongest predictors of safe delivery velocity.",
        "Incremental interface contracts reduce coupling more effectively than large refactors.",
      ],
      recs: [
        "Adopt a phased migration with dual-write and read-shadowing before cutover.",
        "Define service-level objectives per workload and gate each phase on them.",
        "Automate rollback paths and rehearse them before the first production phase.",
      ],
    },
    "Executive Brief": {
      insights: [
        "The measurable upside is operational: cycle-time reduction compounds faster than headcount savings.",
        "Execution risk, not technology risk, drives most variance in comparable programmes.",
        "Benefits realization typically lags delivery by one to two quarters.",
      ],
      recs: [
        "Fund the first phase only, with a stage-gate tied to two hard metrics.",
        "Name a single accountable owner and a weekly written decision log.",
        "Set expectations with the board on a two-quarter benefit lag.",
      ],
    },
  };

  const highlights = (
    seed.length >= 3
      ? seed.slice(0, 4)
      : [
          `${topic} is best treated as a staged programme rather than a single decision`,
          "Two or three constraints explain most of the outcome variance",
          "Early measurement beats early scale — instrument before expanding",
          "Stakeholder alignment is the cheapest risk reduction available",
        ]
  ).map((s) => s.replace(/\.$/, ""));

  return {
    topic,
    focus,
    highlights,
    insights: byFocus[focus].insights,
    recommendations: byFocus[focus].recs,
    risks: [
      "Source material is partial; figures should be validated against primary data before circulation.",
      "Assumptions about timelines depend on unconfirmed dependency availability.",
      "Comparable-case reasoning may not transfer to your regulatory context.",
      "AI-generated synthesis can omit contradicting evidence — review before decisions.",
    ],
  };
}

export function researchBriefToText(b: ResearchBrief): string {
  const section = (t: string, items: string[]) =>
    `${t.toUpperCase()}\n${items.map((i) => `• ${i}`).join("\n")}`;
  return [
    `RESEARCH BRIEF — ${b.topic}`,
    `Focus: ${b.focus}`,
    "",
    section("Key Highlights", b.highlights),
    "",
    section("Industry Insights", b.insights),
    "",
    section("Strategic Recommendations", b.recommendations),
    "",
    section("Potential Risks & Caveats", b.risks),
  ].join("\n");
}

export function meetingSummaryToText(m: MeetingSummary): string {
  return [
    `MEETING SUMMARY — ${m.title}`,
    `Date: ${m.date}`,
    "",
    "EXECUTIVE SUMMARY",
    ...m.summary.map((s) => `• ${s}`),
    "",
    "KEY DECISIONS MADE",
    ...m.decisions.map((s) => `• ${s}`),
    "",
    "ACTION ITEMS",
    ...m.actions.map((a) => `• ${a.task} — ${a.owner} — due ${a.deadline} — ${a.priority}`),
  ].join("\n");
}

export function taskPlanToText(p: TaskPlan): string {
  return [
    `TIME-BLOCKED SCHEDULE (${p.view} view)`,
    "",
    ...p.blocks.map((b) => `${b.day}  ${b.start} - ${b.end}   ${b.task}  [${b.quadrant}]`),
    "",
    "EISENHOWER MATRIX",
    ...quadrantOrder.map((q) => `${q}: ${p.quadrants[q].join("; ") || "—"}`),
    "",
    "PLANNER NOTES",
    ...p.notes.map((n) => `• ${n}`),
  ].join("\n");
}

/* ---------------------------- Chatbot ------------------------------ */

export function generateChatReply(message: string, history: number): string {
  const m = message.toLowerCase();

  if (/apolog|delay|slip|late/.test(m)) {
    return [
      "Here's a structured approach for a delay communication:",
      "",
      "**1. Lead with the facts** — state the new date up front; don't bury it.",
      "**2. Own the cause briefly** — one sentence, no blame-shifting.",
      "**3. Show the corrective plan** — two or three concrete mitigations with owners.",
      "**4. Reconfirm commitment** — what is *not* changing (scope, quality, budget).",
      "",
      "Draft opener you can reuse: *\"I want to let you know directly that the delivery date for X has moved to Y. Here's what caused it and what we're doing about it.\"*",
      "",
      "Want me to turn this into a full email? The Smart Email Generator with a Conciliatory tone will do it in one click.",
    ].join("\n");
  }

  if (/risk|cloud|migration|security/.test(m)) {
    return [
      "Key risk themes for a cloud migration, ranked by how often they bite:",
      "",
      "• **Data gravity & latency** — chatty, latency-sensitive workloads underperform after a lift-and-shift.",
      "• **Cost drift** — egress and idle non-production environments drive most overruns.",
      "• **Identity & access sprawl** — inconsistent role models create audit findings later.",
      "• **Operational readiness** — teams inherit new failure modes without new runbooks.",
      "• **Compliance evidence** — controls exist but aren't demonstrable to auditors.",
      "",
      "Mitigation pattern: phase by workload, dual-run critical paths, and gate each phase on explicit SLOs plus a cost checkpoint.",
    ].join("\n");
  }

  if (/prioriti|plan|schedule|time|busy|overwhelm/.test(m)) {
    return [
      "Let's make this concrete. A fast prioritization pass:",
      "",
      "1. List everything competing for this week — no filtering yet.",
      "2. Tag each item **Urgent / Important** (Eisenhower). Only the urgent-and-important set gets prime morning hours.",
      "3. Batch the urgent-but-unimportant work into one afternoon block, or delegate it.",
      "4. Protect one 90-minute deep-work block daily for important-not-urgent work — that's where compounding value lives.",
      "",
      "Paste your list into the **AI Task Planner** and I'll return a time-blocked schedule with durations.",
    ].join("\n");
  }

  if (/meeting|notes|summar|minutes/.test(m)) {
    return [
      "For meeting output that people actually act on, keep three sections and nothing else:",
      "",
      "• **Executive summary** — 2–3 bullets a stakeholder can read in 15 seconds.",
      "• **Decisions made** — decision, rationale, and who owns it.",
      "• **Action items** — task, owner, deadline, priority. Anything without an owner isn't an action.",
      "",
      "Drop your raw transcript into the **Meeting Notes Summarizer** and it'll produce exactly that structure.",
    ].join("\n");
  }

  if (/hello|hi\b|hey|help|what can you/.test(m) || history === 0) {
    return [
      "Hi — I'm your workplace productivity assistant. I can help with:",
      "",
      "• Drafting and sharpening professional emails",
      "• Turning messy meeting notes into decisions and action items",
      "• Prioritizing and time-blocking your week",
      "• Structuring research into an executive-ready brief",
      "",
      "Tell me what's on your plate, or try one of the suggested prompts below.",
    ].join("\n");
  }

  return [
    `Here's how I'd approach "${message.trim().slice(0, 80)}":`,
    "",
    "**Frame it** — what decision or deliverable does this actually serve? Write that in one sentence first.",
    "**Reduce it** — identify the two constraints that explain most of the outcome; ignore the rest for now.",
    "**Sequence it** — one visible step in the next 24 hours, one checkpoint in the next week.",
    "**Communicate it** — a short written update beats a meeting for anything that isn't a decision.",
    "",
    "If you want, I can turn this into an email, a schedule, or a research brief — just say which.",
  ].join("\n");
}

/* --------------------------- Live calls ---------------------------- */

export async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

export async function simulateLatency(ms = 900) {
  await wait(ms);
}

export const samples = {
  emailTopic:
    "The Q3 analytics dashboard release has slipped by one week because the data pipeline migration uncovered three schema mismatches. The team has a fix in test and expects to ship next Thursday. We need sign-off on the revised launch communication.",
  emailRecipient: "Dana Whitfield, VP of Operations",
  meetingTitle: "Q3 Platform Delivery Review",
  meetingNotes: `Attendees: Priya, Daniel, Sofia, Marcus
Priya opened with delivery status: analytics dashboard is 80% complete but the data pipeline migration surfaced three schema mismatches.
Daniel said the fix is in test and we agreed to ship next Thursday rather than rush a Friday deploy.
Sofia raised that the vendor SLA renewal is unconfirmed and this is now the biggest dependency risk.
We decided to proceed with a phased rollout to 20% of accounts first instead of a full cutover.
Marcus will prepare the stakeholder communication and circulate for review by Wednesday.
Action: Daniel to confirm vendor SLA dates with procurement.
Action: Sofia to update the risk register with the pipeline and vendor dependencies.
We agreed to freeze scope for this sprint; new requests move to the next cycle.
Action: Priya to draft the phased rollout plan and share with the steering committee.`,
  tasks: `Finalize Q3 board report - deadline Friday
Review security audit findings with the risk team
Respond to urgent vendor invoice query
Draft product roadmap for next quarter
Prepare client onboarding deck for Acme
Reorganize the shared drive folder structure
Approve design review comments`,
  research: `We are evaluating a migration of our core customer platform from on-premise infrastructure to a managed cloud environment. Early vendor conversations suggest a 12 to 18 month programme. Internal engineering estimates cycle-time improvements of 30 percent, but finance is concerned about egress costs and the compliance team has flagged audit evidence requirements. Two competitors completed similar programmes last year with mixed public results.`,
};
