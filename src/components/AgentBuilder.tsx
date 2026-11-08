"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { lerp, tween, useMotionOk, wait, type Pt } from "@/lib/anim";

/*
  Build an agent: connect tools to the agent, pick a task and watch it plan
  and call the tools it needs. If a tool is missing, the agent says so.
  Everything is scripted; no model is called.
*/

type ToolId = "search" | "database" | "calendar" | "email" | "slack" | "payments" | "code" | "docs";
type Side = "above" | "below" | "left" | "right";

const AGENT: Pt = { x: 320, y: 240 };

const TOOLS: Record<ToolId, Pt & { name: string; sub: string; side: Side }> = {
  search: { x: 320, y: 70, name: "Search", sub: "Finds pages on the web", side: "above" },
  database: { x: 482, y: 122, name: "Database", sub: "Runs queries", side: "right" },
  calendar: { x: 515, y: 240, name: "Calendar", sub: "Books meetings", side: "right" },
  email: { x: 482, y: 358, name: "Email", sub: "Sends messages", side: "right" },
  slack: { x: 320, y: 410, name: "Slack", sub: "Posts to the team", side: "below" },
  payments: { x: 158, y: 358, name: "Payments", sub: "Charges and refunds", side: "left" },
  code: { x: 112, y: 240, name: "Code", sub: "Runs Python", side: "left" },
  docs: { x: 158, y: 122, name: "Docs", sub: "Company documents", side: "left" },
};
const TOOL_IDS = Object.keys(TOOLS) as ToolId[];

type Step = { tool: ToolId; call: string; result: string };
type Task = { id: string; label: string; plan: string; steps: Step[]; answer: string };

const TASKS: Task[] = [
  {
    id: "meeting",
    label: "Book a meeting with Anna next week",
    plan: "Find a free slot in both calendars, then email Anna the options.",
    steps: [
      { tool: "calendar", call: 'calendar.find_free_slots({ with: "Anna", week: "next" })', result: "Tuesday 10:00 and Thursday 14:00 are free" },
      { tool: "email", call: 'email.send({ to: "Anna", subject: "Meeting next week" })', result: "Email sent" },
    ],
    answer: "I've emailed Anna and suggested Tuesday at 10:00 or Thursday at 14:00.",
  },
  {
    id: "orders",
    label: "How many orders came in last week?",
    plan: "Count last week's orders in the database.",
    steps: [{ tool: "database", call: 'db.query("SELECT COUNT(*) FROM orders WHERE week = last")', result: "128 rows counted" }],
    answer: "128 orders came in last week.",
  },
  {
    id: "policy",
    label: "What does our refund policy say?",
    plan: "Search the company documents for the refund policy and quote the relevant part.",
    steps: [{ tool: "docs", call: 'docs.search({ query: "refund policy", top: 3 })', result: "Found refund-policy.pdf, section 2" }],
    answer: "Customers can return items within 30 days for a full refund. The details are in section 2 of the refund policy.",
  },
  {
    id: "chart",
    label: "Chart our revenue for the last 6 months",
    plan: "Pull monthly revenue from the database, then plot it with Python.",
    steps: [
      { tool: "database", call: 'db.query("monthly revenue, last 6 months")', result: "6 rows returned" },
      { tool: "code", call: "python.run(plot_line(rows, x='month', y='revenue'))", result: "revenue.png created" },
    ],
    answer: "Here is the chart. Revenue has grown in four of the last six months.",
  },
  {
    id: "thanks",
    label: "Email last week's top customer a thank-you",
    plan: "Find the customer with the most orders, then send them a thank-you email.",
    steps: [
      { tool: "database", call: 'db.query("top customer by orders, last week")', result: "Customer #4821, 9 orders" },
      { tool: "email", call: 'email.send({ to: "customer #4821", template: "thank-you" })', result: "Email sent" },
    ],
    answer: "Done. Customer #4821 placed 9 orders last week and has been sent a thank-you email.",
  },
  {
    id: "refund",
    label: "Refund order 1093 and let the team know",
    plan: "Look up the order, refund the payment, then post a note in the support channel.",
    steps: [
      { tool: "database", call: 'db.query("order 1093")', result: "Order 1093, 499 SEK, paid by card" },
      { tool: "payments", call: "payments.refund({ order: 1093, amount: 499 })", result: "Refund issued" },
      { tool: "slack", call: 'slack.post({ channel: "#support", text: "Order 1093 refunded" })', result: "Posted in #support" },
    ],
    answer: "Order 1093 has been refunded (499 SEK) and the support team has been told in #support.",
  },
  {
    id: "standup",
    label: "Find a time for the team stand-up and post it",
    plan: "Check everyone's calendar for a shared slot, then post it in Slack.",
    steps: [
      { tool: "calendar", call: 'calendar.find_free_slots({ group: "team", length: "15m" })', result: "09:15 works for everyone" },
      { tool: "slack", call: 'slack.post({ channel: "#team", text: "Stand-up at 09:15" })', result: "Posted in #team" },
    ],
    answer: "Stand-up is set for 09:15, and I've posted it in #team.",
  },
  {
    id: "research",
    label: "Summarise what people say about RAG",
    plan: "Search the web, read the top results and summarise them.",
    steps: [{ tool: "search", call: 'search.web({ query: "retrieval-augmented generation", top: 5 })', result: "5 articles read" }],
    answer: "Here is a short summary of the five most relevant articles, with links to each source.",
  },
];

