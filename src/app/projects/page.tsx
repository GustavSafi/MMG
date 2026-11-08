import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { CONTACT, PROJECTS } from "@/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "AI, cloud and back-end projects by Gustav Safi, from a thesis on self-hosted LLMs to an award-winning triage engine.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        intro="A selection of what I have built in school, for clients and on my own. More is on GitHub."
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
        {/* Featured: the triage engine has its own page */}
        <Link
          href="/projects/triage"
          className="group grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6 rounded-2xl border border-line bg-deep/70 p-6 sm:p-8 hover:border-cyan/50 transition-colors"
        >
          <div>
            <p className="text-sm text-cyan">1st place, Hospition.IT hackathon, Dec 2025</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">A triage engine for eye clinics</h2>
            <p className="mt-3 text-muted leading-relaxed max-w-[42rem]">
              The decision engine behind our winning prototype: weighted symptom scores that sort patient cases by
              clinical priority, with red-flag overrides. Rebuilt here so you can try it.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 font-medium text-cyan">
            Try it
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>

        <div className="mt-12 border-b border-line">
          {PROJECTS.map((p) => (
            <article key={p.title} className="grid grid-cols-1 sm:grid-cols-[6.5rem_1fr] gap-x-8 gap-y-2 py-8 border-t border-line">
              <div className="text-sm text-faint sm:pt-1">
                <span className="text-muted">{p.year}</span>
                <span className="sm:block sm:mt-0.5">
                  <span className="sm:hidden">, </span>
                  {p.kind}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight leading-snug">{p.title}</h2>
                <p className="mt-3 text-muted leading-relaxed max-w-[42rem]">{p.text}</p>
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
      </div>
    </>
  );
}
