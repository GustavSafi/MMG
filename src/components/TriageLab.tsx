"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useMotionOk, type Pt } from "@/lib/anim";
import {
  EXAMPLES,
  SCALE_MAX,
  SYMPTOMS,
  TIERS,
  TIER_RANGE,
  TIER_RANK,
  evaluate,
  type Tier,
  type TierKey,
} from "@/lib/triage";

/*
  The triage engine as a node graph. Findings send a signal into the score
  node, the score picks one of four priority nodes, and red flags take their
  own route straight to Emergent. Cases can be added to a clinic queue that
  keeps itself sorted by priority.
*/

type Curve = [Pt, Pt, Pt, Pt];
type Band = Exclude<TierKey, "idle">;

const bez = ([a, b, c, d]: Curve, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};
const path = ([a, b, c, d]: Curve) => `M${a.x} ${a.y}C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`;

/* ---------- desktop geometry (viewBox 1000 x 600) ---------- */
const ROW_Y = (i: number) => 70 + i * 51;
const NODE_X = 330;
const G = { x: 590, y: 300, r: 92 };
const TIER_X = 860;
const TIER_Y: Record<Band, number> = { emergent: 150, urgent: 250, semi: 350, routine: 450 };
const BANDS: Band[] = ["emergent", "urgent", "semi", "routine"];

const toScore = (y: number): Curve => [
  { x: NODE_X + 12, y },
  { x: 420, y },
  { x: 430, y: G.y },
  { x: G.x - G.r - 14, y: G.y },
];
const bypass = (y: number): Curve => [
  { x: NODE_X + 12, y },
  { x: 520, y: y - 50 },
  { x: 720, y: 90 },
  { x: TIER_X - 12, y: TIER_Y.emergent },
];
const toTier = (k: Band, gx = G.x, gy = G.y, gr = G.r, tx = TIER_X, ty = TIER_Y[k]): Curve => [
  { x: gx + gr + 14, y: gy },
  { x: gx + gr + 80, y: gy },
  { x: tx - 80, y: ty },
  { x: tx - 12, y: ty },
];

