export type ToolCategory =
  | "Calculator"
  | "Advertising"
  | "Compliance"
  | "Growth"
  | "Listing"
  | "Operations"
  | "Eligibility"
  | "Research";

export type ToolDefaultExecutionMode = "zero-token" | "live-data-zero-token";
export type ToolLiveDataMode = "none" | "amazon-listing-fetch" | "paste-or-upload";
export type ToolAiEscalationMode = "disabled" | "optional-low-token";

export type ToolExecutionProfile = {
  defaultMode: ToolDefaultExecutionMode;
  liveDataMode: ToolLiveDataMode;
  aiEscalation: ToolAiEscalationMode;
  targetInputTokens: number;
  targetOutputTokens: number;
  hardCapTokens: number;
  rationale: string;
};

export type ToolDefinition = {
  slug: string;
  name: string;
  platform: "amazon" | "tiktok-shop" | "shopify";
  category: ToolCategory;
  sourceSkillSlug?: string;
  sourceSkillType?: "canonical-skill" | "derived-companion";
  indexPriority?: "primary" | "secondary" | "internal";
  summary: string;
  seoTitle: string;
  seoDescription: string;
  intent: string;
  noAiReason: string;
  idealFor: string[];
  requiredInputs: string[];
  outputs: string[];
  methodology: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
};

export const allTools: ToolDefinition[] = [];

export const allNonAiCandidates = [] as const;
export const amazonLiveAuditCompanionSlugs = [] as const;
export const amazonLiveAuditCompanionCount = 0;
export const amazonCoreSkillCount = 0;

export function getToolExecutionProfile(slug: string): ToolExecutionProfile {
  void slug;

  return {
    defaultMode: "zero-token",
    liveDataMode: "none",
    aiEscalation: "disabled",
    targetInputTokens: 0,
    targetOutputTokens: 0,
    hardCapTokens: 0,
    rationale: "Ordinary tool pages have been removed from the public product.",
  };
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  void slug;
  return undefined;
}

export function isDerivedCompanionTool(slug: string) {
  void slug;
  return false;
}

export function getCanonicalTools(): ToolDefinition[] {
  return [];
}

export function getDerivedCompanionTools(): ToolDefinition[] {
  return [];
}

export function getIndexableCompanionTools(): ToolDefinition[] {
  return [];
}
