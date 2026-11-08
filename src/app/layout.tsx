import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/opsz.css";
import "./globals.css";

const title = "Gustav Safi | AI & Cloud Engineer";
const description =
  "Gustav Safi is an AI and cloud engineer. He builds AI agents and LLM features, the APIs around them and the cloud infrastructure they run on.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gustavsafi.se"),
  title,
  description,
  keywords: [
    "Gustav Safi",
    "AI Engineer",
    "Cloud Engineer",
    "Integration Specialist",
    "AI Agents",
    "LLM",
    "RAG",
    "Cloud",
    "Kubernetes",
    "Terraform",
    "Azure",
    ".NET",
    "C#",
    "DevOps",
  ],
  authors: [{ name: "Gustav Safi", url: "https://gustavsafi.se" }],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description: "Building AI agents and the cloud they run on.",
    url: "https://gustavsafi.se",
    siteName: "Gustav Safi",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: "Building AI agents and the cloud they run on.",
  },
};

export const viewport: Viewport = {
  themeColor: "#060a14",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gustav Safi",
  jobTitle: "AI & Cloud Engineer",
  url: "https://gustavsafi.se",
  email: "mailto:GustavSafi@hotmail.com",
  alumniOf: { "@type": "EducationalOrganization", name: "IT-Högskolan" },
  sameAs: ["https://github.com/GustavSafi", "https://www.linkedin.com/in/gustav-safi-6b6257248/"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
