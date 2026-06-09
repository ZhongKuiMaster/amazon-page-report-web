import type { MetadataRoute } from "next";
import { getAmazonSupportPageStaticParams } from "@/lib/amazon-seo-support-pages";
import { getToolSitemapPriority } from "@/lib/page-visible-tools";
import { platformRoadmap } from "@/lib/site-structure";
import { absoluteUrl } from "@/lib/site-url";
import { getVisibleTools } from "@/lib/page-visible-tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const canonicalTools = getVisibleTools().filter((tool) => tool.platform === "amazon");
  const amazonSupportPages = getAmazonSupportPageStaticParams();
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
      url: absoluteUrl("/amazon/image-studio"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.64,
    },
    {
      url: absoluteUrl("/amazon/image-studio/zh"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.54,
    },
    ...canonicalTools.map((tool) => ({
      url: absoluteUrl(`/${tool.platform}/${tool.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: getToolSitemapPriority(tool, "en"),
    })),
    ...canonicalTools.map((tool) => ({
      url: absoluteUrl(`/${tool.platform}/${tool.slug}/zh`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: getToolSitemapPriority(tool, "zh"),
    })),
    ...amazonSupportPages.map((page) => ({
      url: absoluteUrl(`/amazon/${page.slug}/${page.supportSlug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
    ...amazonSupportPages.map((page) => ({
      url: absoluteUrl(`/amazon/${page.slug}/${page.supportSlug}/zh`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.62,
    })),
  ];
}
