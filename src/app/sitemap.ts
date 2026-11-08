import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://gustavsafi.se", lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
