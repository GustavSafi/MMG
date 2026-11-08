import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroNetwork from "@/components/HeroNetwork";
import SystemGraph from "@/components/SystemGraph";
import AgentBuilder from "@/components/AgentBuilder";
import Pipeline from "@/components/Pipeline";
import Section from "@/components/Section";
import { CAPABILITIES, HIGHLIGHTS } from "@/content";
import { TIERS, TIER_ORDER } from "@/lib/triage";

function Hero() {
  return (
    <section className="relative hero-sky overflow-hidden">
      <HeroNetwork />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-32 pb-16 sm:pt-36 lg:pt-40 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_1.02fr] gap-12 lg:gap-6 items-center">
        <div>
          <p className="text-muted">AI &amp; Cloud Engineer and Integration Specialist</p>
          <h1 className="mt-6 text-[2.75rem] xs:text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.04em] leading-[1.02] max-w-[13ch]">
            I build AI agents and the cloud they run on.
          </h1>
          <p className="mt-7 text-lg text-muted leading-relaxed max-w-[34rem]">
            I take AI features all the way to production: the agent and its prompts, the API in front of it, and the
            cloud infrastructure and pipelines that keep it running.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/projects" className="signal-bg rounded-full px-6 py-3 font-semibold text-night hover:brightness-110 transition">
              See my projects
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-line bg-night/40 px-6 py-3 font-medium hover:border-cyan/60 hover:text-cyan transition-colors"
            >
              About me
            </Link>
          </div>
          <dl className="mt-12 grid grid-cols-1 xs:grid-cols-3 gap-6 border-t border-line/80 pt-6 max-w-[36rem]">
            {HIGHLIGHTS.map((h) => (
              <div key={h.value}>
                <dt className="font-semibold text-fg">{h.value}</dt>
                <dd className="mt-1 text-sm text-muted leading-snug">{h.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <SystemGraph className="w-full max-w-[600px] mx-auto lg:ml-auto" />
      </div>
    </section>
  );
}

function Work() {
  return (
    <Section
      id="work"
      title="What I do"
      intro="Three areas that usually live with different people. I work across all of them, which is what makes integrations work."
    >
      <div className="divide-y divide-line border-y border-line">
        {CAPABILITIES.map((c) => (
          <div key={c.title} className="grid grid-cols-1 md:grid-cols-[1fr_14rem] gap-4 md:gap-10 py-8">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-3 text-muted leading-relaxed max-w-[38rem]">{c.text}</p>
            </div>
            <ul className="flex flex-wrap md:flex-col gap-x-4 gap-y-1.5 text-sm text-faint md:pt-1">
              {c.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Demo({ id, title, intro, children }: { id: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6 lg:gap-16 mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">{title}</h2>
          <p className="text-muted leading-relaxed max-w-[40rem] lg:pt-1.5">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

/* A quiet preview of the triage engine: the four priorities and one worked example. */
function TriageTeaser() {
  return (
    <section className="border-y border-line bg-deep/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="inline-flex rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-sm text-cyan">
            1st place, Hospition.IT hackathon, Dec 2025
          </span>
          <h2 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">
            A triage engine for eye clinics
          </h2>
          <p className="mt-5 text-muted leading-relaxed max-w-[34rem]">
            My team won with a triage prototype for ophthalmology. I designed the decision engine that sorts patient
            cases by clinical priority. You can try it yourself.
          </p>
          <Link
            href="/projects/triage"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-night/40 px-5 py-2.5 font-medium hover:border-cyan/60 hover:text-cyan transition-colors"
          >
            Try the triage engine
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Link
          href="/projects/triage"
          aria-label="Open the triage engine"
          className="group block rounded-2xl border border-line bg-night/60 p-6 hover:border-violet/50 transition-colors"
        >
          <div className="flex flex-wrap gap-2">
            {["New flashes and floaters", "Curtain or shadow over vision"].map((f) => (
              <span key={f} className="rounded-lg border border-violet/50 bg-violet/15 px-3 py-1.5 text-sm text-fg">
                {f}
              </span>
            ))}
          </div>
          <p className="mt-5 tabular-nums text-muted">
            28 + 34 = <span className="font-semibold text-fg">62</span>
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight" style={{ color: TIERS.emergent.color }}>
            Emergent
          </p>
          <div className="mt-5 grid grid-cols-4 gap-1">
            {TIER_ORDER.map((k) => (
              <span
                key={k}
                className="rounded-md py-1.5 text-center text-[0.72rem]"
                style={{
                  background: k === "emergent" ? `${TIERS[k].color}26` : "#111A36",
                  color: k === "emergent" ? TIERS[k].color : "#66769A",
                }}
              >
                {TIERS[k].label}
              </span>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Demo
        id="agent"
        title="Build an agent"
        intro="An agent is only as useful as the tools it can reach. Connect some tools, give it a task and watch it plan and call them. This one is scripted, but it follows the same pattern I use with real models."
      >
        <AgentBuilder />
      </Demo>
      <Demo
        id="pipeline"
        title="Ship a release"
        intro="This is the kind of pipeline I set up in Azure DevOps and GitHub Actions. Push a commit and watch it build, test and deploy. If the new version fails its health check, production rolls back on its own."
      >
        <Pipeline />
      </Demo>
      <TriageTeaser />
    </>
  );
}
