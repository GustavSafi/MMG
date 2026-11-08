"use client";

import { useSyncExternalStore } from "react";

/*
  The kind of system Gustav builds, drawn as a graph: a client calls an
  API layer, the API hands work to an LLM agent with retrieval and tools,
  and it all runs in the cloud, shipped by a CI/CD pipeline.
  Edges draw in once on load, then requests travel along them.
*/

type N = { id: string; x: number; y: number; name: string; sub: string; hue: "c" | "v"; at?: "above" | "right" };

const NODES: N[] = [
  { id: "client", x: 105, y: 95, name: "Client", sub: "Web and mobile apps", hue: "c", at: "above" },
  { id: "api", x: 265, y: 195, name: "API layer", sub: "REST, auth, rate limits", hue: "c", at: "right" },
  { id: "agent", x: 465, y: 115, name: "LLM agent", sub: "Hosted or self-hosted models", hue: "v", at: "above" },
  { id: "rag", x: 500, y: 300, name: "RAG", sub: "Embeddings, vector search", hue: "v" },
  { id: "tools", x: 380, y: 425, name: "Tools", sub: "APIs and functions", hue: "v" },
  { id: "azure", x: 185, y: 395, name: "Cloud", sub: "Containers, serverless, data", hue: "c" },
  { id: "cicd", x: 80, y: 260, name: "CI/CD", sub: "Pipelines, Docker, IaC", hue: "c", at: "above" },
];

const EDGES: [string, string][] = [
  ["client", "api"],
  ["api", "agent"],
  ["agent", "rag"],
  ["agent", "tools"],
  ["api", "azure"],
  ["cicd", "azure"],
  ["tools", "azure"],
];

const PULSES: { path: string[]; dur: number; begin: number; hue: "c" | "v" }[] = [
  { path: ["client", "api", "agent", "rag"], dur: 4.2, begin: 2.0, hue: "c" },
  { path: ["agent", "tools", "azure"], dur: 3.6, begin: 3.4, hue: "v" },
  { path: ["cicd", "azure"], dur: 2.4, begin: 2.6, hue: "c" },
  { path: ["client", "api", "azure"], dur: 3.4, begin: 5.2, hue: "c" },
];

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMotion = () => !window.matchMedia(QUERY).matches;

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const d = (ids: string[]) => ids.map((id, i) => `${i ? "L" : "M"}${byId[id].x} ${byId[id].y}`).join(" ");

export default function SystemGraph({ className = "" }: { className?: string }) {
  const motion = useSyncExternalStore(subscribe, getMotion, () => false);

  return (
    <svg
      viewBox="0 0 600 500"
      className={className}
      role="img"
      aria-labelledby="sg-title sg-desc"
    >
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

      {/* edges */}
      <g fill="none" strokeLinecap="round">
        {EDGES.map(([a, b], i) => (
          <path
            key={`${a}-${b}`}
            d={d([a, b])}
            pathLength={1}
            stroke="url(#sg-edge)"
            strokeOpacity={0.55}
            strokeWidth={1.4}
            className="g-edge"
            style={{ animationDelay: `${0.25 + i * 0.16}s` }}
          />
        ))}
      </g>

      {/* travelling requests */}
      {motion &&
        PULSES.map((p, i) => (
          <g key={i}>
            <circle r={9} fill={`url(#sg-glow-${p.hue})`}>
              <animateMotion path={d(p.path)} dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
            </circle>
            <circle r={2.6} fill={p.hue === "c" ? "#E0F2FE" : "#EDE9FE"}>
              <animateMotion path={d(p.path)} dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

      {/* nodes */}
      {NODES.map((n, i) => (
        <g key={n.id}>
          <g className="g-node" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
            <circle cx={n.x} cy={n.y} r={22} fill={`url(#sg-glow-${n.hue})`} opacity={0.5} />
            <circle cx={n.x} cy={n.y} r={9} fill="#0B1328" stroke={n.hue === "c" ? "#7DD3FC" : "#A78BFA"} strokeWidth={1.6} />
            <circle cx={n.x} cy={n.y} r={3.4} fill={n.hue === "c" ? "#BAE6FD" : "#DDD6FE"} />
          </g>
          <g
            className="g-label"
            style={{ animationDelay: `${0.5 + i * 0.12}s` }}
            textAnchor={n.at === "right" ? "start" : "middle"}
          >
            <text
              x={n.at === "right" ? n.x + 20 : n.x}
              y={n.at === "above" ? n.y - 42 : n.at === "right" ? n.y + 26 : n.y + 34}
              className="sg-name"
              fill="#E8ECF7"
              fontSize={15}
              fontWeight={600}
            >
              {n.name}
            </text>
            <text
              x={n.at === "right" ? n.x + 20 : n.x}
              y={n.at === "above" ? n.y - 24 : n.at === "right" ? n.y + 44 : n.y + 52}
              className="sg-sub"
              fill="#9AA6C4"
              fontSize={12.5}
            >
              {n.sub}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
