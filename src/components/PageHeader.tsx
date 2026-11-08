import HeroNetwork from "./HeroNetwork";

/* The smaller, calmer version of the home hero used at the top of sub-pages. */
export default function PageHeader({
  title,
  intro,
  badge,
}: {
  title: string;
  intro?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <section className="relative hero-sky overflow-hidden border-b border-line/70">
      <HeroNetwork />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-32 pb-14 sm:pt-36 sm:pb-16">
        {badge}
        <h1 className={`${badge ? "mt-5" : ""} text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.04] max-w-[18ch]`}>
          {title}
        </h1>
        {intro && <div className="mt-5 text-lg text-muted leading-relaxed max-w-[38rem]">{intro}</div>}
      </div>
    </section>
  );
}
