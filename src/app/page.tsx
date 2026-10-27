"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import TriageEngine from "@/components/TriageEngine";

/* ------------------------------------------------------------------ */
/*  DATA: grounded strictly in Gustav's CV                            */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: "profile", label: "Profile" },
  { id: "triage", label: "Case Study" },
  { id: "work", label: "Work" },
  { id: "stack", label: "Stack" },
  { id: "credentials", label: "Credentials" },
  { id: "contact", label: "Contact" },
];

const STATS = [
  { n: "1st", label: "Place, Hospition.IT hackathon" },
  { n: "05", label: "Engineers led at Podmanager" },
  { n: "03", label: "Languages spoken fluently" },
  { n: "'24", label: "Freelancing since" },
];

const WORK = [
  {
    period: "Sep 2025 – Nov 2025",
    role: "Cloud Team Lead",
    org: "Podmanager",
    type: "Internship",
    desc: "Led a team of five, introducing Azure and DevOps ways of working. Coached the group and followed up on delivery.",
    tags: ["Azure", "DevOps", "Leadership"],
  },
  {
    period: "Feb 2025 – Present",
    role: "AI Data Annotation",
    org: "Koikco",
    type: "Remote contract",
    desc: "Contributed to AI model development by annotating images and conversational data in Swedish, with a focus on quality and labelling accuracy.",
    tags: ["AI", "Data", "Swedish NLP"],
  },
  {
    period: "Aug 2024 – Present",
    role: "Freelance Developer",
    org: "Upwork & direct clients",
    type: "Self-employed",
    desc: "Build websites and code solutions for companies through Upwork and my own client relationships, from scoping to delivery.",
    tags: ["Web", "Client work", "Full-stack"],
  },
  {
    period: "Jan 2024 – Jan 2025",
    role: "Staffing Consultant",
    org: "Jovi",
    type: "On-site",
    desc: "Production work in a factory environment with a focus on technical troubleshooting of machinery during faults and disruptions.",
    tags: ["Troubleshooting", "Production"],
  },
  {
    period: "Jun 2021 – Sep 2023",
    role: "Vehicle Assembler",
    org: "Volvo Cars",
    type: "On-site",
    desc: "Assembled car parts in the body plant and assisted with machine faults through hands-on troubleshooting and electronics replacement.",
    tags: ["Precision", "Electronics"],
  },
];

const STACK = [
  {
    group: "Back-end & Cloud",
    items: [".NET", "C#", "Azure", "SQL Server", "Entity Framework Core", "MongoDB", "Node.js", "API Integration"],
  },
  {
    group: "Front-end",
    items: ["Blazor", "React", "JavaScript", "HTML & CSS"],
  },
  {
    group: "AI & Data",
    items: [
      "LLMs",
      "AI Agents",
      "LLM Integration",
      "RAG",
      "Vector Search & Embeddings",
      "Azure OpenAI",
      "Semantic Kernel",
      "Tool Calling",
      "Prompt Engineering",
      "Python",
      "Data Annotation",
    ],
  },
  {
    group: "Practices & Tools",
    items: ["Git & GitHub", "Agile", "CI/CD", "Microsoft Office Suite"],
  },
];

const EDUCATION = [
  { school: "IT-Högskolan", detail: ".NET Cloud Developer, Göteborg", year: "2024–26" },
  { school: "Harvard University", detail: "CS50: Introduction to Computer Science (edX)", year: "Cert." },
  { school: "Polhemsgymnasiet", detail: "Upper secondary, Göteborg", year: "" },
];

const EXTRAS = [
  { k: "UF (Young Enterprise)", v: "CEO & Head of Sales" },
  { k: "Languages", v: "Swedish (native) · English (fluent) · Pashto (fluent)" },
  { k: "Licence", v: "Swedish driving licence (B)" },
  { k: "Certificates", v: "IT-Högskolan diploma · CS50 certificate" },
];

