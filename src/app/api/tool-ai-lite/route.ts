import { NextResponse } from "next/server";
import { getToolBySlug, getToolExecutionProfile } from "@/lib/tools";

type ToolAiRequest = {
  toolSlug?: string;
  locale?: "en" | "zh";
  context?: Record<string, unknown>;
  result?: {
    headline?: string;
    summary?: string;
    recommendations?: string[];
    riskItems?: string[];
    missingItems?: string[];
    nextSteps?: string[];
    metrics?: Array<{ label: string; value: string; detail?: string }>;
  };
};

type ToolAiSection = {
  title: string;
  body: string;
};

type GuardedAssistResponse = {
  mode: "guarded-assist";
  tokenBudget: {
    input: number;
    output: number;
    hardCap: number;
  };
  sections: ToolAiSection[];
};

const maxContextStringLength = 80;
const maxContextArrayItems = 4;
const maxContextObjectEntries = 6;
const maxMetricDetailLength = 48;
const maxSummaryLength = 140;
const maxHeadlineLength = 72;
const maxPayloadCharacters = 1400;
const maxCompletionSlackTokens = 32;

const forbiddenResponsePatterns = [
  /\bopenai\b/gi,
  /\bdeepseek\b/gi,
  /\banthropic\b/gi,
  /\bgpt(?:-[a-z0-9.]+)?\b/gi,
  /\bclaude(?:-[a-z0-9.]+)?\b/gi,
  /\bgemini(?:-[a-z0-9.]+)?\b/gi,
  /\bllama(?:-[a-z0-9.]+)?\b/gi,
  /\bmistral(?:-[a-z0-9.]+)?\b/gi,
  /\bapi\b/gi,
  /\bprovider\b/gi,
  /\bvendor\b/gi,
  /模型名称/gi,
  /模型公司/gi,
  /供应商/gi,
  /接口方/gi,
  /接口提供方/gi,
  /技术供应方/gi,
];

const contextKeyWhitelist: Record<string, string[]> = {
  "amazon-listing-optimization": [
    "targetKeywords",
    "ownTitle",
    "ownBullets",
    "competitorAsins",
  ],
  "amazon-a-plus-content": [
    "benefitAngles",
    "buyerObjections",
    "brandStory",
    "plannedModules",
    "assetChecklist",
    "liveTitle",
  ],
  "amazon-enhanced-brand-content": [
    "benefitAngles",
    "buyerObjections",
    "brandStory",
    "plannedModules",
    "assetChecklist",
    "liveTitle",
  ],
  "amazon-ppc-campaign": [
    "campaignMode",
    "targetAcos",
    "parsedCampaignRows",
    "campaignEfficiencyMap",
  ],
  "amazon-advertising-strategy": [
    "goal",
    "monthlyBudget",
    "heroAsinCount",
    "parsedCampaignRows",
    "allocationRows",
  ],
  "amazon-review-analyzer": [
    "parsedReviewCount",
    "averageRating",
    "complaintThemes",
    "praiseThemes",
    "opportunityThemes",
  ],
  "amazon-brand-analytics": [
    "parsedRows",
    "repeatedWinnerAsins",
    "priorityQueries",
    "ownAsin",
  ],
  "amazon-suspension-appeal": [
    "issueType",
    "noticeText",
    "rootCauses",
    "evidencePack",
    "correctiveActions",
    "preventionSteps",
  ],
  "amazon-product-photography": [
    "useCases",
    "featurePriorities",
    "selectedProps",
    "retouchNeeds",
    "shotRows",
  ],
  "amazon-storefront-design": [
    "catalogCount",
    "collectionCount",
    "navDepth",
    "audienceSegments",
    "trafficSources",
    "structureRows",
  ],
  "amazon-international-listings": [
    "sourceLocale",
    "targetLocale",
    "keywordGoals",
    "complianceCaveats",
    "localizationDepth",
    "pricingReady",
    "liveTitle",
  ],
};

function truncateText(value: string, limit: number) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}

function normalizeSpacing(value: string) {
  return value.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

function sanitizeAssistText(value: string, limit: number) {
  let output = value;
  for (const pattern of forbiddenResponsePatterns) {
    output = output.replace(pattern, "");
  }
  output = normalizeSpacing(output);
  return truncateText(output || "Keep the current deterministic result as the decision anchor.", limit);
}

function compactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return truncateText(value, maxContextStringLength);
  }

  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, maxContextArrayItems).map((item) => compactValue(item));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, maxContextObjectEntries);
    return Object.fromEntries(entries.map(([key, item]) => [key, compactValue(item)]));
  }

  return String(value);
}

function slimContext(toolSlug: string, context: Record<string, unknown>) {
  const allowedKeys = contextKeyWhitelist[toolSlug] ?? [];
  const picked = Object.fromEntries(
    allowedKeys
      .filter((key) => key in context)
      .map((key) => [key, compactValue(context[key])]),
  );
  return picked;
}

function parseJsonResponse(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Protected assist returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate) as { sections?: ToolAiSection[] };
}

