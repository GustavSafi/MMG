"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  A faithful, interactive recreation of the decision engine Gustav built for the
  Hospition.IT hackathon (1st place): a weighted-symptom model that categorises
  ophthalmology cases by clinical priority. Red-flag findings override the
  additive score, exactly the kind of logic modelling the prototype demonstrated.
*/

type Symptom = {
  id: string;
  label: string;
  weight: number;
  redFlag?: boolean;
};

const SYMPTOMS: Symptom[] = [
  { id: "chemical", label: "Chemical splash / burn", weight: 55, redFlag: true },
  { id: "sudden", label: "Sudden vision loss", weight: 50, redFlag: true },
  { id: "penetrating", label: "Penetrating eye trauma", weight: 50, redFlag: true },
  { id: "curtain", label: "Curtain / shadow over vision", weight: 34 },
  { id: "pain", label: "Severe eye pain", weight: 30 },
  { id: "flashes", label: "New flashes & floaters", weight: 28 },
  { id: "halos", label: "Halos around lights", weight: 22 },
  { id: "redness", label: "Red, irritated eye", weight: 10 },
  { id: "blur", label: "Gradual blurring", weight: 8 },
  { id: "discharge", label: "Discharge / itching", weight: 6 },
];

type Tier = {
  key: string;
  label: string;
  action: string;
  color: string;
};

const TIERS: Record<string, Tier> = {
  emergent: { key: "emergent", label: "EMERGENT", action: "See immediately and refer to emergency care", color: "var(--color-accent)" },
  urgent: { key: "urgent", label: "URGENT", action: "Assess within 24 hours", color: "var(--color-amber)" },
  semi: { key: "semi", label: "SEMI-URGENT", action: "Book within one week", color: "var(--color-emerald)" },
  routine: { key: "routine", label: "ROUTINE", action: "Schedule a standard appointment", color: "rgba(22,21,15,0.55)" },
  idle: { key: "idle", label: "AWAITING INPUT", action: "Select the findings present to compute priority", color: "rgba(22,21,15,0.35)" },
};

function classify(score: number, hasRedFlag: boolean): Tier {
  if (hasRedFlag || score >= 50) return TIERS.emergent;
  if (score >= 30) return TIERS.urgent;
  if (score >= 14) return TIERS.semi;
  if (score > 0) return TIERS.routine;
  return TIERS.idle;
}

const TIER_ORDER = ["routine", "semi", "urgent", "emergent"];

export default function TriageEngine() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const { score, hasRedFlag, tier, active } = useMemo(() => {
    const active = SYMPTOMS.filter((s) => selected.has(s.id));
    const score = active.reduce((sum, s) => sum + s.weight, 0);
    const hasRedFlag = active.some((s) => s.redFlag);
    return { score, hasRedFlag, tier: classify(score, hasRedFlag), active };
  }, [selected]);

  const meter = Math.min(100, Math.round((score / 90) * 100));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] border border-ink">
      {/* ---- INPUT: symptom matrix ---- */}
      <div className="p-6 sm:p-8 xl:border-r border-ink border-b xl:border-b-0">
        <div className="flex items-baseline justify-between mb-6">
          <span className="kicker text-ink/60">Findings</span>
          <span className="font-mono text-[0.68rem] text-ink/45">weight →</span>
        </div>

        <div className="grid grid-cols-1 gap-px bg-ink/15 border border-ink/15">
          {SYMPTOMS.map((s) => {
            const on = selected.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                className={`group flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                  on ? "bg-ink text-paper" : "bg-paper hover:bg-paper-dim text-ink"
                }`}
              >
                <span className="flex items-start gap-3 min-w-0">
                  <span
                    className={`grid place-items-center h-4 w-4 mt-0.5 shrink-0 border ${
                      on ? "border-paper" : "border-ink/40"
                    }`}
                  >
                    {on && <span className="h-2 w-2 bg-accent" />}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                  <span className="font-sans text-[0.92rem] leading-snug">{s.label}</span>
                  {s.redFlag && (
                    <span
                      className={`kicker text-[0.5rem] tracking-[0.2em] px-1.5 py-0.5 border whitespace-nowrap ${
                        on ? "border-paper/50 text-paper" : "border-accent text-accent"
                      }`}
                    >
                      RED FLAG
                    </span>
                  )}
                  </span>
                </span>
                <span
                  className={`font-mono text-sm tabular-nums shrink-0 ${
                    on ? "text-paper" : "text-ink/45"
                  }`}
                >
                  {String(s.weight).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelected(new Set())}
          className="mt-5 kicker text-ink/45 hover:text-accent transition-colors"
        >
          ↺ Reset case
        </button>
      </div>

      {/* ---- OUTPUT: computed priority ---- */}
      <div className="p-6 sm:p-8 flex flex-col bg-paper-dim">
        <div className="flex items-baseline justify-between mb-6">
          <span className="kicker text-ink/60">Computed priority</span>
          <span className="font-mono text-[0.68rem] text-ink/45">engine v1</span>
        </div>

        {/* Big verdict */}
        <div className="mb-8">
          <div className="flex items-end gap-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={tier.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="font-display text-4xl sm:text-5xl leading-none"
                style={{ color: tier.color }}
              >
                {tier.label}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-3 font-mono text-sm text-ink/70">{tier.action}</p>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-3 mb-3">
          <motion.span
            key={score}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="font-display text-6xl tabular-nums"
          >
            {String(score).padStart(2, "0")}
          </motion.span>
          <span className="font-mono text-xs text-ink/50 uppercase tracking-widest">
            weighted score
          </span>
        </div>

        {/* Meter */}
        <div className="h-2 w-full bg-ink/10 mb-2 overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: tier.color }}
            animate={{ width: `${meter}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {/* Tier scale */}
        <div className="grid grid-cols-4 gap-px mb-8">
          {TIER_ORDER.map((k) => {
            const t = TIERS[k];
            const isActive = tier.key === k;
            return (
              <div
                key={k}
                className="text-center py-1 border-t-2 transition-colors"
                style={{
                  borderColor: isActive ? t.color : "var(--hair)",
                }}
              >
                <span
                  className="font-mono text-[0.55rem] tracking-[0.15em] uppercase"
                  style={{ color: isActive ? t.color : "rgba(22,21,15,0.4)" }}
                >
                  {t.label.split("-")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Logic trace */}
        <div className="mt-auto border-t border-ink/15 pt-4">
          <span className="kicker text-ink/45 block mb-2">Logic trace</span>
          <div className="font-mono text-xs text-ink/70 space-y-1 min-h-[3.5rem]">
            {active.length === 0 ? (
              <span className="text-ink/40">// no findings selected</span>
            ) : (
              <>
                {active.map((s) => (
                  <div key={s.id} className="flex justify-between">
                    <span className="truncate">
                      {s.redFlag ? "⚑ " : "+ "}
                      {s.label}
                    </span>
                    <span className="tabular-nums pl-2">+{s.weight}</span>
                  </div>
                ))}
                {hasRedFlag && (
                  <div className="text-accent">
                    ⚑ red-flag override → force EMERGENT
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
