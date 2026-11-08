"use client";

import { useEffect, useRef, useState } from "react";
import { Check, GitCommitHorizontal, RotateCcw, X } from "lucide-react";
import { useMotionOk, wait } from "@/lib/anim";

/*
  A deployment simulator. Write a commit, pick a rollout strategy and what
  should go wrong, then watch the pipeline build, test and roll the release
  out to six instances. A live error-rate chart decides whether the release
  stays or is rolled back automatically.
*/

type StageState = "idle" | "running" | "done" | "failed" | "skipped" | "rolledback";
type Strategy = "rolling" | "bluegreen" | "canary";
type Failure = "none" | "test" | "bad";
type Inst = { id: string; ver: "old" | "new"; group: "main" | "blue" | "green"; state: "ready" | "starting" | "draining" };
type Release = { ver: string; msg: string; strategy: string; result: "live" | "rolledback" | "blocked" | "replaced" };

const STAGES = ["Commit", "Build", "Test", "Container", "Deploy", "Verify"];
const STRATEGIES: { id: Strategy; label: string; hint: string }[] = [
  { id: "rolling", label: "Rolling", hint: "Replace instances one at a time." },
  { id: "bluegreen", label: "Blue-green", hint: "Start a full copy, then switch all traffic at once." },
  { id: "canary", label: "Canary", hint: "Send a small share of traffic first, then increase it." },
];
const FAILURES: { id: Failure; label: string }[] = [
  { id: "none", label: "Nothing" },
  { id: "test", label: "A test fails" },
  { id: "bad", label: "Bad release" },
];
const SUGGESTIONS = [
  "Add retry to the payment webhook",
  "Cache embeddings for repeat queries",
  "Validate model output against the schema",
  "Add rate limiting to the public API",
  "Bump .NET runtime image",
];

const BASE = 0.8;
const BAD = 18;
const LIMIT = 5;
const POINTS = 60;
const TICK = 150;

