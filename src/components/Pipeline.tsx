"use client";

import { useEffect, useRef, useState } from "react";
import { Check, GitCommitHorizontal, RotateCcw, X } from "lucide-react";
import { useMotionOk, wait } from "@/lib/anim";

/*
  A CI/CD pipeline you can run. Every stage lights up in turn. Break the
  health check and the pipeline rolls production back to the last good
  version on its own.
*/

type State = "idle" | "running" | "done" | "failed" | "skipped" | "rolledback";

const STAGES = [
  { id: "commit", name: "Commit" },
  { id: "build", name: "Build" },
  { id: "test", name: "Test" },
  { id: "image", name: "Container" },
  { id: "deploy", name: "Deploy" },
  { id: "health", name: "Health check" },
] as const;

const COMMITS = [
  "Add retry to the payment webhook",
  "Tune the triage thresholds",
  "Cache embeddings for repeat queries",
  "Validate model output against the schema",
  "Bump .NET runtime image",
  "Add rate limiting to the public API",
];

const hash = () => Math.random().toString(16).slice(2, 9);
const bump = (v: number[]) => [v[0], v[1], v[2] + 1];
const fmt = (v: number[]) => `v${v.join(".")}`;

export default function Pipeline() {
  const motionOk = useMotionOk();
  const [states, setStates] = useState<State[]>(STAGES.map(() => "idle"));
  const [running, setRunning] = useState(false);
  const [breakHealth, setBreakHealth] = useState(false);
  const [prod, setProd] = useState<number[]>([1, 4, 2]);
  const [healthy, setHealthy] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const commitIdx = useRef(0);
  const runId = useRef(0);

  useEffect(() => () => void (runId.current += 1), []);

  const set = (i: number, s: State) => setStates((prev) => prev.map((p, j) => (j === i ? s : p)));
  const add = (line: string) => setLog((l) => [...l, line].slice(-7));

  const push = async () => {
    const id = ++runId.current;
    const cancelled = () => runId.current !== id;
    const step = (ms: number) => wait(motionOk ? ms : 0, cancelled);
    const previous = prod;
    const next = bump(prod);
    const msg = COMMITS[commitIdx.current++ % COMMITS.length];

    setRunning(true);
    setStates(STAGES.map(() => "idle"));
    setLog([]);

    const stages: { i: number; ms: number; line: string }[] = [
      { i: 0, ms: 450, line: `Commit ${hash()}: ${msg}` },
      { i: 1, ms: 900, line: "Build: compiled in 38 s" },
      { i: 2, ms: 1000, line: "Test: 142 passed, 0 failed" },
      { i: 3, ms: 800, line: "Container: image pushed to the registry" },
      { i: 4, ms: 900, line: `Deploy: ${fmt(next)} rolled out to production` },
    ];

    for (const s of stages) {
      set(s.i, "running");
      if (!(await step(s.ms))) return;
      set(s.i, "done");
      add(s.line);
    }
    setProd(next);

    set(5, "running");
    if (!(await step(1100))) return;
    if (breakHealth) {
      set(5, "failed");
      setHealthy(false);
      add("Health check: error rate 12%, failing");
      if (!(await step(700))) return;
      set(4, "rolledback");
      add(`Rollback: production is back on ${fmt(previous)}`);
      setProd(previous);
      setHealthy(true);
    } else {
      set(5, "done");
      add("Health check: all instances healthy");
    }
    setRunning(false);
  };

  return (
    <div className="rounded-2xl border border-line bg-deep/70 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={push}
            disabled={running}
            className="signal-bg inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-night hover:brightness-110 disabled:opacity-60"
          >
            <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
            {running ? "Running…" : "Push a commit"}
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
              <input
                type="checkbox"
                checked={breakHealth}
                onChange={(e) => setBreakHealth(e.target.checked)}
                disabled={running}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-rose-400/70 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-cyan" />
              <span className="absolute left-0.5 h-4 w-4 rounded-full bg-fg transition-transform peer-checked:translate-x-4" />
            </span>
            Break the health check
          </label>
        </div>
        <p className="text-sm text-muted">
          Production{" "}
          <span className="font-semibold tabular-nums text-fg">{fmt(prod)}</span>
          <span className={`ml-2 inline-block h-2 w-2 rounded-full ${healthy ? "bg-emerald-400" : "bg-rose-400"}`} aria-hidden="true" />
          <span className="sr-only">{healthy ? "healthy" : "unhealthy"}</span>
        </p>
      </div>

      {/* Stages */}
      <ol className="mt-8 grid grid-cols-3 gap-y-8 sm:grid-cols-6">
        {STAGES.map((s, i) => {
          const st = states[i];
          const prevDone = i > 0 && (states[i - 1] === "done" || states[i - 1] === "rolledback");
          return (
            <li key={s.id} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <span
                  className={`absolute right-1/2 top-[22px] h-0.5 w-full -translate-y-1/2 ${i % 3 === 0 ? "hidden sm:block" : ""}`}
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 mx-6 bg-line" />
                  <span
                    className="absolute inset-y-0 left-6 signal-bg transition-[width] duration-500"
                    style={{ width: prevDone ? "calc(100% - 3rem)" : "0" }}
                  />
                </span>
              )}
              <span
                className={`relative z-10 grid h-11 w-11 place-items-center rounded-full border-2 bg-night transition-colors ${
                  st === "done"
                    ? "border-cyan text-cyan"
                    : st === "running"
                      ? "border-violet text-violet"
                      : st === "failed"
                        ? "border-rose-400 text-rose-300"
                        : st === "rolledback"
                          ? "border-amber-300 text-amber-200"
                          : "border-line text-faint"
                }`}
              >
                {st === "running" && (
                  <span className="absolute inset-[-6px] rounded-full border-2 border-violet/30 border-t-violet motion-safe:animate-spin" aria-hidden="true" />
                )}
                {st === "done" && <Check className="h-5 w-5" aria-hidden="true" />}
                {st === "failed" && <X className="h-5 w-5" aria-hidden="true" />}
                {st === "rolledback" && <RotateCcw className="h-5 w-5" aria-hidden="true" />}
                {(st === "idle" || st === "running" || st === "skipped") && (
                  <span className="text-xs font-semibold tabular-nums">{i + 1}</span>
                )}
              </span>
              <span className={`mt-3 text-sm ${st === "idle" ? "text-muted" : "text-fg"}`}>{s.name}</span>
              <span className="sr-only">
                {st === "idle" ? "waiting" : st === "rolledback" ? "rolled back" : st}
              </span>
            </li>
          );
        })}
      </ol>

      <ol className="mt-8 min-h-[3rem] sm:min-h-[10.5rem] border-t border-line pt-4 text-sm leading-relaxed" aria-live="polite">
        {log.length === 0 ? (
          <li className="text-faint">Push a commit to run the pipeline. Turn on the broken health check to see a rollback.</li>
        ) : (
          log.map((l, i) => (
            <li
              key={i}
              className={
                l.startsWith("Rollback")
                  ? "text-amber-200"
                  : l.includes("failing")
                    ? "text-rose-300"
                    : i === log.length - 1
                      ? "text-fg"
                      : "text-muted"
              }
            >
              {l}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