const requires = (t: Task) => [...new Set(t.steps.map((s) => s.tool))];

type Line =
  | { kind: "plan"; text: string }
  | { kind: "call"; text: string }
  | { kind: "result"; text: string }
  | { kind: "answer"; text: string }
  | { kind: "missing"; text: string };

function labelPos(t: (typeof TOOLS)[ToolId]) {
  switch (t.side) {
    case "above":
      return { x: t.x, y: t.y - 40, anchor: "middle" as const };
    case "below":
      return { x: t.x, y: t.y + 34, anchor: "middle" as const };
    case "left":
      return { x: t.x - 24, y: t.y - 2, anchor: "end" as const };
    case "right":
      return { x: t.x + 24, y: t.y - 2, anchor: "start" as const };
  }
}

export default function AgentBuilder() {
  const motionOk = useMotionOk();
  const [connected, setConnected] = useState<Set<ToolId>>(new Set(["search", "database"]));
  const [taskId, setTaskId] = useState(TASKS[0].id);
  const [lines, setLines] = useState<Line[]>([]);
  const [running, setRunning] = useState(false);
  const [dot, setDot] = useState<Pt | null>(null);
  const [active, setActive] = useState<ToolId | null>(null);
  const [missing, setMissing] = useState<ToolId | null>(null);
  const [thinking, setThinking] = useState(false);
  const runId = useRef(0);

  useEffect(() => () => void (runId.current += 1), []);

  const task = TASKS.find((t) => t.id === taskId)!;
  const needed = requires(task);

  const toggle = (id: ToolId) => {
    if (running) return;
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (missing === id) setMissing(null);
  };

  const setAll = (on: boolean) => {
    if (running) return;
    setConnected(new Set(on ? TOOL_IDS : []));
    setMissing(null);
  };

  const run = async () => {
    const id = ++runId.current;
    const cancelled = () => runId.current !== id;
    const pause = (ms: number) => (motionOk ? wait(ms, cancelled) : Promise.resolve(!cancelled()));
    setRunning(true);
    setMissing(null);
    setLines([]);
    setThinking(true);
    if (!(await pause(700))) return;
    setThinking(false);
    setLines([{ kind: "plan", text: task.plan }]);
    if (!(await pause(500))) return;

    for (const step of task.steps) {
      const tool = TOOLS[step.tool];
      if (!connected.has(step.tool)) {
        setMissing(step.tool);
        setLines((l) => [
          ...l,
          { kind: "missing", text: `I need the ${tool.name} tool for this step, but it isn't connected. Connect it and run me again.` },
        ]);
        setRunning(false);
        return;
      }
      setActive(step.tool);
      setLines((l) => [...l, { kind: "call", text: step.call }]);
      if (motionOk) {
        if (!(await tween(550, (t) => setDot(lerp(AGENT, tool, t)), cancelled))) return;
        if (!(await wait(220, cancelled))) return;
        if (!(await tween(550, (t) => setDot(lerp(tool, AGENT, t)), cancelled))) return;
      }
      setDot(null);
      setLines((l) => [...l, { kind: "result", text: step.result }]);
      setActive(null);
      if (!(await pause(300))) return;
    }
    setLines((l) => [...l, { kind: "answer", text: task.answer }]);
    setRunning(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 items-start">
      {/* Graph */}
      <div className="rounded-2xl border border-line bg-deep/70 p-3 sm:p-5 lg:sticky lg:top-24">
        <svg viewBox="0 0 640 480" className="w-full select-none" role="group" aria-label="Agent and its tools">
          <defs>
            <linearGradient id="ab-line" gradientUnits="userSpaceOnUse" x1="112" y1="0" x2="515" y2="0">
              <stop offset="0" stopColor="#7DD3FC" />
              <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
            <radialGradient id="ab-glow-c">
              <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.85" />
              <stop offset="1" stopColor="#7DD3FC" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ab-glow-v">
              <stop offset="0" stopColor="#A78BFA" stopOpacity="0.9" />
              <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ab-glow-r">
              <stop offset="0" stopColor="#FB7185" stopOpacity="0.85" />
              <stop offset="1" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* faint ring linking neighbouring tools */}
          <polygon
            points={TOOL_IDS.map((id) => `${TOOLS[id].x},${TOOLS[id].y}`).join(" ")}
            fill="none"
            stroke="#222C52"
            strokeWidth={1}
          />

          {TOOL_IDS.map((id) => {
            const t = TOOLS[id];
            const on = connected.has(id);
            const want = needed.includes(id);
            return (
              <line
                key={id}
                x1={AGENT.x}
                y1={AGENT.y}
                x2={t.x}
                y2={t.y}
                stroke={on ? "url(#ab-line)" : missing === id ? "#FB7185" : want ? "#66769A" : "#2A3560"}
                strokeWidth={on ? (active === id ? 3.2 : want ? 2.2 : 1.4) : 1.3}
                strokeOpacity={on && !want && !active ? 0.55 : 1}
                strokeDasharray={on ? undefined : "5 7"}
                strokeLinecap="round"
                style={{ transition: "stroke-width .25s, stroke-opacity .25s" }}
              />
            );
          })}

          {/* Agent */}
          <circle cx={AGENT.x} cy={AGENT.y} r={thinking ? 56 : 46} fill="url(#ab-glow-v)" opacity={0.6} style={{ transition: "r .4s" }}>
            {thinking && motionOk && <animate attributeName="opacity" values="0.35;0.8;0.35" dur="0.9s" repeatCount="indefinite" />}
          </circle>
          <circle cx={AGENT.x} cy={AGENT.y} r={18} fill="#0B1328" stroke="#A78BFA" strokeWidth={2.4} />
          <circle cx={AGENT.x} cy={AGENT.y} r={6.5} fill="#DDD6FE" />
          <text className="ab-name" x={AGENT.x} y={AGENT.y + 46} textAnchor="middle" fontSize={16} fontWeight={600} fill="#E8ECF7" stroke="#0B1328" strokeWidth={5} paintOrder="stroke">
            Agent
          </text>
          <text className="ab-sub" x={AGENT.x} y={AGENT.y + 64} textAnchor="middle" fontSize={12.5} fill="#9AA6C4" stroke="#0B1328" strokeWidth={5} paintOrder="stroke">
            {thinking ? "Planning…" : `${connected.size} of 8 tools`}
          </text>

          {/* Tools */}
          {TOOL_IDS.map((id) => {
            const t = TOOLS[id];
            const on = connected.has(id);
            const want = needed.includes(id);
            const isMissing = missing === id;
            const lp = labelPos(t);
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${t.name}: ${on ? "connected" : "not connected"}${want ? ", needed for this task" : ""}. Press to ${on ? "disconnect" : "connect"}.`}
                onClick={() => toggle(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(id);
                  }
                }}
                className="cursor-pointer focus:outline-none [&:focus-visible>circle.ring]:stroke-[3]"
              >
                <circle cx={t.x} cy={t.y} r={38} fill="transparent" />
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={active === id ? 34 : 24}
                  fill={isMissing ? "url(#ab-glow-r)" : "url(#ab-glow-c)"}
                  opacity={on || isMissing ? (want || isMissing ? 0.75 : 0.35) : 0.1}
                  style={{ transition: "r .25s, opacity .25s" }}
                >
                  {isMissing && motionOk && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1s" repeatCount="indefinite" />}
                </circle>
                {want && !on && !isMissing && (
                  <circle cx={t.x} cy={t.y} r={19} fill="none" stroke="#A78BFA" strokeOpacity={0.6} strokeDasharray="2 4" />
                )}
                <circle
                  className="ring"
                  cx={t.x}
                  cy={t.y}
                  r={12}
                  fill="#0B1328"
                  stroke={isMissing ? "#FB7185" : on ? "#7DD3FC" : "#4B5A8A"}
                  strokeWidth={2}
                  strokeDasharray={on ? undefined : "3 3"}
                />
                <circle cx={t.x} cy={t.y} r={4.2} fill={on ? "#BAE6FD" : "#4B5A8A"} />
                <text className="ab-name" x={lp.x} y={lp.y} textAnchor={lp.anchor} fontSize={15} fontWeight={600} fill={on ? "#E8ECF7" : "#9AA6C4"}>
                  {t.name}
                </text>
                <text className="ab-sub" x={lp.x} y={lp.y + 17} textAnchor={lp.anchor} fontSize={12} fill={isMissing ? "#FDA4AF" : "#66769A"}>
                  {isMissing ? "Needed" : on ? t.sub : "Not connected"}
                </text>
              </g>
            );
          })}

          {dot && (
            <g pointerEvents="none">
              <circle cx={dot.x} cy={dot.y} r={14} fill="url(#ab-glow-c)" />
              <circle cx={dot.x} cy={dot.y} r={4} fill="#F0F9FF" />
            </g>
          )}
        </svg>
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-sm">
          <p className="text-faint">Tap a tool to connect or disconnect it.</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAll(true)} disabled={running} className="text-cyan hover:underline underline-offset-4 disabled:opacity-50">
              Connect all
            </button>
            <button type="button" onClick={() => setAll(false)} disabled={running} className="text-muted hover:text-fg disabled:opacity-50">
              Disconnect all
            </button>
          </div>
        </div>
      </div>

      {/* Task and trace */}
      <div className="rounded-2xl border border-line bg-deep/70 p-5 sm:p-6">
        <fieldset>
          <legend className="font-semibold">Give the agent a task</legend>
          <div className="mt-3 flex flex-col gap-1.5">
            {TASKS.map((t) => {
              const sel = taskId === t.id;
              const req = requires(t);
              const ready = req.every((r) => connected.has(r));
              return (
                <label
                  key={t.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 transition-colors ${
                    sel ? "border-violet/60 bg-violet/15 text-fg" : "border-line text-muted hover:border-faint hover:text-fg"
                  } ${running ? "pointer-events-none opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="agent-task"
                    value={t.id}
                    checked={sel}
                    onChange={() => {
                      setTaskId(t.id);
                      setLines([]);
                      setMissing(null);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${sel ? "border-violet bg-violet" : "border-faint"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] leading-snug">{t.label}</span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {req.map((r) => (
                        <span
                          key={r}
                          className={`rounded px-1.5 py-0.5 text-[0.72rem] ${
                            connected.has(r) ? "bg-cyan/15 text-cyan" : "bg-line/70 text-faint"
                          }`}
                        >
                          {TOOLS[r].name}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className={`mt-0.5 shrink-0 text-xs ${ready ? "text-cyan" : "text-faint"}`}>{ready ? "Ready" : "Missing tools"}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={run}
          disabled={running}
          className="signal-bg mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-night hover:brightness-110 disabled:opacity-60"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          {running ? "Running…" : "Run the agent"}
        </button>

        <div className="mt-5 min-h-[4rem] lg:min-h-[12rem] border-t border-line pt-4" aria-live="polite">
          {lines.length === 0 && !thinking && (
            <p className="text-sm text-faint">The agent&apos;s plan, tool calls and answer will show up here.</p>
          )}
          {thinking && <p className="text-sm text-muted">Planning…</p>}
          <ol className="space-y-2.5 text-sm">
            {lines.map((l, i) => (
              <li key={i}>
                {l.kind === "plan" && (
                  <p className="text-muted">
                    <span className="font-medium text-fg">Plan: </span>
                    {l.text}
                  </p>
                )}
                {l.kind === "call" && (
                  <code className="block overflow-x-auto whitespace-nowrap rounded-md bg-night/70 px-3 py-2 font-mono text-[0.78rem] text-cyan">
                    {l.text}
                  </code>
                )}
                {l.kind === "result" && <p className="pl-3 text-muted">{l.text}</p>}
                {l.kind === "missing" && (
                  <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-rose-200">{l.text}</p>
                )}
                {l.kind === "answer" && <p className="rounded-lg border border-violet/40 bg-violet/10 px-3 py-2 text-fg">{l.text}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