/* ---------- gauge ---------- */
const ZONES: { k: Band; from: number; to: number }[] = [
  { k: "routine", from: 0, to: 14 },
  { k: "semi", from: 14, to: 30 },
  { k: "urgent", from: 30, to: 50 },
  { k: "emergent", from: 50, to: SCALE_MAX },
];
const angle = (v: number) => ((135 + (270 * Math.min(v, SCALE_MAX)) / SCALE_MAX) * Math.PI) / 180;
function arc(cx: number, cy: number, r: number, v0: number, v1: number) {
  const a0 = angle(v0);
  const a1 = angle(v1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
}

function Gauge({ cx, cy, r, score, tier, flag }: { cx: number; cy: number; r: number; score: number; tier: Tier; flag: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 26} fill="url(#tl-halo)" opacity={score > 0 ? 0.9 : 0.4} />
      <circle cx={cx} cy={cy} r={r - 16} fill="#0B1328" stroke="#222C52" />
      {ZONES.map((z) => (
        <path
          key={z.k}
          d={arc(cx, cy, r, z.from + 0.6, z.to - 0.6)}
          stroke={TIERS[z.k].color}
          strokeOpacity={tier.key === z.k ? 0.45 : 0.16}
          strokeWidth={12}
          fill="none"
        />
      ))}
      {score > 0 && (
        <motion.path
          d={arc(cx, cy, r, 0, Math.max(score, 0.5))}
          stroke={tier.color}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
          initial={false}
          animate={{ d: arc(cx, cy, r, 0, Math.max(score, 0.5)) }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      )}
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={r * 0.5} fontWeight={600} fill="#E8ECF7" style={{ fontVariantNumeric: "tabular-nums" }}>
        {score}
      </text>
      <text x={cx} y={cy + r * 0.42} textAnchor="middle" fontSize={13} fill={flag ? "#FDA4AF" : "#66769A"}>
        {flag ? "red flag override" : "score"}
      </text>
    </g>
  );
}

function TierNode({ k, x, y, active, compact }: { k: Band; x: number; y: number; active: boolean; compact?: boolean }) {
  const t = TIERS[k];
  return (
    <g>
      <circle cx={x} cy={y} r={active ? 30 : 0} fill={t.color} opacity={0.18} style={{ transition: "r .35s" }} />
      <circle cx={x} cy={y} r={12} fill="#0B1328" stroke={t.color} strokeOpacity={active ? 1 : 0.4} strokeWidth={active ? 2.6 : 1.6} />
      <circle cx={x} cy={y} r={4.5} fill={t.color} opacity={active ? 1 : 0.35} />
      <text x={x + 24} y={y - (compact ? 1 : 2)} fontSize={compact ? 15 : 16} fontWeight={600} fill={active ? t.color : "#9AA6C4"}>
        {t.label}
      </text>
      <text x={x + 24} y={y + 16} fontSize={12.5} fill="#66769A">
        {TIER_RANGE[k]}
      </text>
    </g>
  );
}

/* ---------- pulses ---------- */
type Pulse = { key: number; curve: Curve; color: string; t0: number; dur: number };

function usePulses(enabled: boolean) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [now, setNow] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    if (!pulses.length) return;
    let raf = 0;
    const frame = (t: number) => {
      setNow(t);
      setPulses((ps) => {
        const left = ps.filter((p) => t < p.t0 + p.dur);
        return left.length === ps.length ? ps : left;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pulses.length]);

  const fire = (curve: Curve, color: string, delay = 0, dur = 650) => {
    if (!enabled) return;
    const t0 = performance.now() + delay;
    setPulses((ps) => [...ps, { key: ++seq.current, curve, color, t0, dur }]);
  };

  const dots = pulses
    .filter((p) => now >= p.t0)
    .map((p) => {
      const t = Math.min(1, (now - p.t0) / p.dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return { key: p.key, color: p.color, ...bez(p.curve, e) };
    });

  return { fire, dots };
}

/* ---------- queue ---------- */
type Patient = { id: number; name: string; findings: string[]; score: number; tier: Tier };

export default function TriageLab() {
  const motionOk = useMotionOk();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { active, score, flags, tier } = useMemo(() => evaluate(selected), [selected]);
  const { fire, dots } = usePulses(motionOk);
  const [queue, setQueue] = useState<Patient[]>([]);
  const [fresh, setFresh] = useState<number | null>(null);
  const nextId = useRef(1);

  const hasFindings = active.length > 0;
  const hasFlag = flags.length > 0;
  const activeBand = tier.key === "idle" ? null : (tier.key as Band);

  const signal = (next: Set<string>, changed?: string) => {
    const res = evaluate(next);
    if (changed && next.has(changed)) {
      const i = SYMPTOMS.findIndex((s) => s.id === changed);
      const s = SYMPTOMS[i];
      if (s.redFlag) fire(bypass(ROW_Y(i)), "#FB7185", 0, 800);
      else fire(toScore(ROW_Y(i)), "#7DD3FC");
    }
    if (res.tier.key !== "idle" && !res.flags.length) {
      fire(toTier(res.tier.key as Band), res.tier.color, changed ? 600 : 0);
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    signal(next, id);
  };

  const loadExample = (findings: string[]) => {
    const next = new Set(findings);
    setSelected(next);
    findings.forEach((f, n) => {
      const i = SYMPTOMS.findIndex((s) => s.id === f);
      const s = SYMPTOMS[i];
      if (s.redFlag) fire(bypass(ROW_Y(i)), "#FB7185", n * 120, 800);
      else fire(toScore(ROW_Y(i)), "#7DD3FC", n * 120);
    });
    const res = evaluate(next);
    if (!res.flags.length && res.tier.key !== "idle") fire(toTier(res.tier.key as Band), res.tier.color, 700);
  };

  const exampleActive = (findings: string[]) => findings.length === selected.size && findings.every((f) => selected.has(f));

  const addPatient = (findings: Set<string>) => {
    const res = evaluate(findings);
    if (!res.active.length) return;
    const id = nextId.current++;
    setQueue((q) =>
      [...q, { id, name: `Patient ${id}`, findings: res.active.map((s) => s.label), score: res.score, tier: res.tier }]
        .sort((a, b) => TIER_RANK[b.tier.key] - TIER_RANK[a.tier.key] || b.score - a.score || a.id - b.id)
        .slice(0, 8),
    );
    setFresh(id);
  };

  const addExamples = () => EXAMPLES.forEach((ex) => addPatient(new Set(ex.findings)));

  const summary = !hasFindings
    ? "Select findings in the graph, or try one of the cases above."
    : hasFlag
      ? `${flags.map((f) => f.label).join(" and ")} ${flags.length > 1 ? "are red flags" : "is a red flag"}, so the case goes straight to Emergent.`
      : `${active.map((s) => s.weight).join(" + ")} = ${score}, which lands in ${tier.label}.`;

  return (
    <div>
      {/* Cases */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-faint mr-1">Try a case:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.name}
            type="button"
            onClick={() => loadExample(ex.findings)}
            aria-pressed={exampleActive(ex.findings)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              exampleActive(ex.findings) ? "border-violet/70 bg-violet/15 text-fg" : "border-line text-muted hover:border-faint hover:text-fg"
            }`}
          >
            {ex.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          disabled={!hasFindings}
          className="ml-auto text-sm text-muted underline-offset-4 hover:text-cyan hover:underline disabled:opacity-40 disabled:no-underline disabled:hover:text-muted"
        >
          Clear
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-deep/70 overflow-hidden">
        {/* Desktop: full graph */}
        <svg viewBox="0 0 1000 600" className="hidden lg:block w-full select-none" role="group" aria-label="Triage engine graph">
          <defs>
            <radialGradient id="tl-halo">
              <stop offset="0.6" stopColor="#4C3DB4" stopOpacity="0.35" />
              <stop offset="1" stopColor="#4C3DB4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="tl-dot-c">
              <stop offset="0" stopColor="#7DD3FC" stopOpacity="0.9" />
              <stop offset="1" stopColor="#7DD3FC" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* column labels */}
          <text x={40} y={34} fontSize={13} fill="#66769A">Findings and weights</text>
          <text x={G.x} y={34} fontSize={13} fill="#66769A" textAnchor="middle">Score</text>
          <text x={TIER_X} y={34} fontSize={13} fill="#66769A">Priority</text>

          {/* finding edges */}
          {SYMPTOMS.map((s, i) => {
            const on = selected.has(s.id);
            const c = s.redFlag ? bypass(ROW_Y(i)) : toScore(ROW_Y(i));
            return (
              <path
                key={s.id}
                d={path(c)}
                fill="none"
                stroke={s.redFlag ? "#FB7185" : "#7DD3FC"}
                strokeOpacity={on ? 0.9 : s.redFlag ? 0.12 : 0.1}
                strokeWidth={on ? 2.2 : 1.2}
                strokeDasharray={s.redFlag && !on ? "4 6" : undefined}
                style={{ transition: "stroke-opacity .3s, stroke-width .3s" }}
              />
            );
          })}

          {/* score to tier edges */}
          {BANDS.map((k) => {
            const on = activeBand === k && !hasFlag;
            return (
              <path
                key={k}
                d={path(toTier(k))}
                fill="none"
                stroke={TIERS[k].color}
                strokeOpacity={on ? 0.9 : 0.12}
                strokeWidth={on ? 2.4 : 1.2}
                style={{ transition: "stroke-opacity .3s, stroke-width .3s" }}
              />
            );
          })}

          <Gauge cx={G.x} cy={G.y} r={G.r} score={score} tier={tier} flag={hasFlag} />

          {BANDS.map((k) => (
            <TierNode key={k} k={k} x={TIER_X} y={TIER_Y[k]} active={activeBand === k} />
          ))}

          {/* finding rows (buttons) */}
          {SYMPTOMS.map((s, i) => {
            const on = selected.has(s.id);
            const y = ROW_Y(i);
            const col = s.redFlag ? "#FB7185" : "#7DD3FC";
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${s.label}, weight ${s.weight}${s.redFlag ? ", red flag" : ""}`}
                onClick={() => toggle(s.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(s.id);
                  }
                }}
                className="cursor-pointer focus:outline-none [&:focus-visible>rect]:stroke-cyan [&:hover>rect]:fill-[#111A36]"
              >
                <rect x={24} y={y - 21} width={330} height={42} rx={10} fill={on ? "#151E40" : "transparent"} stroke={on ? `${col}66` : "transparent"} />
                <text x={44} y={y + 5} fontSize={13} fill={on ? col : "#66769A"} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {s.weight}
                </text>
                <text x={78} y={y + 5} fontSize={15} fill={on ? "#E8ECF7" : "#9AA6C4"}>
                  {s.label}
                </text>
                <circle cx={NODE_X} cy={y} r={on ? 20 : 0} fill={col} opacity={0.18} style={{ transition: "r .3s" }} />
                <circle cx={NODE_X} cy={y} r={9} fill="#0B1328" stroke={col} strokeOpacity={on ? 1 : 0.45} strokeWidth={on ? 2.4 : 1.5} />
                <circle cx={NODE_X} cy={y} r={3.5} fill={col} opacity={on ? 1 : 0.3} />
              </g>
            );
          })}

          {dots.map((p) => (
            <g key={p.key} pointerEvents="none">
              <circle cx={p.x} cy={p.y} r={13} fill={p.color} opacity={0.25} />
              <circle cx={p.x} cy={p.y} r={4} fill="#F8FAFC" />
            </g>
          ))}

          {/* legend */}
          <g fontSize={12.5} fill="#66769A">
            <circle cx={44} cy={578} r={4} fill="#FB7185" />
            <text x={56} y={582}>Red flag: skips the score and goes straight to Emergent</text>
          </g>
        </svg>

        {/* Mobile and tablet: list of findings + compact graph */}
        <div className="lg:hidden p-4 sm:p-6">
          <h3 className="font-semibold mb-3">Findings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SYMPTOMS.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  aria-pressed={on}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-[0.95rem] transition-colors ${
                    on
                      ? s.redFlag
                        ? "border-rose-400/60 bg-rose-400/10 text-fg"
                        : "border-cyan/50 bg-cyan/10 text-fg"
                      : "border-line text-muted"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.redFlag ? "bg-rose-400" : "bg-cyan"} ${on ? "" : "opacity-40"}`} />
                    <span className="leading-snug">{s.label}</span>
                  </span>
                  <span className="tabular-nums text-sm text-faint">{s.weight}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs text-faint">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Red flag: goes straight to Emergent
          </p>

          <svg viewBox="0 0 520 330" className="mt-4 w-full" role="img" aria-label={`Score ${score}, priority ${tier.label}`}>
            <defs>
              <radialGradient id="tl-halo-m">
                <stop offset="0.6" stopColor="#4C3DB4" stopOpacity="0.35" />
                <stop offset="1" stopColor="#4C3DB4" stopOpacity="0" />
              </radialGradient>
            </defs>
            {hasFlag && (
              <path d="M10 18C120 0 260 10 358 50" fill="none" stroke="#FB7185" strokeWidth={2.2} strokeOpacity={0.9} />
            )}
            {BANDS.map((k, i) => {
              const on = activeBand === k && !hasFlag;
              return (
                <path
                  key={k}
                  d={path(toTier(k, 140, 175, 84, 370, 55 + i * 75))}
                  fill="none"
                  stroke={TIERS[k].color}
                  strokeOpacity={on ? 0.9 : 0.12}
                  strokeWidth={on ? 2.4 : 1.2}
                />
              );
            })}
            <g>
              <circle cx={140} cy={175} r={110} fill="url(#tl-halo-m)" />
            </g>
            <Gauge cx={140} cy={175} r={84} score={score} tier={tier} flag={hasFlag} />
            {BANDS.map((k, i) => (
              <TierNode key={k} k={k} x={370} y={55 + i * 75} active={activeBand === k} compact />
            ))}
          </svg>
        </div>

        {/* Summary strip */}
        <div className="border-t border-line px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" aria-live="polite">
          <div className="min-w-0">
            <p className="text-sm text-muted">{summary}</p>
            {hasFindings && (
              <p className="mt-1 font-semibold" style={{ color: tier.color }}>
                {tier.label}: <span className="font-normal text-fg">{tier.action}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => addPatient(selected)}
            disabled={!hasFindings}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-cyan/60 hover:text-cyan disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to the queue
          </button>
        </div>
      </div>

      {/* Queue */}
      <div className="mt-6 rounded-2xl border border-line bg-deep/70 p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Clinic queue</h3>
            <p className="mt-1 text-sm text-muted">Every patient you add is placed by priority, then by score.</p>
          </div>
          <div className="flex gap-4 text-sm">
            <button type="button" onClick={addExamples} className="text-cyan hover:underline underline-offset-4">
              Add the example cases
            </button>
            {queue.length > 0 && (
              <button type="button" onClick={() => setQueue([])} className="text-muted hover:text-fg">
                Empty the queue
              </button>
            )}
          </div>
        </div>

        <ol className="mt-5 space-y-2" aria-live="polite">
          {queue.length === 0 && (
            <li className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-faint">
              The queue is empty. Build a case above and press Add to the queue.
            </li>
          )}
          <AnimatePresence initial={false}>
            {queue.map((p, i) => (
              <motion.li
                key={p.id}
                layout={motionOk}
                initial={motionOk ? { opacity: 0, x: -12 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={motionOk ? { opacity: 0, x: 12 } : { opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                onAnimationComplete={() => fresh === p.id && setFresh(null)}
                className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${fresh === p.id ? "border-cyan/50 bg-raised" : "border-line bg-night/40"}`}
              >
                <span className="w-5 text-right text-sm tabular-nums text-faint">{i + 1}</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.tier.color }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {p.name}
                    <span className="ml-2 text-sm font-normal" style={{ color: p.tier.color }}>
                      {p.tier.label}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted">{p.findings.join(", ")}</p>
                </div>
                <span className="text-sm tabular-nums text-faint">{p.score}</span>
                <button
                  type="button"
                  onClick={() => setQueue((q) => q.filter((x) => x.id !== p.id))}
                  aria-label={`Remove ${p.name}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-raised hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}
