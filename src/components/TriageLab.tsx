"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXAMPLES, SCALE_MAX, SYMPTOMS, TIERS, TIER_ORDER, evaluate } from "@/lib/triage";

/*
  Interactive version of the hackathon triage engine. Selecting findings
  updates the priority and a four-step trace that explains how the engine
  reached it.
*/

const ZONES = [
  { key: "routine", from: 0, to: 14 },
  { key: "semi", from: 14, to: 30 },
  { key: "urgent", from: 30, to: 50 },
  { key: "emergent", from: 50, to: SCALE_MAX },
] as const;

const pct = (v: number) => `${(Math.min(v, SCALE_MAX) / SCALE_MAX) * 100}%`;

function Step({
  n,
  title,
  state,
  children,
}: {
  n: number;
  title: string;
  state: "idle" | "done" | "flag" | "skipped";
  children: React.ReactNode;
}) {
  const ring =
    state === "done"
      ? "border-cyan text-cyan"
      : state === "flag"
        ? "border-red-400 text-red-300"
        : "border-line text-faint";
  return (
    <li className="relative pl-11 pb-6 last:pb-0">
      <span
        className={`absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full border-2 bg-night text-xs font-semibold transition-colors ${ring}`}
        aria-hidden="true"
      >
        {n}
      </span>
      <h4 className={`font-semibold transition-colors ${state === "idle" || state === "skipped" ? "text-muted" : "text-fg"}`}>
        {title}
      </h4>
      <div className="mt-1.5 text-sm text-muted">{children}</div>
    </li>
  );
}

export default function TriageLab() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { active, score, flags, tier } = useMemo(() => evaluate(selected), [selected]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const loadExample = (findings: string[]) => setSelected(new Set(findings));
  const exampleActive = (findings: string[]) =>
    findings.length === selected.size && findings.every((f) => selected.has(f));

  const hasFindings = active.length > 0;
  const hasFlag = flags.length > 0;

  return (
    <div>
      {/* Examples */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-faint mr-1">Try a case:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.name}
            type="button"
            onClick={() => loadExample(ex.findings)}
            aria-pressed={exampleActive(ex.findings)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              exampleActive(ex.findings)
                ? "border-violet/70 bg-violet/15 text-fg"
                : "border-line text-muted hover:border-faint hover:text-fg"
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-6 items-start">
        {/* Findings */}
        <fieldset className="rounded-2xl border border-line bg-deep/80 p-5 sm:p-6">
          <legend className="sr-only">Findings</legend>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-semibold">Findings</h3>
            <span className="text-xs text-faint">Weight</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {SYMPTOMS.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  aria-pressed={on}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                    on ? "border-violet/60 bg-violet/15 text-fg" : "border-line bg-night/40 text-muted hover:border-faint hover:text-fg"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className={`grid place-items-center h-4 w-4 shrink-0 rounded border ${on ? "border-violet bg-violet" : "border-faint"}`}
                    >
                      {on && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                          <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="#060A14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[0.95rem] leading-snug">{s.label}</span>
                    {s.redFlag && (
                      <span className="shrink-0 rounded-full bg-red-400/15 px-2 py-0.5 text-[0.7rem] font-medium text-red-300">
                        Red flag
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums text-sm text-faint">{s.weight}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Result and trace */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-deep/80 p-5 sm:p-6" aria-live="polite">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-faint">Priority</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tier.key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-2 font-semibold tracking-tight leading-none ${tier.key === "idle" ? "text-2xl" : "text-4xl sm:text-5xl"}`}
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-3 text-sm text-muted">{tier.action}</p>
              </div>
              <div className="text-right shrink-0">
                <h3 className="text-sm font-medium text-faint">Score</h3>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">{score}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-1">
              {TIER_ORDER.map((k) => {
                const t = TIERS[k];
                const on = tier.key === k;
                return (
                  <span
                    key={k}
                    className="rounded-md py-1.5 text-center text-[0.72rem] transition-colors"
                    style={{ background: on ? `${t.color}26` : "#111A36", color: on ? t.color : "#66769A" }}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-deep/80 p-5 sm:p-6">
            <h3 className="font-semibold mb-5">How the engine got there</h3>
            <ol className="relative">
              <span className="absolute left-[13px] top-7 bottom-7 w-px bg-line" aria-hidden="true" />
              <Step n={1} title="Pick the findings" state={hasFindings ? "done" : "idle"}>
                {hasFindings ? `${active.length} selected.` : "Select what the patient reports, or try a case."}
              </Step>
              <Step n={2} title="Add up the weights" state={hasFindings ? "done" : "idle"}>
                {hasFindings ? (
                  <p className="tabular-nums">
                    {active.map((s) => s.weight).join(" + ")} = <span className="font-semibold text-fg">{score}</span>
                  </p>
                ) : (
                  "Every finding has a weight. Mild findings add up, so several of them together can still be urgent."
                )}
              </Step>
              <Step n={3} title="Check for red flags" state={hasFlag ? "flag" : hasFindings ? "done" : "idle"}>
                {hasFlag
                  ? `${flags.map((f) => f.label).join(" and ")} ${flags.length > 1 ? "are red flags" : "is a red flag"}, so the case is Emergent whatever the score.`
                  : hasFindings
                    ? "None found, so the score decides."
                    : "Some findings are serious enough on their own. They override the score so they can never be outweighed."}
              </Step>
              <Step n={4} title="Place the score on the scale" state={hasFlag ? "skipped" : hasFindings ? "done" : "idle"}>
                <p className="mb-3">
                  {hasFlag
                    ? "Skipped. The red flag already decided the priority."
                    : hasFindings
                      ? `${score} lands in ${tier.label}.`
                      : "Thresholds at 14, 30 and 50 split the score into four priorities."}
                </p>
                <div className="relative pt-1">
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    {ZONES.map((z) => {
                      const t = TIERS[z.key];
                      const on = tier.key === z.key;
                      return (
                        <span
                          key={z.key}
                          className="h-full transition-opacity"
                          style={{
                            width: `${((z.to - z.from) / SCALE_MAX) * 100}%`,
                            background: t.color,
                            opacity: on ? 0.95 : 0.22,
                          }}
                        />
                      );
                    })}
                  </div>
                  {hasFindings && !hasFlag && (
                    <motion.span
                      className="absolute top-0 -ml-[7px] h-[18px] w-[14px] rounded-sm border-2 border-fg bg-night"
                      initial={false}
                      animate={{ left: pct(score) }}
                      transition={{ type: "spring", stiffness: 160, damping: 22 }}
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative mt-2 h-4 text-[0.7rem] text-faint tabular-nums">
                    {[14, 30, 50].map((v) => (
                      <span key={v} className="absolute -translate-x-1/2" style={{ left: pct(v) }}>
                        {v}
                      </span>
                    ))}
                    <span className="absolute right-0">{SCALE_MAX}+</span>
                  </div>
                </div>
              </Step>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
