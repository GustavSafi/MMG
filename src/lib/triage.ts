/*
  The decision model from the Hospition.IT hackathon (1st place): weighted
  symptom scores that sort ophthalmology cases by clinical priority, where a
  red-flag finding overrides the additive score.
*/

export type Symptom = { id: string; label: string; weight: number; redFlag?: boolean };

export const SYMPTOMS: Symptom[] = [
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

export type TierKey = "idle" | "routine" | "semi" | "urgent" | "emergent";
export type Tier = { key: TierKey; label: string; action: string; color: string; min: number };

export const TIERS: Record<TierKey, Tier> = {
  emergent: { key: "emergent", label: "Emergent", action: "See immediately and refer to emergency care", color: "#FB7185", min: 50 },
  urgent: { key: "urgent", label: "Urgent", action: "Assess within 24 hours", color: "#A78BFA", min: 30 },
  semi: { key: "semi", label: "Semi-urgent", action: "Book within one week", color: "#7DD3FC", min: 14 },
  routine: { key: "routine", label: "Routine", action: "Schedule a standard appointment", color: "#94A3B8", min: 1 },
  idle: { key: "idle", label: "No findings yet", action: "Select the findings present to compute a priority", color: "#66769A", min: 0 },
};

export const TIER_ORDER: TierKey[] = ["routine", "semi", "urgent", "emergent"];
export const TIER_RANK: Record<TierKey, number> = { idle: 0, routine: 1, semi: 2, urgent: 3, emergent: 4 };
export const TIER_RANGE: Record<Exclude<TierKey, "idle">, string> = { routine: "1–13", semi: "14–29", urgent: "30–49", emergent: "50+" };
export const SCALE_MAX = 90;

export function evaluate(selected: Set<string>) {
  const active = SYMPTOMS.filter((s) => selected.has(s.id));
  const score = active.reduce((sum, s) => sum + s.weight, 0);
  const flags = active.filter((s) => s.redFlag);
  let tier: Tier;
  if (flags.length || score >= TIERS.emergent.min) tier = TIERS.emergent;
  else if (score >= TIERS.urgent.min) tier = TIERS.urgent;
  else if (score >= TIERS.semi.min) tier = TIERS.semi;
  else if (score > 0) tier = TIERS.routine;
  else tier = TIERS.idle;
  return { active, score, flags, tier };
}

export const EXAMPLES: { name: string; findings: string[] }[] = [
  { name: "Itchy, red eye", findings: ["redness", "discharge"] },
  { name: "Flashes and a shadow", findings: ["flashes", "curtain"] },
  { name: "Halos and blurring", findings: ["halos", "blur"] },
  { name: "Chemical splash", findings: ["chemical", "pain"] },
];