const fmt = (v: number[]) => `v${v.join(".")}`;
const hash = () => Math.random().toString(16).slice(2, 9);
const noise = () => (Math.random() - 0.5) * 0.5;
// Deterministic baseline so the server and browser render the same chart
const flat = () => Array.from({ length: POINTS }, (_, i) => BASE + 0.18 * Math.sin(i * 1.7) + 0.1 * Math.sin(i * 0.6));
const mainInstances = (): Inst[] => Array.from({ length: 6 }, (_, i) => ({ id: `m${i}`, ver: "old", group: "main", state: "ready" }));

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-full border border-line bg-night/50 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${
            value === o.id ? "bg-raised text-fg shadow-[inset_0_0_0_1px_rgba(125,211,252,0.35)]" : "text-muted hover:text-fg"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Pipeline() {
  const motionOk = useMotionOk();
  const [message, setMessage] = useState(SUGGESTIONS[0]);
  const [strategy, setStrategy] = useState<Strategy>("canary");
  const [failure, setFailure] = useState<Failure>("none");
  const [stages, setStages] = useState<StageState[]>(STAGES.map(() => "idle"));
  const [running, setRunning] = useState(false);
  const [prod, setProd] = useState<number[]>([1, 4, 2]);
  const [nextVer, setNextVer] = useState<number[]>([1, 4, 3]);
  const [insts, setInsts] = useState<Inst[]>(mainInstances);
  const [share, setShare] = useState(0);
  const [series, setSeries] = useState<number[]>(flat);
  const [ticking, setTicking] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [history, setHistory] = useState<Release[]>([
    { ver: "v1.4.2", msg: "Add structured logging", strategy: "Rolling", result: "live" },
  ]);

  const runId = useRef(0);
  const shareRef = useRef(0);
  const badRef = useRef(false);
  const errRef = useRef(BASE);
  const suggestion = useRef(1);

  useEffect(() => () => void (runId.current += 1), []);

  // Live error-rate ticker while a release is rolling out
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => {
      const e = Math.max(0.1, BASE + noise() + (badRef.current ? BAD * shareRef.current : 0));
      errRef.current = e;
      setSeries((s) => [...s.slice(1), e]);
    }, TICK);
    return () => clearInterval(id);
  }, [ticking]);

  const setStage = (i: number, s: StageState) => setStages((prev) => prev.map((p, j) => (j === i ? s : p)));
  const add = (line: string) => setLog((l) => [...l, line].slice(-9));
  const traffic = (v: number) => {
    shareRef.current = v;
    setShare(v);
  };

  const push = async () => {
    const id = ++runId.current;
    const cancelled = () => runId.current !== id;
    const step = (ms: number) => wait(motionOk ? ms : 0, cancelled);
    const strat = STRATEGIES.find((s) => s.id === strategy)!.label;
    const oldV = fmt(prod);
    const newV = fmt(nextVer);
    const msg = message.trim() || SUGGESTIONS[0];

    // reset
    setRunning(true);
    setStages(STAGES.map(() => "idle"));
    setLog([]);
    setSeries(flat());
    setInsts(mainInstances());
    traffic(0);
    badRef.current = failure === "bad";
    errRef.current = BASE;

    const record = (result: Release["result"]) =>
      setHistory((h) =>
        [{ ver: newV, msg, strategy: strat, result }, ...h.map((r) => (result === "live" && r.result === "live" ? { ...r, result: "replaced" as const } : r))].slice(0, 5),
      );

    const finish = () => {
      setNextVer((v) => [v[0], v[1], v[2] + 1]);
      setMessage(SUGGESTIONS[suggestion.current++ % SUGGESTIONS.length]);
      setRunning(false);
    };

    // Commit, build, test, container
    setStage(0, "running");
    if (!(await step(400))) return;
    setStage(0, "done");
    add(`Commit ${hash()}: ${msg}`);

    setStage(1, "running");
    if (!(await step(850))) return;
    setStage(1, "done");
    add("Build: compiled and packaged in 38 s");

    setStage(2, "running");
    if (!(await step(950))) return;
    if (failure === "test") {
      setStage(2, "failed");
      [3, 4, 5].forEach((i) => setStage(i, "skipped"));
      add("Test: 2 of 142 failed (OrderTotals_RoundsVatCorrectly)");
      add(`Pipeline stopped. Production stays on ${oldV}`);
      record("blocked");
      finish();
      return;
    }
    setStage(2, "done");
    add("Test: 142 passed, 0 failed");

    setStage(3, "running");
    if (!(await step(700))) return;
    setStage(3, "done");
    add(`Container: image ${newV} pushed to the registry`);

    // Deploy
    setStage(4, "running");
    setTicking(true);
    let over = 0;
    const breached = () => {
      over = errRef.current > LIMIT ? over + 1 : 0;
      return over >= 2;
    };
    const watch = async (ms: number) => {
      const end = performance.now() + (motionOk ? ms : 0);
      while (performance.now() < end) {
        if (!(await wait(TICK, cancelled))) return null;
        if (breached()) return true;
      }
      if (!motionOk && badRef.current && shareRef.current > 0.2) return true;
      return false;
    };

    let failed = false;

    if (strategy === "rolling") {
      add("Deploy: rolling update, one instance at a time");
      for (let i = 0; i < 6 && !failed; i++) {
        setInsts((xs) => xs.map((x, j) => (j === i ? { ...x, state: "starting" } : x)));
        if (!(await step(300))) return;
        setInsts((xs) => xs.map((x, j) => (j === i ? { ...x, ver: "new", state: "ready" } : x)));
        traffic((i + 1) / 6);
        const r = await watch(500);
        if (r === null) return;
        failed = r;
      }
    } else if (strategy === "canary") {
      setInsts((xs) => xs.map((x, j) => (j === 0 ? { ...x, state: "starting" } : x)));
      if (!(await step(350))) return;
      setInsts((xs) => xs.map((x, j) => (j === 0 ? { ...x, ver: "new", state: "ready" } : x)));
      for (const p of [0.1, 0.25, 0.5, 1]) {
        traffic(p);
        add(`Canary: ${Math.round(p * 100)}% of traffic on ${newV}`);
        if (p === 1) setInsts((xs) => xs.map((x) => ({ ...x, ver: "new" })));
        const r = await watch(900);
        if (r === null) return;
        if (r) {
          failed = true;
          break;
        }
      }
    } else {
      setInsts([
        ...Array.from({ length: 3 }, (_, i): Inst => ({ id: `b${i}`, ver: "old", group: "blue", state: "ready" })),
        ...Array.from({ length: 3 }, (_, i): Inst => ({ id: `g${i}`, ver: "new", group: "green", state: "starting" })),
      ]);
      add(`Deploy: starting a green environment with ${newV}`);
      if (!(await step(900))) return;
      setInsts((xs) => xs.map((x) => (x.group === "green" ? { ...x, state: "ready" } : x)));
      add("Deploy: green is up, switching all traffic");
      traffic(1);
      const r = await watch(400);
      if (r === null) return;
      failed = r;
    }

    if (!failed) {
      setStage(4, "done");
      setStage(5, "running");
      const r = await watch(1800);
      if (r === null) return;
      failed = r;
    }

    if (failed) {
      const peak = errRef.current.toFixed(1);
      setStage(4, "rolledback");
      setStage(5, "failed");
      add(`Verify: error rate ${peak}% passed the ${LIMIT}% limit`);
      if (strategy === "bluegreen") {
        traffic(0);
        setInsts((xs) => xs.map((x) => (x.group === "green" ? { ...x, state: "draining" } : x)));
        add("Rollback: traffic switched back to blue");
      } else {
        traffic(0);
        setInsts((xs) => xs.map((x) => ({ ...x, ver: "old", state: "ready" })));
        add("Rollback: every instance back on the old image");
      }
      add(`Production is back on ${oldV}`);
      record("rolledback");
      if (!(await step(1400))) return;
      setTicking(false);
      if (strategy === "bluegreen") setInsts((xs) => xs.filter((x) => x.group !== "green").map((x) => ({ ...x, group: "main" })));
      finish();
      return;
    }

    setStage(5, "done");
    add(`Verify: error rate ${errRef.current.toFixed(1)}%, all instances healthy`);
    if (strategy === "bluegreen") {
      setInsts((xs) => xs.map((x) => (x.group === "blue" ? { ...x, state: "draining" } : x)));
      add("Deploy: blue drained and shut down");
    }
    add(`Done: ${newV} is live`);
    setProd(nextVer);
    record("live");
    setTicking(false);
    if (strategy === "bluegreen") {
      if (!(await step(800))) return;
      setInsts(mainInstances().map((x) => ({ ...x, ver: "new" })));
    }
    // the new version becomes the baseline
    setInsts((xs) => xs.map((x) => ({ ...x, ver: "old" })));
    traffic(0);
    finish();
  };

  /* ---------- chart ---------- */
  const W = 600;
  const H = 160;
  const MAX = 12;
  const yOf = (v: number) => H - 10 - (Math.min(v, MAX) / MAX) * (H - 20);
  const pts = series.map((v, i) => `${(i / (POINTS - 1)) * W},${yOf(v)}`).join(" ");
  const recentMax = Math.max(...series.slice(-12));
  const lineColor = recentMax > LIMIT ? "#FB7185" : "#7DD3FC";
  const currentErr = series[series.length - 1];

  const oldLabel = fmt(prod);
  const newLabel = fmt(nextVer);
  const groups = insts.some((x) => x.group !== "main") ? (["blue", "green"] as const) : (["main"] as const);

  return (
    <div className="rounded-2xl border border-line bg-deep/70 p-5 sm:p-7">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1">
            <span className="sr-only">Commit message</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={60}
              disabled={running}
              placeholder="Write a commit message"
              className="w-full rounded-full border border-line bg-night/60 px-4 py-2.5 text-sm text-fg placeholder:text-faint focus:border-cyan/60 focus:outline-none disabled:opacity-60"
            />
          </label>
          <button
            type="button"
            onClick={push}
            disabled={running}
            className="signal-bg inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-night hover:brightness-110 disabled:opacity-60"
          >
            <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
            {running ? "Running…" : "Push a commit"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-faint">Strategy</span>
            <Segmented label="Rollout strategy" value={strategy} options={STRATEGIES} onChange={setStrategy} disabled={running} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-faint">What goes wrong</span>
            <Segmented label="What goes wrong" value={failure} options={FAILURES} onChange={setFailure} disabled={running} />
          </div>
        </div>
        <p className="text-sm text-muted">{STRATEGIES.find((s) => s.id === strategy)!.hint}</p>
      </div>

      {/* Stages */}
      <ol className="mt-8 grid grid-cols-3 gap-y-8 sm:grid-cols-6">
        {STAGES.map((name, i) => {
          const st = stages[i];
          const prevDone = i > 0 && (stages[i - 1] === "done" || stages[i - 1] === "rolledback");
          return (
            <li key={name} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <span className={`absolute right-1/2 top-[22px] h-0.5 w-full -translate-y-1/2 ${i % 3 === 0 ? "hidden sm:block" : ""}`} aria-hidden="true">
                  <span className="absolute inset-0 mx-6 bg-line" />
                  <span className="absolute inset-y-0 left-6 signal-bg transition-[width] duration-500" style={{ width: prevDone ? "calc(100% - 3rem)" : "0" }} />
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
                          : st === "skipped"
                            ? "border-line text-line"
                            : "border-line text-faint"
                }`}
              >
                {st === "running" && (
                  <span className="absolute inset-[-6px] rounded-full border-2 border-violet/30 border-t-violet motion-safe:animate-spin" aria-hidden="true" />
                )}
                {st === "done" && <Check className="h-5 w-5" aria-hidden="true" />}
                {st === "failed" && <X className="h-5 w-5" aria-hidden="true" />}
                {st === "rolledback" && <RotateCcw className="h-5 w-5" aria-hidden="true" />}
                {(st === "idle" || st === "running" || st === "skipped") && <span className="text-xs font-semibold tabular-nums">{i + 1}</span>}
              </span>
              <span className={`mt-3 text-sm ${st === "idle" || st === "skipped" ? "text-muted" : "text-fg"}`}>{name}</span>
              <span className="sr-only">{st === "idle" ? "waiting" : st === "rolledback" ? "rolled back" : st}</span>
            </li>
          );
        })}
      </ol>

      {/* Production + log */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5">
        <div className="flex flex-col rounded-xl border border-line bg-night/40 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-semibold">Production</h3>
            <p className="text-sm text-muted">
              Live <span className="font-semibold tabular-nums text-fg">{oldLabel}</span>
            </p>
          </div>

          {/* traffic split */}
          <div className="mt-4">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-line">
              <span className="h-full bg-violet/70 transition-[width] duration-500" style={{ width: `${(1 - share) * 100}%` }} />
              <span className="h-full bg-cyan transition-[width] duration-500" style={{ width: `${share * 100}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs tabular-nums">
              <span className="text-violet">
                {oldLabel} {Math.round((1 - share) * 100)}%
              </span>
              <span className="text-cyan">
                {newLabel} {Math.round(share * 100)}%
              </span>
            </div>
          </div>

          {/* instances */}
          <div className="mt-4 space-y-2">
            {groups.map((g) => (
              <div key={g} className="flex items-center gap-2">
                {g !== "main" && <span className="w-11 shrink-0 text-xs capitalize text-faint">{g}</span>}
                <div className={`grid flex-1 gap-1.5 ${g === "main" ? "grid-cols-6" : "grid-cols-3"}`}>
                  {insts
                    .filter((x) => x.group === g)
                    .map((x) => (
                      <span
                        key={x.id}
                        className={`rounded-md border px-1 py-1.5 text-center text-[0.7rem] tabular-nums transition-all duration-300 ${
                          x.ver === "new" ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-violet/40 bg-violet/10 text-violet"
                        } ${x.state === "starting" ? "motion-safe:animate-pulse opacity-70" : ""} ${x.state === "draining" ? "opacity-25" : ""}`}
                      >
                        {x.ver === "new" ? newLabel : oldLabel}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* error rate chart */}
          <div className="mt-5 flex flex-1 flex-col">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-faint">Error rate</span>
              <span className={`tabular-nums ${currentErr > LIMIT ? "text-rose-300" : "text-muted"}`}>{currentErr.toFixed(1)}%</span>
            </div>
            <div className="relative mt-1 flex flex-1 flex-col">
            <span
              className="pointer-events-none absolute right-1 -translate-y-full pb-1 text-[0.7rem] text-rose-300"
              style={{ top: `${(yOf(LIMIT) / H) * 100}%` }}
            >
              Rollback at {LIMIT}%
            </span>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1 min-h-[150px]" preserveAspectRatio="none" role="img" aria-label={`Error rate ${currentErr.toFixed(1)} percent`}>
              <defs>
                <linearGradient id="pl-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={lineColor} stopOpacity="0.28" />
                  <stop offset="1" stopColor={lineColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1={0} x2={W} y1={yOf(LIMIT)} y2={yOf(LIMIT)} stroke="#FB7185" strokeOpacity={0.6} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
              <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#pl-fill)" />
              <polyline points={pts} fill="none" stroke={lineColor} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-line bg-night/40 p-4 sm:p-5">
            <h3 className="font-semibold">Pipeline log</h3>
            <ol className="mt-3 min-h-[3rem] lg:min-h-[12.5rem] text-sm leading-relaxed" aria-live="polite">
              {log.length === 0 ? (
                <li className="text-faint">Write a commit message and push it. Try a bad release with each strategy and compare how many users it reaches before the rollback.</li>
              ) : (
                log.map((l, i) => (
                  <li
                    key={i}
                    className={
                      l.startsWith("Rollback") || l.startsWith("Production is back")
                        ? "text-amber-200"
                        : l.includes("passed the") || l.includes("failed (")
                          ? "text-rose-300"
                          : l.startsWith("Done")
                            ? "text-cyan"
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

          <div className="rounded-xl border border-line bg-night/40 p-4 sm:p-5">
            <h3 className="font-semibold">Releases</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {history.map((r, i) => (
                <li key={`${r.ver}-${i}`} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 tabular-nums text-fg">{r.ver}</span>
                  <span className="min-w-0 flex-1 truncate text-muted">{r.msg}</span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[0.72rem] ${
                      r.result === "live"
                        ? "bg-cyan/15 text-cyan"
                        : r.result === "rolledback"
                          ? "bg-amber-300/15 text-amber-200"
                          : r.result === "blocked"
                            ? "bg-rose-400/15 text-rose-300"
                            : "bg-line text-faint"
                    }`}
                  >
                    {r.result === "live" ? "Live" : r.result === "rolledback" ? "Rolled back" : r.result === "blocked" ? "Blocked by tests" : "Replaced"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
