"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { lerp, tween, useMotionOk, wait, type Pt } from "@/lib/anim";

/*
  The kind of system Gustav builds, drawn as a graph: a client calls an API,
  the API hands work to an LLM agent with retrieval and tools, and it all runs
  in the cloud, shipped by a CI/CD pipeline. "Send a request" follows one
  request through the graph and logs what happens at each hop.
*/

type Id = "client" | "api" | "agent" | "rag" | "tools" | "azure" | "cicd";
type N = { id: Id; x: number; y: number; name: string; sub: string; hue: "c" | "v"; at?: "above" | "right" };

const NODES: N[] = [
  { id: "client", x: 105, y: 95, name: "Client", sub: "Web and mobile apps", hue: "c", at: "above" },
  { id: "api", x: 265, y: 195, name: "APIs", sub: "REST, auth, rate limits", hue: "c", at: "right" },
  { id: "agent", x: 465, y: 115, name: "LLM agent", sub: "Any model, any provider", hue: "v", at: "above" },
  { id: "rag", x: 500, y: 300, name: "RAG", sub: "Embeddings, vector search", hue: "v" },
  { id: "tools", x: 380, y: 425, name: "Tools", sub: "APIs and functions", hue: "v" },
  { id: "azure", x: 185, y: 395, name: "Cloud", sub: "Containers, serverless, data", hue: "c" },
  { id: "cicd", x: 80, y: 260, name: "CI/CD", sub: "DevOps, Docker, IaC", hue: "c", at: "above" },
];

const EDGES: [Id, Id][] = [
  ["client", "api"],
  ["api", "agent"],
  ["agent", "rag"],
  ["agent", "tools"],
  ["api", "azure"],
  ["cicd", "azure"],
  ["tools", "azure"],
];

const AMBIENT: { path: Id[]; dur: number; begin: number; hue: "c" | "v" }[] = [
  { path: ["client", "api", "agent", "rag"], dur: 4.2, begin: 2.0, hue: "c" },
  { path: ["agent", "tools", "azure"], dur: 3.6, begin: 3.4, hue: "v" },
  { path: ["cicd", "azure"], dur: 2.4, begin: 2.6, hue: "c" },
  { path: ["client", "api", "azure"], dur: 3.4, begin: 5.2, hue: "c" },
];