function compactDeterministicResult(request: ToolAiRequest) {
  return {
    headline: truncateText(request.result?.headline ?? "", maxHeadlineLength),
    summary: truncateText(request.result?.summary ?? "", maxSummaryLength),
    metrics: (request.result?.metrics ?? []).slice(0, 4).map((metric) => ({
      label: truncateText(metric.label, 24),
      value: truncateText(metric.value, 24),
      detail: metric.detail ? truncateText(metric.detail, maxMetricDetailLength) : undefined,
    })),
    risks: (request.result?.riskItems ?? []).slice(0, 2).map((item) => truncateText(item, 72)),
    next_steps: (request.result?.nextSteps?.length
      ? request.result?.nextSteps
      : request.result?.recommendations ?? []
    )
      .slice(0, 3)
      .map((item) => truncateText(item, 72)),
    missing: (request.result?.missingItems ?? []).slice(0, 2).map((item) => truncateText(item, 60)),
  };
}

function trimPayloadSize(payload: Record<string, unknown>) {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= maxPayloadCharacters) {
    return payload;
  }

  const compactPayload = {
    tool: payload.tool,
    deterministic_result: {
      headline: (payload.deterministic_result as Record<string, unknown>)?.headline ?? "",
      summary: (payload.deterministic_result as Record<string, unknown>)?.summary ?? "",
      next_steps: (payload.deterministic_result as Record<string, unknown>)?.next_steps ?? [],
    },
    compact_context: payload.compact_context,
    output_rules: payload.output_rules,
  };

  const compactSerialized = JSON.stringify(compactPayload);
  if (compactSerialized.length <= maxPayloadCharacters) {
    return compactPayload;
  }

  return {
    tool: payload.tool,
    deterministic_result: {
      headline: (payload.deterministic_result as Record<string, unknown>)?.headline ?? "",
      summary: (payload.deterministic_result as Record<string, unknown>)?.summary ?? "",
      next_steps: (payload.deterministic_result as Record<string, unknown>)?.next_steps ?? [],
    },
    compact_context: {},
    output_rules: payload.output_rules,
  };
}

async function runGuardedAssist(request: ToolAiRequest): Promise<GuardedAssistResponse> {
  const toolSlug = request.toolSlug ?? "";
  const execution = getToolExecutionProfile(toolSlug);
  const apiKey = process.env.GUARDED_ASSIST_API_KEY;
  const baseUrl = process.env.GUARDED_ASSIST_BASE_URL;
  const engine = process.env.GUARDED_ASSIST_ENGINE;

  if (execution.aiEscalation !== "optional-low-token") {
    throw new Error("This tool does not permit assisted output.");
  }

  if (!apiKey || !baseUrl || !engine) {
    throw new Error("Protected assist is not configured.");
  }

  const compactContext = slimContext(toolSlug, request.context ?? {});
  const compactResult = compactDeterministicResult(request);

  const systemPrompt =
    request.locale === "zh"
      ? "你是电商工具的极简补充层。不要重算，不要虚构，不要提及任何引擎、供应方或技术实现。只能基于已给定结果返回极短补充。"
      : "You are a minimal ecommerce assist layer. Do not recompute or invent. Do not mention any engine, provider, vendor, or implementation detail. Only return very short guidance grounded in the provided result.";

  const userPayload = trimPayloadSize({
    tool: toolSlug,
    deterministic_result: compactResult,
    compact_context: compactContext,
    output_rules:
      request.locale === "zh"
        ? {
            language: "zh-CN",
            sections: ["一句话判断", "最先执行", "注意事项"],
            body_limit: "每段不超过 70 汉字",
            banned_terms: "不得提及任何模型、型号、公司、供应商、接口或技术路线",
          }
        : {
            language: "en-US",
            sections: ["Decision", "Act first", "Watch-outs"],
            body_limit: "Each body under 120 characters",
            banned_terms: "Do not mention any model, vendor, company, provider, API, or implementation path",
          },
  });

  const requestedMaxTokens = Math.min(
    execution.hardCapTokens,
    execution.targetOutputTokens + maxCompletionSlackTokens,
  );

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: engine,
      max_tokens: requestedMaxTokens,
      temperature: 0.1,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Protected assist request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const content = payload.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonResponse(content);
  if (!parsed.sections?.length) {
    throw new Error("Protected assist response did not include sections.");
  }

  return {
    mode: "guarded-assist" as const,
    tokenBudget: {
      input: payload.usage?.prompt_tokens ?? execution.targetInputTokens,
      output: payload.usage?.completion_tokens ?? requestedMaxTokens,
      hardCap: requestedMaxTokens,
    },
    sections: parsed.sections.map((section) => ({
      title: sanitizeAssistText(section.title, 40),
      body: sanitizeAssistText(section.body, 180),
    })),
  };
}

export async function POST(request: Request) {
  let body: ToolAiRequest | null = null;
  try {
    body = (await request.json()) as ToolAiRequest;
    const toolSlug = body.toolSlug ?? "";
    const tool = getToolBySlug(toolSlug);

    if (!tool) {
      return NextResponse.json({ error: "Unknown tool slug." }, { status: 404 });
    }

    const execution = getToolExecutionProfile(toolSlug);
    if (execution.aiEscalation !== "optional-low-token") {
      return NextResponse.json(
        { error: "This tool does not permit assisted output." },
        { status: 400 },
      );
    }

    const output = await runGuardedAssist(body);
    return NextResponse.json(output, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Protected assist route failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
