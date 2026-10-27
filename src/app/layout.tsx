import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gustav Safi | .NET Cloud Developer",
  description:
    "Gustav Safi, a .NET Cloud developer in Göteborg building stable back-ends, cloud infrastructure on Azure, and practical AI systems. Hackathon winner and freelance engineer.",
  keywords: [
    "Gustav Safi",
    ".NET Cloud Developer",
    "C#",
    "Azure",
    "Blazor",
    "Software Engineer",
    "Göteborg",
    "AI",
    "LLM",
    "AI Agents",
  ],
  authors: [{ name: "Gustav Safi" }],
  openGraph: {
    title: "Gustav Safi | .NET Cloud Developer",
    description:
      "Building stable systems, from cloud back-ends to the AI logic that runs on top of them.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