const MARQUEE = [".NET", "AZURE", "C#", "BLAZOR", "SQL SERVER", "EF CORE", "MONGODB", "NODE.JS", "LLMS", "AI AGENTS", "RAG", "PYTHON", "CI/CD", "DEVOPS", "REACT"];

/* ------------------------------------------------------------------ */
/*  PRIMITIVES                                                        */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ index, title, sub }: { index: string; title: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-ink pb-4 mb-12">
      <div className="flex items-baseline gap-4 sm:gap-6">
        <span className="font-mono text-sm text-accent">{index}</span>
        <h2 className="font-display text-4xl sm:text-6xl leading-none">{title}</h2>
      </div>
      {sub && <span className="kicker text-ink/50 hidden sm:block text-right max-w-[12rem]">{sub}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HEADER                                                            */
/* ------------------------------------------------------------------ */

function Clock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Stockholm",
        hour12: false,
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time || "--:--:--"}</span>;
}

function Header() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-paper/85 backdrop-blur-sm border-b border-ink">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 h-14 flex items-center justify-between">
        <a href="#top" className="font-display font-semibold text-lg tracking-tight">
          GUSTAV SAFI<span className="text-accent">.</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="kicker text-ink/60 hover:text-ink link-sweep">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="font-mono text-[0.68rem] text-ink/55 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald inline-block" />
          <span className="hidden xs:inline">GÖTEBORG</span> <Clock />
        </div>
      </div>
      <motion.div className="h-[2px] bg-accent origin-left" style={{ scaleX }} />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                              */
/* ------------------------------------------------------------------ */

