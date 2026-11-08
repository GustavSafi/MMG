export default function Section({
  id,
  title,
  intro,
  children,
}: {
  id?: string;
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
