import type { Metadata } from "next";
import HeroNetwork from "@/components/HeroNetwork";
import ContactPanel from "@/components/ContactPanel";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Gustav Safi by email or on LinkedIn.",
};

export default function ContactPage() {
  return (
    <section className="relative hero-sky overflow-hidden">
      <HeroNetwork />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.04]">Get in touch</h1>
          <p className="mt-5 text-lg text-muted">Email is the fastest way to reach me.</p>
        </div>
        <div className="mt-10 sm:mt-12">
          <ContactPanel />
        </div>
      </div>
    </section>
  );
}