/* One request, hop by hop. `ms` is the simulated time the hop takes. */
const JOURNEY: { to: Id; ms: number; log: string }[] = [
  { to: "api", ms: 18, log: "API: request authenticated, rate limit OK" },
  { to: "agent", ms: 40, log: "Agent: planning how to answer" },
  { to: "rag", ms: 95, log: "RAG: 3 relevant documents retrieved" },
  { to: "agent", ms: 12, log: "Agent: context added to the prompt" },
  { to: "tools", ms: 160, log: "Tool call: get_order_status(order: 4821)" },
  { to: "azure", ms: 120, log: "Cloud: serverless function returned the order" },
  { to: "api", ms: 380, log: "API: model answer validated against the schema" },
  { to: "client", ms: 15, log: "Done: 200 OK" },
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<Id, N>;
const d = (ids: Id[]) => ids.map((id, i) => `${i ? "L" : "M"}${byId[id].x} ${byId[id].y}`).join(" ");
const edgeKey = (a: Id, b: Id) => [a, b].sort().join("-");

type LogLine = { t: number; text: string };

export default function SystemGraph({ className = "" }: { className?: string }) {
  const motionOk = useMotionOk();
  const [running, setRunning] = useState(false);
  const [dot, setDot] = useState<Pt | null>(null);
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [at, setAt] = useState<Id | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const runId = useRef(0);

  useEffect(() => () => void (runId.current += 1), []);

  const send = async () => {
    const id = ++runId.current;
    const cancelled = () => runId.current !== id;
    setRunning(true);
    setLog([]);
    setLit(new Set());
    setAt("client");
    let from: Id = "client";
    let elapsed = 0;
    for (const hop of JOURNEY) {
      const a = byId[from];
      const b = byId[hop.to];
      if (motionOk) {
        const ok = await tween(650, (t) => setDot(lerp(a, b, t)), cancelled);
        if (!ok) return;
      }
      elapsed += hop.ms;
      const key = edgeKey(from, hop.to);
      setLit((s) => new Set(s).add(key));
      setAt(hop.to);
      setLog((l) => [...l, { t: elapsed, text: hop.log }]);
      from = hop.to;
      if (motionOk && !(await wait(180, cancelled))) return;
    }
    setDot(null);
    setRunning(false);
  };

  const showAmbient = motionOk && !running && log.length === 0;

  return (
    <div className={className}>
      <svg viewBox="0 0 600 500" className="w-full" role="img" aria-labelledby="sg-title sg-desc">
        <title id="sg-title">The kind of system I build</title>
        <desc id="sg-desc">
          A client calls an API. The API passes work to an LLM agent that uses retrieval and tools. Everything runs in
          the cloud and is deployed by a CI/CD pipeline.
        </desc>
        <defs>
          <radialGradient id="sg-glow-c">
            <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.85" />
            <stop offset="1" stopColor="#7DD3FC" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sg-glow-v">
            <stop offset="0" stopColor="#A78BFA" stopOpacity="0.85" />
            <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sg-edge" gradientUnits="userSpaceOnUse" x1="80" y1="0" x2="520" y2="0">
            <stop offset="0" stopColor="#7DD3FC" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        <g fill="none" strokeLinecap="round">
          {EDGES.map(([a, b], i) => {
            const on = lit.has(edgeKey(a, b));
            return (
              <path
                key={`${a}-${b}`}
                d={d([a, b])}
                pathLength={1}
                stroke="url(#sg-edge)"
                strokeOpacity={on ? 1 : 0.55}
                strokeWidth={on ? 2.6 : 1.4}
                className="g-edge"
                style={{ animationDelay: `${0.25 + i * 0.16}s`, transition: "stroke-width .3s, stroke-opacity .3s" }}
              />
            );
          })}
        </g>

        {showAmbient &&
          AMBIENT.map((p, i) => (
            <g key={i}>
              <circle r={9} fill={`url(#sg-glow-${p.hue})`}>
                <animateMotion path={d(p.path)} dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
              </circle>
              <circle r={2.6} fill={p.hue === "c" ? "#E0F2FE" : "#EDE9FE"}>
                <animateMotion path={d(p.path)} dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}

        {NODES.map((n, i) => {
          const here = at === n.id;
          return (
            <g key={n.id}>
              <g className="g-node" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={here ? 32 : 22}
                  fill={`url(#sg-glow-${n.hue})`}
                  opacity={here ? 0.8 : 0.5}
                  style={{ transition: "r .3s, opacity .3s" }}
                />
                <circle cx={n.x} cy={n.y} r={9} fill="#0B1328" stroke={n.hue === "c" ? "#7DD3FC" : "#A78BFA"} strokeWidth={here ? 2.4 : 1.6} />
                <circle cx={n.x} cy={n.y} r={3.4} fill={n.hue === "c" ? "#BAE6FD" : "#DDD6FE"} />
              </g>
              <g className="g-label" style={{ animationDelay: `${0.5 + i * 0.12}s` }} textAnchor={n.at === "right" ? "start" : "middle"}>
                <text
                  className="sg-name"
                  x={n.at === "right" ? n.x + 20 : n.x}
                  y={n.at === "above" ? n.y - 42 : n.at === "right" ? n.y + 26 : n.y + 34}
                  fill="#E8ECF7"
                  fontSize={15}
                  fontWeight={600}
                >
                  {n.name}
                </text>
                <text
                  className="sg-sub"
                  x={n.at === "right" ? n.x + 20 : n.x}
                  y={n.at === "above" ? n.y - 24 : n.at === "right" ? n.y + 44 : n.y + 52}
                  fill="#9AA6C4"
                  fontSize={12.5}
                >
                  {n.sub}
                </text>
              </g>
            </g>
          );
        })}

        {dot && (
          <g pointerEvents="none">
            <circle cx={dot.x} cy={dot.y} r={14} fill="url(#sg-glow-c)" />
            <circle cx={dot.x} cy={dot.y} r={4} fill="#F0F9FF" />
          </g>
        )}
      </svg>

      <div className="mt-2 rounded-2xl border border-line bg-night/60 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={send}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-cyan/50 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan hover:bg-cyan/20 disabled:opacity-50 transition-colors"
          >
            {log.length && !running ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Sending…" : log.length ? "Send another" : "Send a request"}
          </button>
          {log.length > 0 && (
            <span className="text-sm tabular-nums text-faint">{log[log.length - 1].t} ms</span>
          )}
        </div>
        <ol className="mt-3 min-h-[2.5rem] lg:h-[11.5rem] lg:min-h-0 overflow-hidden text-[0.82rem] leading-relaxed" aria-live="polite">
          {log.length === 0 ? (
            <li className="text-faint">Follow one request through the system, hop by hop.</li>
          ) : (
            log.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-14 shrink-0 text-right tabular-nums text-faint">+{l.t} ms</span>
                <span className={i === log.length - 1 ? "text-fg" : "text-muted"}>{l.text}</span>
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  );
}
