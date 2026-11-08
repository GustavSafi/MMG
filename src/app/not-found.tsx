import type { Metadata } from "next";
import HeroNetwork from "@/components/HeroNetwork";
import BrokenLink from "@/components/BrokenLink";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="relative hero-sky overflow-hidden min-h-[100svh]">
      <HeroNetwork />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-32 pb-16 sm:pt-36 text-center">
        <p className="text-sm tabular-nums text-cyan">404</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.04]">This link is broken</h1>
        <p className="mt-4 text-lg text-muted">The page you were looking for isn&apos;t here.</p>
        <div className="mt-8">
          <BrokenLink />
        </div>
      </div>
    </section>
  );
}
