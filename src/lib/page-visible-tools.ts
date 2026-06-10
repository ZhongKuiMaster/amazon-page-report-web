import type { ToolDefinition } from "@/lib/tools";

export const visibleToolSlugs = [] as const;
export const betaFeaturedToolSlugs = [] as const;
export const betaSecondaryToolSlugs = [] as const;
export const betaFirstWaveFeaturedToolSlugs = [] as const;
export const betaDeferredFeaturedToolSlugs = [] as const;
export const betaSeoSupportToolSlugs = [] as const;
export const imageStudioToolSlugs = new Set<string>();

export type CommercialToolLane = "core" | "control" | "risk" | "support";
export type HomepagePriority = "hero" | "high" | "normal";
export type ToolPageRole = "primary-decision" | "workflow-anchor" | "specialized-entry";

export type CommercialToolMatrix = {
  core: ToolDefinition[];
  control: ToolDefinition[];
  risk: ToolDefinition[];
  support: ToolDefinition[];
  anchors: ToolDefinition[];
};

export function isVisibleToolSlug(slug: string) {
  void slug;
  return false;
}

export function getVisibleTools(): ToolDefinition[] {
  return [];
}

export function getVisibleToolBySlug(slug: string): ToolDefinition | undefined {
  void slug;
  return undefined;
}

export function filterVisibleToolSlugs(slugs: string[]) {
  void slugs;
  return [];
}

export function getPlatformToolMatrix(platform: ToolDefinition["platform"]) {
  void platform;
  return { featured: [], secondary: [], seoSupport: [] };
}

export function getCommercialToolMatrix(
  platform: ToolDefinition["platform"],
): CommercialToolMatrix {
  void platform;
  return { core: [], control: [], risk: [], support: [], anchors: [] };
}

export function getCommercialLane(tool: ToolDefinition): CommercialToolLane | undefined {
  void tool;
  return undefined;
}

export function getHomepagePriority(tool: ToolDefinition): HomepagePriority {
  void tool;
  return "normal";
}

export function getToolPageRole(tool: ToolDefinition): ToolPageRole {
  void tool;
  return "specialized-entry";
}

export function getToolDistributionScore(tool: ToolDefinition) {
  void tool;
  return 0;
}

export function sortToolsByDistributionPriority<T extends ToolDefinition>(tools: T[]) {
  return [...tools];
}

export function getToolSitemapPriority(tool: ToolDefinition, locale: "en" | "zh") {
  void tool;
  return locale === "zh" ? 0.4 : 0.5;
}
