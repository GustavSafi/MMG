"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  An interactive recreation of the decision engine Gustav built for the
  Hospition.IT hackathon (1st place): a weighted-symptom model that categorises
  ophthalmology cases by clinical priority. Red-flag findings override the
  additive score.
*/

type Symptom = {
  id: string;
  label: string;
  weight: number;
  redFlag?: boolean;
};

const SYMPTOMS: Symptom[] = [
  { id: "chemical", label: "Chemical splash or burn", weight: 55, redFlag: true },
  { id: "sudden", label: "Sudden vision loss", weight: 50, redFlag: true },
  { id: "penetrating", label: "Penetrating eye trauma", weight: 50, redFlag: true },
  { id: "curtain", label: "Curtain or shadow over vision", weight: 34 },
  { id: "pain", label: "Severe eye pain", weight: 30 },
  { id: "flashes", label: "New flashes and floaters", weight: 28 },
  { id: "halos", label: "Halos around lights", weight: 22 },
  { id: "redness", label: "Red, irritated eye", weight: 10 },
  { id: "blur", label: "Gradual blurring", weight: 8 },
  { id: "discharge", label: "Discharge or itching", weight: 6 },
];

type Tier = { key: string; label: string; action: string; color: string };

const TIERS: Record<string, Tier> = {
  emergent: { key: "emergent", label: "Emergent", action: "See immediately and refer to emergency care", color: "#F87171" },
  urgent: { key: "urgent", label: "Urgent", action: "Assess within 24 hours", color: "#FBBF24" },
  semi: { key: "semi", label: "Semi-urgent", action: "Book within one week", color: "#34D399" },
  routine: { key: "routine", label: "Routine", action: "Schedule a standard appointment", color: "#9AA6C4" },
  idle: { key: "idle", label: "No findings yet", action: "Select the findings present to compute a priority", color: "#66769A" },
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] rounded-2xl border border-line bg-deep/80 overflow-hidden">
      {/* Input */}
      <div className="p-5 sm:p-7 xl:border-r border-b xl:border-b-0 border-line">
        <div className="flex items-baseline justify-between mb-4">
          <h4 className="text-sm font-semibold text-fg">Findings</h4>
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
                    className={`grid place-items-center h-4 w-4 shrink-0 rounded border ${
                      on ? "border-violet bg-violet" : "border-faint"
                    }`}
                  >
                    {on && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                        <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="#060A14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[0.92rem] leading-snug">{s.label}</span>
                  {s.redFlag && (
                    <span className="shrink-0 rounded-full bg-red-400/15 px-2 py-0.5 text-[0.68rem] font-medium text-red-300">
                      Red flag
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-sm text-faint">{s.weight}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="mt-4 text-sm text-muted underline-offset-4 hover:text-cyan hover:underline"
        >
          Clear findings
        </button>
      </div>

      {/* Output */}
      <div className="p-5 sm:p-7 flex flex-col" aria-live="polite">
        <h4 className="text-sm font-semibold text-fg mb-5">Priority</h4>

        <div className="mb-7 min-h-[5.5rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={tier.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`font-semibold tracking-tight leading-none ${tier.key === "idle" ? "text-2xl" : "text-4xl sm:text-5xl"}`}
              style={{ color: tier.color }}
            >
              {tier.label}
            </motion.p>
          </AnimatePresence>
          <p className="mt-3 text-sm text-muted">{tier.action}</p>
        </div>

        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">{score}</span>
          <span className="text-sm text-faint">weighted score</span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-line mb-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: tier.color }}
            animate={{ width: `${meter}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <div className="grid grid-cols-4 gap-1 mb-7">
          {TIER_ORDER.map((k) => {
            const t = TIERS[k];
            const isActive = tier.key === k;
            return (
              <span
                key={k}
                className="text-center text-[0.7rem] pt-1.5 border-t-2 transition-colors"
                style={{ borderColor: isActive ? t.color : "#222C52", color: isActive ? t.color : "#66769A" }}
              >
                {t.label}
              </span>
            );
          })}
        </div>

        <div className="mt-auto border-t border-line pt-4">
          <h5 className="text-xs font-medium text-faint mb-2">How the score was reached</h5>
          <div className="text-sm text-muted space-y-1 min-h-[3.5rem]">
            {active.length === 0 ? (
              <p className="text-faint">Nothing selected.</p>
            ) : (
              <>
                {active.map((s) => (
                  <div key={s.id} className="flex justify-between gap-2">
                    <span className="truncate">{s.label}</span>
                    <span className="tabular-nums">+{s.weight}</span>
                  </div>
                ))}
                {hasRedFlag && <p className="text-red-300">A red flag forces Emergent, whatever the score.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