function Hero() {
  const words = ["from cloud back-ends", "to the AI logic", "that runs on top."];
  return (
    <section id="top" className="relative pt-28 sm:pt-36 pb-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-between gap-2 border-b border-ink pb-3 mb-8 kicker text-ink/60"
        >
          <span>Portfolio / 2026</span>
          <span>.NET Cloud Developer</span>
          <span className="hidden sm:block">Göteborg, Sweden</span>
        </motion.div>

        {/* giant name */}
        <div className="relative">
          <h1 className="font-display font-semibold leading-[0.82] tracking-tight text-[19vw] sm:text-[15vw] lg:text-[13.5vw]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              GUSTAV
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              SAFI<span className="text-accent">.</span>
            </motion.span>
          </h1>
        </div>

        {/* statement + intro */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 mt-10 border-t border-ink pt-8">
          <div className="font-display text-2xl sm:text-4xl leading-[1.05]">
            {words.map((w, i) => (
              <motion.span
                key={i}
                className="block"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {i === 0 ? "I build stable systems, " : ""}
                {w}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col justify-between gap-6"
          >
            <p className="font-sans text-ink/70 leading-relaxed max-w-sm">
              A .NET &amp; cloud developer who ships working software. I work hands-on with C#, databases, APIs and Azure
              across both front-end and back-end, and build practical AI on top.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#contact" className="group inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 kicker hover:bg-accent transition-colors">
                Get in touch
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="#triage" className="inline-flex items-center gap-2 border border-ink px-5 py-2.5 kicker hover:bg-ink hover:text-paper transition-colors">
                See the case study
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  MARQUEE                                                           */
/* ------------------------------------------------------------------ */

function Marquee() {
  const row = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee-wrap border-y border-ink bg-ink text-paper overflow-hidden py-4 select-none">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className="font-display text-2xl sm:text-3xl px-6 flex items-center gap-6">
            {t}
            <span className="text-accent">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS                                                             */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-t border-ink">
        {STATS.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="border-r border-b border-ink p-6 sm:p-8">
            <div className="font-display text-5xl sm:text-6xl text-accent mb-3">{s.n}</div>
            <p className="font-mono text-xs text-ink/60 uppercase tracking-wider leading-relaxed">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTIONS                                                          */
/* ------------------------------------------------------------------ */

function Profile() {
  return (
    <section id="profile" className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20 scroll-mt-16">
      <SectionHead index="01" title="Profile" sub="Who I am & how I work" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-20">
        <Reveal>
          <p className="font-display text-2xl sm:text-3xl leading-[1.15] mb-8">
            I&apos;m a problem-solver first and a developer second. I like taking a vague requirement and turning it into
            something stable that actually ships.
          </p>
          <p className="font-sans text-ink/70 leading-relaxed max-w-xl">
            My focus is .NET and the cloud, including C#, databases, APIs and Azure. I have real competence on both the
            front-end and the back-end. I learn fast, take ownership of what I&apos;m given, and I&apos;m just as comfortable building
            my own projects (including practical AI tools) as I am collaborating in a team or freelancing for clients.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="border-t border-ink">
            {[
              ["Based in", "Göteborg, Sweden"],
              ["Discipline", ".NET Cloud Developer"],
              ["Working on", "Cloud, back-end & applied AI"],
              ["Availability", "Open to opportunities"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-4 border-b border-ink/15">
                <span className="kicker text-ink/50">{k}</span>
                <span className="font-sans text-right text-ink font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Triage() {
  return (
    <section id="triage" className="bg-paper-dim border-y border-ink scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20">
        <SectionHead index="02" title="Case Study" sub="Hospition.IT, 1st place" />
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
          <Reveal>
            <div className="inline-flex items-center gap-2 border border-accent text-accent px-3 py-1 kicker mb-6">
              ★ Hackathon winner
            </div>
            <h3 className="font-display text-3xl sm:text-4xl leading-tight mb-6">
              A triage engine for ophthalmology.
            </h3>
            <p className="font-sans text-ink/70 leading-relaxed mb-4">
              At the Hospition.IT hackathon my team took first place with a digital triage prototype for eye clinics. I
              designed a decision engine that scores <strong className="font-medium text-ink">weighted symptom
              parameters</strong> to automatically categorise patient cases by clinical priority.
            </p>
            <p className="font-sans text-ink/70 leading-relaxed mb-8">
              It combined requirements analysis, logic modelling and a usable prototype for clinical decision support.
              The interactive panel is that same model, rebuilt so you can try it. Toggle findings and watch the
              priority recompute in real time.
            </p>
            <ul className="space-y-2 font-mono text-sm text-ink/70">
              <li className="flex gap-3"><span className="text-accent">→</span> Additive weighted scoring</li>
              <li className="flex gap-3"><span className="text-accent">→</span> Red-flag overrides for critical findings</li>
              <li className="flex gap-3"><span className="text-accent">→</span> Four-tier priority classification</li>
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <TriageEngine />
            <p className="mt-4 font-mono text-[0.68rem] text-ink/40 leading-relaxed">
              * Illustrative model for portfolio purposes. Not for real clinical use.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20 scroll-mt-16">
      <SectionHead index="03" title="Work" sub="Software, teams & the factory floor" />
      <div className="border-t border-ink">
        {WORK.map((w, i) => (
          <Reveal key={i}>
            <div className="group grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_9rem] gap-2 md:gap-8 items-baseline py-7 border-b border-ink/20 hover:border-ink transition-colors relative">
              <div className="absolute left-0 top-0 h-full w-[3px] bg-accent scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 -translate-x-5 hidden md:block" />
              <div>
                <span className="font-mono text-xs text-ink/50">{w.period}</span>
                <div className="kicker text-accent mt-1">{w.type}</div>
              </div>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl leading-tight group-hover:translate-x-1 transition-transform">
                  {w.role}
                  <span className="text-ink/40"> / {w.org}</span>
                </h3>
                <p className="font-sans text-ink/65 leading-relaxed mt-2 max-w-2xl">{w.desc}</p>
              </div>
              <div className="flex md:flex-col flex-wrap gap-1.5 md:items-end">
                {w.tags.map((t) => (
                  <span key={t} className="font-mono text-[0.6rem] uppercase tracking-wider border border-ink/25 px-2 py-0.5 text-ink/60">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section id="stack" className="bg-ink text-paper border-y border-ink scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between gap-6 border-b border-paper/30 pb-4 mb-12">
          <div className="flex items-baseline gap-4 sm:gap-6">
            <span className="font-mono text-sm text-accent">04</span>
            <h2 className="font-display text-4xl sm:text-6xl leading-none">Stack</h2>
          </div>
          <span className="kicker text-paper/50 hidden sm:block">The tools, grouped by use</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {STACK.map((g, i) => (
            <Reveal key={g.group} delay={(i % 2) * 0.08}>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="kicker text-paper/70">{g.group}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <span
                    key={it}
                    className="font-display text-lg sm:text-xl border border-paper/25 px-3 py-1.5 hover:bg-accent hover:border-accent hover:text-paper transition-colors cursor-default"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credentials() {
  return (
    <section id="credentials" className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20 scroll-mt-16">
      <SectionHead index="05" title="Credentials" sub="Education & the rest" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <Reveal>
          <span className="kicker text-ink/50 block mb-6">Education</span>
          <div className="border-t border-ink">
            {EDUCATION.map((e) => (
              <div key={e.school} className="flex justify-between gap-4 py-5 border-b border-ink/15 group">
                <div>
                  <h3 className="font-display text-2xl leading-tight group-hover:text-accent transition-colors">{e.school}</h3>
                  <p className="font-sans text-ink/60 text-sm mt-1">{e.detail}</p>
                </div>
                {e.year && <span className="font-mono text-xs text-ink/50 shrink-0">{e.year}</span>}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="kicker text-ink/50 block mb-6">Also worth knowing</span>
          <div className="border-t border-ink">
            {EXTRAS.map((x) => (
              <div key={x.k} className="py-5 border-b border-ink/15">
                <div className="kicker text-accent mb-1">{x.k}</div>
                <p className="font-sans text-ink/80">{x.v}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CONTACT / FOOTER                                                 */
/* ------------------------------------------------------------------ */

function Contact() {
  const links = [
    {
      label: "Email",
      value: <>GustavSafi<wbr />@hotmail.com</>,
      href: "mailto:GustavSafi@hotmail.com",
    },
    {
      label: "GitHub",
      value: <>github.com/<wbr />GustavSafi</>,
      href: "https://github.com/GustavSafi",
      ext: true,
    },
    {
      label: "LinkedIn",
      value: <>in/<wbr />gustav-safi</>,
      href: "https://www.linkedin.com/in/gustav-safi-6b6257248/",
      ext: true,
    },
  ];
  return (
    <footer id="contact" className="bg-ink text-paper scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20">
        <div className="flex items-baseline gap-4 sm:gap-6 mb-10">
          <span className="font-mono text-sm text-accent">06</span>
          <span className="kicker text-paper/50">Contact</span>
        </div>

        <h2 className="font-display font-semibold leading-[0.85] tracking-tight text-[15vw] lg:text-[11vw] mb-12">
          LET&apos;S<br />
          <span className="text-outline" style={{ WebkitTextStrokeColor: "var(--color-paper)" }}>
            BUILD
          </span>{" "}
          <span className="text-accent">→</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-paper/25">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.ext ? "_blank" : undefined}
              rel={l.ext ? "noopener noreferrer" : undefined}
              className="group border-b md:border-b-0 md:border-r border-paper/25 last:border-r-0 p-6 sm:p-8 hover:bg-accent transition-colors"
            >
              <span className="kicker text-paper/50 group-hover:text-paper/80 block mb-3">{l.label}</span>
              <span className="font-display text-xl sm:text-2xl break-words flex items-center gap-2">
                <span className="min-w-0">{l.value}</span>
                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">↗</span>
              </span>
            </a>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-12 pt-6 border-t border-paper/25 font-mono text-[0.68rem] text-paper/45">
          <span>© 2026 Gustav Safi · Göteborg, Sweden</span>
          <span>Designed &amp; built from scratch · No templates</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <Marquee />
      <Stats />
      <Profile />
      <Triage />
      <Work />
      <Stack />
      <Credentials />
      <Contact />
    </main>
  );
}
