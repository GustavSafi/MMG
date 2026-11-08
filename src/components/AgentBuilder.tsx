"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { lerp, tween, useMotionOk, wait, type Pt } from "@/lib/anim";

/*
  Build an agent: connect tools to the agent, pick a task and watch it plan
  and call the tools it needs. If a tool is missing, the agent says so.
  Everything is scripted; no model is called.
*/

type ToolId = "search" | "database" | "calendar" | "email";

const AGENT: Pt = { x: 280, y: 210 };

const TOOLS: Record<ToolId, Pt & { name: string; sub: string }> = {
  search: { x: 95, y: 80, name: "Web search", sub: "Finds pages" },
  database: { x: 465, y: 80, name: "Database", sub: "Runs queries" },
  calendar: { x: 95, y: 340, name: "Calendar", sub: "Reads and books" },
  email: { x: 465, y: 340, name: "Email", sub: "Sends messages" },
};

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
    id: "research",
    label: "Summarise what people say about RAG",
    plan: "Search the web, read the top results and summarise them.",
    steps: [{ tool: "search", call: 'search.web({ query: "retrieval-augmented generation", top: 5 })', result: "5 articles read" }],
    answer: "Here is a short summary of the five most relevant articles, with links to each source.",
  },
];

type Line =
  | { kind: "plan"; text: string }
  | { kind: "call"; text: string }
  | { kind: "result"; text: string }
  | { kind: "answer"; text: string }
  | { kind: "missing"; text: string };

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
        if (!(await tween(600, (t) => setDot(lerp(AGENT, tool, t)), cancelled))) return;
        if (!(await wait(250, cancelled))) return;
        if (!(await tween(600, (t) => setDot(lerp(tool, AGENT, t)), cancelled))) return;
      }
      setDot(null);
      setLines((l) => [...l, { kind: "result", text: step.result }]);
      setActive(null);
      if (!(await pause(350))) return;
    }
    setLines((l) => [...l, { kind: "answer", text: task.answer }]);
    setRunning(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
      {/* Graph */}
      <div className="rounded-2xl border border-line bg-deep/70 p-3 sm:p-5">
        <svg viewBox="0 0 560 420" className="w-full select-none" role="group" aria-label="Agent and its tools">
          <defs>
            <linearGradient id="ab-line" gradientUnits="userSpaceOnUse" x1="95" y1="0" x2="465" y2="0">
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

          {(Object.keys(TOOLS) as ToolId[]).map((id) => {
            const t = TOOLS[id];
            const on = connected.has(id);
            return (
              <line
                key={id}
                x1={AGENT.x}
                y1={AGENT.y}
                x2={t.x}
                y2={t.y}
                stroke={on ? "url(#ab-line)" : missing === id ? "#FB7185" : "#3A4775"}
                strokeWidth={on ? (active === id ? 3 : 1.8) : 1.4}
                strokeDasharray={on ? undefined : "5 7"}
                strokeLinecap="round"
                style={{ transition: "stroke-width .25s" }}
              />
            );
          })}

          {/* Agent */}
          <circle cx={AGENT.x} cy={AGENT.y} r={thinking ? 54 : 44} fill="url(#ab-glow-v)" opacity={0.6} style={{ transition: "r .4s" }}>
            {thinking && motionOk && <animate attributeName="opacity" values="0.35;0.8;0.35" dur="0.9s" repeatCount="indefinite" />}
          </circle>
          <circle cx={AGENT.x} cy={AGENT.y} r={17} fill="#0B1328" stroke="#A78BFA" strokeWidth={2.4} />
          <circle cx={AGENT.x} cy={AGENT.y} r={6} fill="#DDD6FE" />
          <text className="ab-name" x={AGENT.x} y={AGENT.y + 44} textAnchor="middle" fontSize={16} fontWeight={600} fill="#E8ECF7">
            Agent
          </text>
          <text className="ab-sub" x={AGENT.x} y={AGENT.y + 62} textAnchor="middle" fontSize={12.5} fill="#9AA6C4">
            {thinking ? "Planning…" : "LLM with a planner"}
          </text>

          {/* Tools */}
          {(Object.keys(TOOLS) as ToolId[]).map((id) => {
            const t = TOOLS[id];
            const on = connected.has(id);
            const isMissing = missing === id;
            const labelY = t.y < AGENT.y ? t.y - 44 : t.y + 34;
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${t.name}: ${on ? "connected" : "not connected"}. Press to ${on ? "disconnect" : "connect"}.`}
                onClick={() => toggle(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(id);
                  }
                }}
                className="cursor-pointer focus:outline-none [&:focus-visible>circle.ring]:stroke-cyan"
              >
                <circle cx={t.x} cy={t.y} r={42} fill="transparent" />
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={active === id ? 36 : 26}
                  fill={isMissing ? "url(#ab-glow-r)" : "url(#ab-glow-c)"}
                  opacity={on || isMissing ? 0.7 : 0.12}
                  style={{ transition: "r .25s, opacity .25s" }}
                >
                  {isMissing && motionOk && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1s" repeatCount="indefinite" />}
                </circle>
                <circle
                  className="ring"
                  cx={t.x}
                  cy={t.y}
                  r={13}
                  fill="#0B1328"
                  stroke={isMissing ? "#FB7185" : on ? "#7DD3FC" : "#4B5A8A"}
                  strokeWidth={2}
                  strokeDasharray={on ? undefined : "3 3"}
                />
                <circle cx={t.x} cy={t.y} r={4.5} fill={on ? "#BAE6FD" : "#4B5A8A"} />
                <text className="ab-name" x={t.x} y={labelY} textAnchor="middle" fontSize={15} fontWeight={600} fill={on ? "#E8ECF7" : "#9AA6C4"}>
                  {t.name}
                </text>
                <text className="ab-sub" x={t.x} y={labelY + 18} textAnchor="middle" fontSize={12.5} fill={isMissing ? "#FDA4AF" : "#66769A"}>
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
        <p className="px-2 pb-1 text-sm text-faint">Tap a tool to connect or disconnect it.</p>
      </div>

      {/* Task and trace */}
      <div className="rounded-2xl border border-line bg-deep/70 p-5 sm:p-6">
        <fieldset>
          <legend className="font-semibold">Give the agent a task</legend>
          <div className="mt-3 flex flex-col gap-2">
            {TASKS.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-[0.95rem] transition-colors ${
                  taskId === t.id ? "border-violet/60 bg-violet/15 text-fg" : "border-line text-muted hover:border-faint hover:text-fg"
                } ${running ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="agent-task"
                  value={t.id}
                  checked={taskId === t.id}
                  onChange={() => {
                    setTaskId(t.id);
                    setLines([]);
                    setMissing(null);
                  }}
                  className="sr-only"
                />
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${taskId === t.id ? "border-violet bg-violet" : "border-faint"}`}
                  aria-hidden="true"
                />
                {t.label}
              </label>
            ))}
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
                {l.kind === "answer" && (
                  <p className="rounded-lg border border-violet/40 bg-violet/10 px-3 py-2 text-fg">{l.text}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
