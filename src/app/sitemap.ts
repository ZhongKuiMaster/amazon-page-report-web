import type { MetadataRoute } from "next";
import { platformRoadmap } from "@/lib/site-structure";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const indexablePlatforms = platformRoadmap.filter((platform) => platform.slug === "amazon");
  const trustPagePaths = ["/about", "/contact", "/disclaimer", "/privacy", "/terms"];

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/zh"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...trustPagePaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.42,
    })),
    ...trustPagePaths.map((path) => ({
      url: absoluteUrl(`${path}/zh`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.38,
    })),
    ...indexablePlatforms.map((platform) => ({
      url: absoluteUrl(`/${platform.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    })),
    ...indexablePlatforms.map((platform) => ({
      url: absoluteUrl(`/${platform.slug}/zh`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    {
      url: absoluteUrl("/amazon/amazon-ads-audit-workbench"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.92,
    },
  ];
}
