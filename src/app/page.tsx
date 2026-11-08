import { ArrowUpRight } from "lucide-react";
import HeroNetwork from "@/components/HeroNetwork";
import SystemGraph from "@/components/SystemGraph";
import TriageEngine from "@/components/TriageEngine";
import {
  CAPABILITIES,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  EXTRAS,
  HIGHLIGHTS,
  PROJECTS,
  STACK,
} from "@/content";

const NAV = [
  { id: "work", label: "What I do" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
];

/* ------------------------------------------------------------------ */
/*  Small pieces                                                      */
/* ------------------------------------------------------------------ */

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DD3FC" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <path d="M5 7 12 18 19 6M5 7l14-1" fill="none" stroke="url(#mark-g)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="7" r="2.6" fill="#7DD3FC" />
      <circle cx="19" cy="6" r="2.6" fill="#A78BFA" />
      <circle cx="12" cy="18" r="2.6" fill="#C4B5FD" />
    </svg>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8 lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">{title}</h2>
          {intro && <p className="mt-4 text-muted leading-relaxed max-w-md">{intro}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-line/60 bg-night/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Mark className="h-6 w-6" />
          Gustav Safi
        </a>
        <nav aria-label="Sections" className="hidden md:flex items-center gap-7 text-sm text-muted">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="hover:text-fg transition-colors">
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-line bg-raised/60 px-4 py-1.5 text-sm font-medium hover:border-cyan/60 hover:text-cyan transition-colors"
        >
          Contact
        </a>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="top" className="relative hero-sky overflow-hidden">
      <HeroNetwork />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-32 pb-16 sm:pt-36 lg:pt-40 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_1.02fr] gap-12 lg:gap-6 items-center">
        <div>
          <p className="flex items-center gap-2.5 text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            AI and cloud engineer in Göteborg, available for new roles
          </p>
          <h1 className="mt-6 text-[2.75rem] xs:text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.04em] leading-[1.02] max-w-[13ch]">
            I build AI agents and the cloud they run on.
          </h1>
          <p className="mt-7 text-lg text-muted leading-relaxed max-w-[34rem]">
            I take AI features all the way to production: the agent and its prompts, the ASP.NET Core API in front of it,
            and the Azure infrastructure and pipelines that keep it running.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="signal-bg rounded-full px-6 py-3 font-semibold text-night hover:brightness-110 transition"
            >
              See my projects
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="rounded-full border border-line bg-night/40 px-6 py-3 font-medium hover:border-cyan/60 hover:text-cyan transition-colors"
            >
              Email me
            </a>
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

/* ------------------------------------------------------------------ */
/*  Sections                                                          */
/* ------------------------------------------------------------------ */

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

function CaseStudy() {
  return (
    <section id="case-study" className="scroll-mt-20 border-y border-line bg-deep/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mb-10 lg:mb-12">
          <div>
            <span className="inline-flex rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-sm text-cyan">
              1st place, Hospition.IT hackathon, Dec 2025
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">
              A triage engine for eye clinics
            </h2>
          </div>
          <div className="lg:pt-12">
            <p className="text-muted leading-relaxed">
              My team won with a digital triage prototype for ophthalmology. I designed the decision engine: weighted
              symptom scores that sort patient cases by clinical priority, with red-flag findings that override the score.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              The panel below is the same model rebuilt for this page. Select findings and the priority updates as you go.
            </p>
          </div>
        </div>
        <TriageEngine />
        <p className="mt-4 text-sm text-faint">An illustrative model for this portfolio, not for clinical use.</p>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <Section
      id="projects"
      title="Projects"
      intro="A selection of what I have built in school, for clients and on my own. More is on GitHub."
    >
      <div className="border-b border-line">
        {PROJECTS.map((p) => (
          <article key={p.title} className="grid grid-cols-1 sm:grid-cols-[6.5rem_1fr] gap-x-8 gap-y-2 py-8 border-t border-line">
            <div className="text-sm text-faint sm:pt-1">
              <span className="text-muted">{p.year}</span>
              <span className="sm:block sm:mt-0.5"><span className="sm:hidden">, </span>{p.kind}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight leading-snug">{p.title}</h3>
              <p className="mt-3 text-muted leading-relaxed max-w-[40rem]">{p.text}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <ul className="flex flex-wrap gap-2" aria-label="Technologies">
                  {p.tech.map((t) => (
                    <li key={t} className="rounded-md bg-raised px-2 py-0.5 text-[0.8rem] text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-cyan hover:underline underline-offset-4"
                  >
                    Code on GitHub
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <a
        href={CONTACT.github}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-1 font-medium text-cyan hover:underline underline-offset-4"
      >
        All repositories on GitHub
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </Section>
  );
}

function Experience() {
  return (
    <Section
      id="experience"
      title="Experience"
      intro="Two internships, ongoing AI and freelance work, and years on the production floor before that."
    >
      <ol className="relative pl-9">
        <span className="rail absolute left-[5px] top-2 bottom-0 w-px" aria-hidden="true" />
        {EXPERIENCE.map((e, i) => (
          <li key={e.org + e.role} className="relative pb-12 last:pb-0">
            <span
              className={`absolute -left-9 top-1.5 h-[11px] w-[11px] rounded-full border-2 bg-night ${
                i < 4 ? "border-cyan" : "border-faint"
              }`}
              aria-hidden="true"
            />
            <p className="text-sm text-faint">{e.period}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">
              {e.role}
              <span className="font-normal text-muted">, {e.org}</span>
            </h3>
            <p className="mt-2.5 text-muted leading-relaxed max-w-[40rem]">{e.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Stack() {
  return (
    <Section id="stack" title="Stack" intro="The tools I reach for, grouped by what they are for.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
        {STACK.map((g) => (
          <div key={g.group}>
            <h3 className="font-semibold pb-3 border-b border-line">{g.group}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {g.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Education() {
  return (
    <Section id="education" title="Education">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-6">
          {EDUCATION.map((e) => (
            <div key={e.school}>
              <p className="text-sm text-faint">{e.year}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{e.school}</h3>
              <p className="mt-1 text-muted">{e.detail}</p>
            </div>
          ))}
        </div>
        <dl className="space-y-5">
          {EXTRAS.map((x) => (
            <div key={x.k}>
              <dt className="text-sm text-faint">{x.k}</dt>
              <dd className="mt-1 text-muted">{x.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

function Contact() {
  return (
    <footer id="contact" className="scroll-mt-20 relative overflow-hidden border-t border-line hero-sky">
      <HeroNetwork />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-24 pb-10 sm:pt-32">
        <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.05] max-w-[16ch]">
          Have an AI feature that needs to reach production?
        </h2>
        <p className="mt-6 text-lg text-muted max-w-[34rem] leading-relaxed">
          I&apos;m open to roles in Göteborg and remote. Email is the fastest way to reach me.
        </p>
        <a
          href={`mailto:${CONTACT.email}`}
          className="mt-10 inline-block break-all text-2xl xs:text-3xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-r from-cyan to-violet bg-clip-text text-transparent hover:opacity-90"
        >
          {CONTACT.email}
        </a>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-night/40 px-5 py-2.5 font-medium hover:border-cyan/60 hover:text-cyan transition-colors"
          >
            LinkedIn
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-night/40 px-5 py-2.5 font-medium hover:border-cyan/60 hover:text-cyan transition-colors"
          >
            GitHub
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-24 flex flex-col sm:flex-row justify-between gap-2 border-t border-line/80 pt-6 text-sm text-faint">
          <span className="flex items-center gap-2">
            <Mark className="h-4 w-4" />© 2026 Gustav Safi, Göteborg
          </span>
          <span>Designed and built by me with Next.js</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-raised focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <Work />
        <Projects />
        <CaseStudy />
        <Experience />
        <Stack />
        <Education />
      </main>
      <Contact />
    </>
  );
}
