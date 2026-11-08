import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TriageLab from "@/components/TriageLab";

export const metadata: Metadata = {
  title: "Triage engine",
  description:
    "An interactive version of the triage engine that won the Hospition.IT hackathon: weighted symptom scores and red-flag overrides for eye clinics.",
};

const BUILD = [
  {
    title: "Start with requirements",
    text: "The challenge was triage for eye care. Before any code, we worked out what the tool had to decide and what each priority level should mean for the patient.",
  },
  {
    title: "Model the decision",
    text: "Each finding got a weight, and the weights add up. That lets several mild findings together outrank a single mild one, which matches how a clinician thinks about a case.",
  },
  {
    title: "Never average away danger",
    text: "Some findings, like sudden vision loss or a chemical burn, are emergencies on their own. They are red flags that override the score, so no combination of numbers can push them down the queue.",
  },
  {
    title: "Make it usable",
    text: "The result had to be clear at a glance: one priority, what to do next, and the reasoning behind it. That reasoning is what the trace on this page shows.",
  },
];

export default function TriagePage() {
  return (
    <>
      <PageHeader
        badge={
          <span className="inline-flex rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-sm text-cyan">
            1st place, Hospition.IT hackathon, Dec 2025
          </span>
        }
        title="A triage engine for eye clinics"
        intro="My team won the Hospition.IT hackathon with a digital triage prototype for ophthalmology. I designed its decision engine. This is the same model, rebuilt so you can try it."
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
        <TriageLab />
        <p className="mt-6 text-sm text-faint">An illustrative model for this portfolio, not for clinical use.</p>
      </div>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">How I built it</h2>
            <p className="mt-4 text-muted leading-relaxed">From requirements to a working prototype in one hackathon.</p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
            {BUILD.map((b, i) => (
              <li key={b.title}>
                <span className="text-sm tabular-nums text-cyan">Step {i + 1}</span>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{b.title}</h3>
                <p className="mt-2.5 text-muted leading-relaxed">{b.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
        <Link href="/projects" className="inline-flex items-center gap-2 text-muted hover:text-fg">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All projects
        </Link>
      </div>
    </>
  );
}
