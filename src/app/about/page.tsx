import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { ABOUT, EDUCATION, EXPERIENCE, EXTRAS, STACK } from "@/content";

export const metadata: Metadata = {
  title: "About",
  description: "From the production line at Volvo Cars to AI and cloud engineering. Experience, stack and education.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader title="From the production line to AI and cloud" />

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8 lg:gap-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">About me</h2>
          <div className="space-y-5 text-lg text-muted leading-relaxed max-w-[40rem]">
            {ABOUT.map((p, i) => (
              <p key={i} className={i === 0 ? "text-fg" : undefined}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-line">
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
                    i < EXPERIENCE.length - 1 ? "border-cyan" : "border-faint"
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
      </div>

      <div className="border-t border-line">
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
      </div>

      <div className="border-t border-line">
        <Section id="other" title="Other">
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
              <div>
                <dt className="text-sm text-faint">References</dt>
                <dd className="mt-1 text-muted">Available on request</dd>
              </div>
            </dl>
          </div>
        </Section>
      </div>
    </>
  );
}
