"use client";

import { useMemo, useState } from "react";
import type { SupportedLocale } from "@/lib/i18n";

type Branch = "missing-core" | "keyword-only" | "objection-gap" | "proof-gap" | "compliance-risk" | "answer-ready";
type ImportStatus = "idle" | "loading" | "success" | "partial" | "error";

type FormState = {
  marketplace: string;
  asin: string;
  category: string;
  title: string;
  bullets: string;
  buyer: string;
  useCases: string;
  keywords: string;
  questions: string;
  description: string;
  reviews: string;
  facts: string;
};

type Result = {
  branch: Branch;
  confidence: "low" | "medium" | "high";
  current: string;
  evidence: string[];
  actions: string[];
  dont: string[];
  review: string[];
  missing: string[];
  draft: Draft | null;
};

type NormalizedInput = {
  marketplace: string;
  asin?: string;
  category: string;
  title: string;
  bullets: string[];
  buyer: string;
  useCases: string[];
  keywords: string[];
  questions: string[];
  description?: string;
  reviews?: string;
  facts?: string;
  publishableCopy: string;
};

type AiPromptPayload = {
  marketplace: string;
  asin?: string;
  category: string;
  title: string;
  bullets: string[];
  targetBuyer: string;
  useCases: string[];
  keywords: string[];
  buyerQuestions: string[];
  optionalContext?: {
    description?: string;
    reviewSummary?: string;
    productFacts?: string;
  };
};

type Draft = {
  title: string;
  bullets: string[];
  description: string;
  searchTerms: string;
  modules: string[];
  coverage: Array<{
    question: string;
    covered: string;
    placement: string;
    answer: string;
  }>;
  proof: string[];
};

const labelsZh = {
  category: "产品类目",
  title: "当前标题",
  bullets: "至少 3 条当前五点",
  buyer: "具体目标买家",
  useCases: "3 个核心使用场景",
  keywords: "5-10 个目标关键词",
  questions: "3-5 个买家/Alexa 问句",
};

const labelsEn = {
  category: "product category",
  title: "current title",
  bullets: "at least 3 current bullets",
  buyer: "specific target buyer",
  useCases: "3 core use cases",
  keywords: "5-10 target keywords",
  questions: "3-5 buyer/Alexa questions",
};

const emptyState: FormState = {
  marketplace: "US",
  asin: "",
  category: "",
  title: "",
  bullets: "",
  buyer: "",
  useCases: "",
  keywords: "",
  questions: "",
  description: "",
  reviews: "",
  facts: "",
};

function splitLines(value: string) {
  return value
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTerms(value: string) {
  return value
    .split(/,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function compactText(value: string, maxChars: number) {
  const compacted = value.replace(/\s+/g, " ").trim();
  return compacted.length > maxChars ? `${compacted.slice(0, maxChars).trim()}...` : compacted;
}

function normalizeForEvaluation(form: FormState): NormalizedInput {
  const bullets = splitLines(form.bullets).slice(0, 6).map((item) => compactText(item, 260));
  const useCases = splitLines(form.useCases).slice(0, 5).map((item) => compactText(item, 180));
  const keywords = splitTerms(form.keywords).slice(0, 12).map((item) => compactText(item, 80));
  const questions = splitLines(form.questions).slice(0, 6).map((item) => compactText(item, 220));
  const description = compactText(form.description, 900);
  const reviews = compactText(form.reviews, 700);
  const facts = compactText(form.facts, 700);

  return {
    marketplace: form.marketplace,
    asin: compactText(form.asin, 80) || undefined,
    category: compactText(form.category, 180),
    title: compactText(form.title, 260),
    bullets,
    buyer: compactText(form.buyer, 180),
    useCases,
    keywords,
    questions,
    description: description || undefined,
    reviews: reviews || undefined,
    facts: facts || undefined,
    publishableCopy: [form.title, form.bullets, form.description, form.facts].map((item) => compactText(item, 1200)).join(" "),
  };
}

function buildAiPromptPayload(input: NormalizedInput): AiPromptPayload {
  const optionalContext = {
    description: input.description,
    reviewSummary: input.reviews,
    productFacts: input.facts,
  };
  const compactOptional = Object.fromEntries(
    Object.entries(optionalContext).filter(([, value]) => Boolean(value)),
  ) as AiPromptPayload["optionalContext"];

  return {
    marketplace: input.marketplace,
    ...(input.asin ? { asin: input.asin } : {}),
    category: input.category,
    title: input.title,
    bullets: input.bullets,
    targetBuyer: input.buyer,
    useCases: input.useCases,
    keywords: input.keywords,
    buyerQuestions: input.questions,
    ...(compactOptional && Object.keys(compactOptional).length > 0 ? { optionalContext: compactOptional } : {}),
  };
}

function includesAny(value: string, terms: string[]) {
  const lower = value.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function missingCore(input: NormalizedInput, locale: SupportedLocale) {
  const labels = locale === "zh" ? labelsZh : labelsEn;
  const missing: string[] = [];
  if (!input.category) missing.push(labels.category);
  if (!input.title) missing.push(labels.title);
  if (input.bullets.length < 3) missing.push(labels.bullets);
  if (!input.buyer) missing.push(labels.buyer);
  if (input.useCases.length < 3) missing.push(labels.useCases);
  if (input.keywords.length < 5) missing.push(labels.keywords);
  if (input.questions.length < 3) missing.push(labels.questions);
  return missing;
}

function determineBranch(input: NormalizedInput, locale: SupportedLocale): Branch {
  if (missingCore(input, locale).length > 0) return "missing-core";

  const proofTerms = ["best", "safest", "clinically proven", "non-toxic", "guaranteed", "100%", "fda approved", "medical grade", "child safe", "fireproof", "waterproof", "lifetime"];
  const complianceTerms = ["medical", "children", "baby", "supplement", "cosmetic", "battery", "chemical", "food contact", "treat", "cure", "prevent"];
  const objectionTerms = ["fit", "fits", "compatible", "clean", "cleaning", "setup", "noise", "smell", "return", "small apartment", "travel mug", "not ideal"];
  const genericBuyer = ["everyone", "all users", "daily use", "home", "gift", "useful"];

  if (includesAny(input.publishableCopy, complianceTerms)) return "compliance-risk";
  if (includesAny(input.publishableCopy, proofTerms)) return "proof-gap";
  if (includesAny([...input.questions, input.reviews || ""].join(" "), objectionTerms) && !includesAny(input.bullets.join(" "), ["not ideal", "compatible", "clearance", "fits", "cleaning"])) {
    return "objection-gap";
  }
  if (includesAny([input.buyer, input.useCases.join(" "), input.questions.join(" ")].join(" "), genericBuyer)) return "keyword-only";
  return "answer-ready";
}

function createDraft(input: NormalizedInput, branch: Branch): Draft {
  const keywords = input.keywords;
  const questions = input.questions.slice(0, 5);
  const buyer = input.buyer || "target shoppers";
  const firstKeyword = keywords[0] || "Amazon product";
  const secondKeyword = keywords[1] || "buyer-ready listing";
  const useCases = input.useCases;
  const factSentence = input.facts || "Add verified dimensions, materials, compatibility, and limitations before publishing final copy.";
  const cautiousPrefix = branch === "proof-gap" || branch === "compliance-risk" ? "Proof-safe " : "";

  return {
    title: `${cautiousPrefix}${firstKeyword} for ${buyer}, ${secondKeyword} with Clear Use Cases and Buyer-Fit Details`,
    bullets: [
      `Built for ${buyer}: addresses ${useCases[0] || "the main use case"} with clear fit and use guidance.`,
      `Use-case ready: explains ${useCases[1] || "how shoppers should use the product"} without hiding practical limits.`,
      "Question-friendly details: places compatibility, sizing, material, and setup facts where shoppers can find them quickly.",
      "Keyword coverage without stuffing: keeps primary terms visible while reserving variants for Search Terms and A+ support copy.",
      "Expectation control: states best-fit and not-ideal conditions so buyer questions can be answered more directly.",
    ],
    description: `This listing draft positions the product for ${buyer}. It connects the main keyword set to real shopping questions, then turns use cases into direct answer-ready copy. Before publishing, verify every factual detail: ${factSentence}`,
    searchTerms: keywords
      .slice(2)
      .filter((term, index, arr) => arr.indexOf(term) === index)
      .join(", "),
    modules: [
      "Buyer Fit: answer who this product is best for and who should choose a different option.",
      "Use Case Proof: show the top three usage scenarios with concrete product facts.",
      "Compatibility and Limits: explain size, material, setup, fit, and not-ideal conditions.",
      "Question Answer Block: answer the most likely Alexa / buyer questions in plain English.",
    ],
    coverage: questions.map((question, index) => ({
      question,
      covered: index === 0 ? "Partly covered" : "Weakly covered",
      placement: index === 0 ? "Title, Bullet 1, A+ Buyer Fit" : "Bullet, A+ FAQ, image text",
      answer: `Answer directly with verified product facts for ${buyer}; avoid unsupported claims or absolute promises.`,
    })),
    proof: [
      "Verify dimensions, material, compatibility, warranty, safety, and performance statements before publishing.",
      "Do not use best, safest, guaranteed, medical, or certification claims unless proof is available.",
      "If limitations exist, state them clearly instead of hiding them in the description.",
    ],
  };
}

function evaluate(input: NormalizedInput, locale: SupportedLocale): Result {
  const branch = determineBranch(input, locale);
  const missing = missingCore(input, locale);
  return locale === "zh" ? evaluateZh(input, branch, missing) : evaluateEn(input, branch, missing);
}

function evaluateZh(input: NormalizedInput, branch: Branch, missing: string[]): Result {
  if (branch === "missing-core") {
    return {
      branch,
      confidence: "low",
      current: "当前输入不足，不能生成完整 Listing 草稿。请先补齐核心资料，再提交生成面向 Alexa for Shopping 的优化建议。",
      evidence: missing.map((item) => `缺少或不足：${item}。`),
      actions: ["补齐必填输入后再提交生成。", "目标买家必须具体。", "买家问句要覆盖尺寸、适配、使用场景、限制条件或清洁维护等真实疑问。"],
      dont: ["不要在缺少目标买家、使用场景或买家问句时生成标题和五点。", "不要用默认完整草稿掩盖数据缺口。"],
      review: ["补齐必填输入后重新提交；先检查问句覆盖，再决定是否发布 Listing 改动。"],
      missing,
      draft: null,
    };
  }

  const sharedMissing = ["未接入 Seller Central 后台数据、真实 Review 原文和转化数据，因此输出不能证明流量或销量变化。"];
  const copy: Record<Exclude<Branch, "missing-core">, Omit<Result, "branch" | "draft">> = {
    "keyword-only": {
      confidence: "medium",
      current: "当前更接近 keyword-only：关键词足够，但目标买家、场景或问句仍偏泛，不能等同于 Alexa 问答就绪。",
      evidence: ["关键词数量已满足最低要求。", "目标买家或使用场景存在泛化表达。", "买家问句需要更贴近尺寸、兼容性、限制、清洁或使用前后顾虑。"],
      actions: ["先把泛场景改成具体购买场景。", "把关键词分配到 title、bullet、A+、Search Terms 和 FAQ。", "补充不适用条件，避免只写优点。"],
      dont: ["不要把所有关键词塞进标题。", "不要把关键词覆盖误判为 Alexa answer-ready。"],
      review: ["发布后 7-14 天看 CTR、CVR、新 Q&A 和 Review 新异议。"],
      missing: sharedMissing,
    },
    "objection-gap": {
      confidence: "medium",
      current: "当前是 objection-gap：Listing 有卖点，但没有充分回答买家在问句、Review 或 Q&A 中暴露的疑虑。",
      evidence: ["买家问句或 Review/Q&A 摘要包含适配、清洁、尺寸、兼容或使用限制问题。", "当前五点仍以通用好处为主。", "产品事实应该进入 bullet、A+、FAQ 或图片文案。"],
      actions: ["把最高频疑问放进 Bullet 1-2。", "新增 A+ 模块回答适用/不适用、兼容性和限制条件。", "把问句逐条映射到可见 Listing 位置。"],
      dont: ["不要隐藏限制条件。", "不要只增加关键词而不回答买家疑虑。"],
      review: ["7-14 天后检查新 Q&A 和 Review 是否继续重复同一疑虑。"],
      missing: sharedMissing,
    },
    "proof-gap": {
      confidence: "medium",
      current: "当前是 proof-gap：可发布文案中出现需要证明的功效、绝对化或安全表达，必须降级为可证明语言。",
      evidence: ["标题、五点、描述或产品事实中包含 best / safest / guaranteed / 100% / waterproof / medical 等高风险表达。", "未提供测试、认证、材质证明或可核验依据。"],
      actions: ["把绝对化表达改成事实描述。", "只保留用户能证明的尺寸、材料、兼容性和使用条件。", "在合规提醒中列出需要证据的句子。"],
      dont: ["不要 invent certifications。", "不要写医疗、儿童安全、永久保证或绝对性能承诺。"],
      review: ["发布前先人工核对证据；发布后观察关于功效、材质、安全或兼容性的追问和差评。"],
      missing: ["缺少支持强声明的证据。", ...sharedMissing],
    },
    "compliance-risk": {
      confidence: "medium",
      current: "当前是 compliance-risk：可发布文案包含儿童、食品接触、医疗、安全、电池/电器等敏感因素，草稿必须保守。",
      evidence: ["敏感词只来自标题、五点、描述或产品事实等可发布文案。", "敏感类目不能使用未经证明的安全、健康、功效或绝对化承诺。"],
      actions: ["先删除无证据功效和安全承诺。", "把材料、尺寸、兼容性和使用限制写清楚。", "需要认证时只写用户能提供证明的认证名称。"],
      dont: ["不要承诺治疗、预防、儿童安全、绝对安全或平台无法证明的功效。", "不要把敏感风险藏到长描述里。"],
      review: ["发布前做合规人工复核；发布后观察买家问题、退货原因和 Review 中是否出现安全/适配疑虑。"],
      missing: ["缺少合规证明、认证或测试依据。", ...sharedMissing],
    },
    "answer-ready": {
      confidence: "high",
      current: "当前接近 answer-ready：必填输入完整，买家、场景、关键词和问句能支撑一版英文 Listing 草稿。",
      evidence: ["必填输入已覆盖。", "目标买家和核心使用场景具体。", "买家问句可以映射到 title、bullet、A+、FAQ 和 Search Terms。"],
      actions: ["先发布结构化草稿中最确定的 title、前两条 bullet 和 A+ 问答模块。", "把变体关键词放入 Search Terms，避免标题堆砌。", "保留 not ideal for 和限制条件。"],
      dont: ["不要承诺 Alexa 会推荐或引用。", "不要声称排名、流量或销量必然提升。"],
      review: ["7-14 天后看 CTR、CVR、新增 Q&A、Review 新异议和可用的 Sponsored Prompts/Prompts report。"],
      missing: sharedMissing,
    },
  };
  return { branch, draft: createDraft(input, branch), ...copy[branch] };
}

function evaluateEn(input: NormalizedInput, branch: Branch, missing: string[]): Result {
  if (branch === "missing-core") {
    return {
      branch,
      confidence: "low",
      current: "Core inputs are missing, so the full Listing draft is blocked. Complete the core fields, then generate an Alexa for Shopping assessment.",
      evidence: missing.map((item) => `Missing or insufficient: ${item}.`),
      actions: ["Complete required inputs before generating.", "Make the target buyer specific.", "Use buyer questions about fit, compatibility, use cases, limits, cleaning, or setup."],
      dont: ["Do not generate title and bullets without buyer, use-case, and question inputs.", "Do not use a default draft to hide input gaps."],
      review: ["After completing required inputs, generate again and check question coverage before publishing Listing changes."],
      missing,
      draft: null,
    };
  }

  const sharedMissing = ["Seller Central data, original review text, and conversion data are not connected, so this output cannot prove traffic or sales movement."];
  const copy: Record<Exclude<Branch, "missing-core">, Omit<Result, "branch" | "draft">> = {
    "keyword-only": {
      confidence: "medium",
      current: "This is closer to keyword-only: keywords are present, but buyer, use case, or question coverage is still too generic to call it Alexa answer-ready.",
      evidence: ["Keyword count meets the minimum.", "Buyer or use-case language is generic.", "Questions need to be closer to fit, compatibility, limits, cleaning, or setup objections."],
      actions: ["Turn generic scenarios into specific buying contexts.", "Place keywords across title, bullets, A+, Search Terms, and FAQ.", "Add not-ideal conditions instead of only benefits."],
      dont: ["Do not stuff every keyword into the title.", "Do not treat keyword coverage as Alexa answer-readiness."],
      review: ["After 7-14 days, review CTR, CVR, new Q&A, and new review objections."],
      missing: sharedMissing,
    },
    "objection-gap": {
      confidence: "medium",
      current: "This is an objection-gap: the Listing has selling points, but buyer questions, reviews, or Q&A objections are not answered clearly enough.",
      evidence: ["Buyer questions mention fit, cleaning, size, compatibility, limits, or setup.", "Current bullets are still benefit-led.", "Product facts should move into bullets, A+, FAQ, or image text."],
      actions: ["Move the highest-frequency objection into Bullet 1-2.", "Add A+ content for fit, limits, compatibility, and use cases.", "Map each question to a visible Listing placement."],
      dont: ["Do not hide limitations.", "Do not add keywords without answering buyer doubts."],
      review: ["After 7-14 days, check whether new Q&A and reviews repeat the same objection."],
      missing: sharedMissing,
    },
    "proof-gap": {
      confidence: "medium",
      current: "This is a proof-gap: publishable copy contains claims that need evidence, so strong language must be downgraded to verifiable facts.",
      evidence: ["Title, bullets, description, or product facts contain high-risk terms such as best, safest, guaranteed, 100%, waterproof, or medical.", "No test, certification, or verified proof was supplied."],
      actions: ["Replace absolute claims with factual descriptions.", "Keep only provable dimensions, materials, compatibility, and use conditions.", "List each sentence that needs evidence."],
      dont: ["Do not invent certifications.", "Do not make medical, child-safety, permanent guarantee, or absolute performance claims."],
      review: ["Before publishing, manually verify evidence; after publishing, monitor questions about claims, materials, safety, and compatibility."],
      missing: ["Evidence for strong claims is missing.", ...sharedMissing],
    },
    "compliance-risk": {
      confidence: "medium",
      current: "This is a compliance-risk: publishable copy includes sensitive child, food-contact, medical, safety, battery, or regulated-product factors.",
      evidence: ["Sensitive terms are detected only from title, bullets, description, or product facts.", "Sensitive categories cannot use unverified safety, health, performance, or absolute claims."],
      actions: ["Remove unsupported health and safety promises.", "Clarify material, size, compatibility, and limits.", "Only name certifications that can be proven."],
      dont: ["Do not promise treatment, prevention, child safety, absolute safety, or unsupported performance.", "Do not bury sensitive risks in the long description."],
      review: ["Run a manual compliance review before publishing; after publishing, monitor buyer questions, returns, and reviews for safety or fit concerns."],
      missing: ["Compliance proof, certification, or test evidence is missing.", ...sharedMissing],
    },
    "answer-ready": {
      confidence: "high",
      current: "This is close to answer-ready: required inputs are complete, and buyer, use case, keyword, and question coverage can support an English Listing draft.",
      evidence: ["Required inputs are covered.", "Target buyer and core use cases are specific.", "Buyer questions can map to title, bullets, A+, FAQ, and Search Terms."],
      actions: ["Publish the most certain title, first two bullets, and A+ Q&A module first.", "Move keyword variants into Search Terms instead of stuffing the title.", "Keep not-ideal-for and limitation language."],
      dont: ["Do not claim Alexa will recommend or cite the product.", "Do not claim ranking, traffic, or sales will improve."],
      review: ["After 7-14 days, review CTR, CVR, new Q&A, new review objections, and any available Sponsored Prompts / Prompts report."],
      missing: sharedMissing,
    },
  };
  return { branch, draft: createDraft(input, branch), ...copy[branch] };
}

function fieldClass() {
  return "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";
}

export function AlexaListingBuilder({ locale = "zh" }: { locale?: SupportedLocale }) {
  const zh = locale === "zh";
  const [form, setForm] = useState<FormState>(emptyState);
  const [submittedForm, setSubmittedForm] = useState<FormState | null>(null);
  const [dirty, setDirty] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importMessage, setImportMessage] = useState("");
  const submittedInput = useMemo(() => (submittedForm ? normalizeForEvaluation(submittedForm) : null), [submittedForm]);
  const result = useMemo(() => (submittedInput ? evaluate(submittedInput, locale) : null), [submittedInput, locale]);
  const aiPromptPayload = useMemo(() => (submittedInput && result?.draft ? buildAiPromptPayload(submittedInput) : null), [submittedInput, result?.draft]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(Boolean(submittedForm));
  }

  function clearForm() {
    setForm(emptyState);
    setSubmittedForm(null);
    setDirty(false);
    setImportStatus("idle");
    setImportMessage("");
  }

  function generate() {
    setSubmittedForm(form);
    setDirty(false);
  }

  async function importAsin() {
    const asin = form.asin.trim();
    if (!asin) {
      setImportStatus("error");
      setImportMessage(zh ? "请先输入 ASIN 或 Amazon 商品链接。" : "Enter an ASIN or Amazon product URL first.");
      return;
    }

    setImportStatus("loading");
    setImportMessage(zh ? "正在读取公开商品页信息..." : "Importing public product page details...");
    try {
      const response = await fetch(`/api/amazon-listing?marketplace=${encodeURIComponent(form.marketplace)}&asinOrUrl=${encodeURIComponent(asin)}`);
      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error("import failed");
      }

      const snapshot = payload.snapshot as {
        title?: string;
        breadcrumbs?: string[];
        bulletPoints?: string[];
        ratingText?: string;
        reviewCountText?: string;
        bestSellersRank?: string;
        subCategoryRank?: string;
        hasAPlus?: boolean;
        productDimensionsText?: string;
        itemWeightText?: string;
      };
      const imported: Partial<FormState> = {
        category: snapshot.breadcrumbs?.join(" > ") || form.category,
        title: snapshot.title || form.title,
        bullets: snapshot.bulletPoints?.length ? snapshot.bulletPoints.slice(0, 5).join("\n") : form.bullets,
        description: snapshot.hasAPlus
          ? "A+ content appears to be present on the public page. Paste key A+ sections here if they matter for buyer questions."
          : "No A+ content was detected from the public page. Paste description or A+ summary here if available.",
        reviews: [snapshot.ratingText, snapshot.reviewCountText].filter(Boolean).join("; ") || form.reviews,
        facts: [snapshot.bestSellersRank, snapshot.subCategoryRank, snapshot.productDimensionsText, snapshot.itemWeightText].filter(Boolean).join("\n") || form.facts,
        questions: form.questions || defaultQuestions(snapshot.title || form.title, zh),
      };

      setForm((current) => ({ ...current, ...imported }));
      setDirty(Boolean(submittedForm));
      setImportStatus(snapshot.bulletPoints?.length ? "success" : "partial");
      setImportMessage(
        snapshot.bulletPoints?.length
          ? zh
            ? "已导入公开页面可读取的信息。Review、Q&A 或 A+ 抓不到时，请手动补充。"
            : "Imported the public page fields we could read. Manually add Review, Q&A, or A+ details if missing."
          : zh
            ? "只读取到部分公开信息。请手动补充五点、Review/Q&A 或 A+ 摘要。"
            : "Only partial public details were imported. Manually add bullets, Review/Q&A, or A+ summary.",
      );
    } catch {
      setImportStatus("error");
      setImportMessage(
        zh
          ? "暂时无法读取这个 ASIN 的公开页面信息。你可以继续手动填写，页面不会丢失已输入内容。"
          : "We could not import this ASIN right now. You can continue manually; your current inputs are preserved.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Alexa for Shopping Listing Tool</p>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-slate-950 md:text-5xl">
            {zh ? "Alexa for Shopping 商品文案构建器" : "Alexa for Shopping Listing Builder"}
          </h1>
          <p className="mt-3 text-xl font-semibold text-slate-800">{zh ? "面向 Amazon AI 购物助手的 Listing 评估与优化草稿" : "AI-ready Amazon Listing assessment and draft optimization"}</p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            {zh
              ? "为 AI 辅助购物准备你的 Amazon Listing。输入 ASIN，或手动补充商品资料、关键词、买家问题和定位，工具会帮助整理更清晰的标题、卖点、FAQ 和适合 Alexa for Shopping 等 AI 购物助手理解的回答型文案。"
              : "Prepare your Amazon listing for AI-assisted shopping. Upload or paste your product details, keywords, buyer questions, and positioning. The tool helps turn them into clearer titles, bullets, FAQs, and answer-ready copy for Alexa for Shopping and other AI shopping assistants."}
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[430px_1fr] lg:px-8">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={(event) => event.preventDefault()}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{zh ? "输入信息" : "Inputs"}</h2>
              <p className="mt-1 text-sm text-slate-500">{zh ? "ASIN 导入是辅助；所有字段都可以手动修改。" : "ASIN import is optional; every field remains editable."}</p>
            </div>
            <button type="button" onClick={() => setInfoOpen(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              {zh ? "功能说明" : "How it works"}
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="block text-sm font-semibold">
              ASIN
              <input className={fieldClass()} value={form.asin} onChange={(event) => update("asin", event.target.value)} placeholder={zh ? "输入 ASIN 或 Amazon 商品链接" : "Enter ASIN or Amazon product URL"} />
            </label>
            <button type="button" onClick={importAsin} disabled={importStatus === "loading"} className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400">
              {importStatus === "loading" ? (zh ? "读取中..." : "Importing...") : zh ? "读取 ASIN 信息 / Import ASIN" : "Import ASIN"}
            </button>
            {importMessage ? (
              <p className={`mt-3 rounded-md p-3 text-sm leading-6 ${importStatus === "error" ? "bg-rose-50 text-rose-900" : "bg-sky-50 text-sky-950"}`}>
                {importMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              {zh ? "站点/语言" : "Marketplace / language"}
              <select className={fieldClass()} value={form.marketplace} onChange={(event) => update("marketplace", event.target.value)}>
                <option value="US">Amazon US / English</option>
                <option value="UK">Amazon UK / English</option>
                <option value="CA">Amazon CA / English</option>
              </select>
            </label>
            <TextField label={zh ? "产品类目" : "Product category"} value={form.category} onChange={(value) => update("category", value)} placeholder="Home & Kitchen > Small Appliances" />
            <TextArea label={zh ? "当前标题" : "Current title"} value={form.title} onChange={(value) => update("title", value)} placeholder="Paste current Amazon title" />
            <TextArea label={zh ? "当前五点" : "Current bullets"} value={form.bullets} onChange={(value) => update("bullets", value)} placeholder="Paste 3-5 bullets, one per line" />
            <TextField label={zh ? "目标买家" : "Target buyer"} value={form.buyer} onChange={(value) => update("buyer", value)} placeholder="small apartment renters" />
            <TextArea label={zh ? "3 个核心使用场景" : "3 core use cases"} value={form.useCases} onChange={(value) => update("useCases", value)} placeholder="One use case per line" />
            <TextArea label={zh ? "5-10 个目标关键词" : "5-10 target keywords"} value={form.keywords} onChange={(value) => update("keywords", value)} placeholder="Comma or line separated keywords" />
            <TextArea label={zh ? "3-5 个买家/Alexa 问句" : "3-5 buyer/Alexa questions"} value={form.questions} onChange={(value) => update("questions", value)} placeholder="Is this good for small apartments?" />
            <TextArea label={zh ? "可选：当前描述或 A+ 摘要" : "Optional: current description or A+ summary"} value={form.description} onChange={(value) => update("description", value)} />
            <TextArea label={zh ? "可选：Review / Q&A 摘要" : "Optional: review / Q&A summary"} value={form.reviews} onChange={(value) => update("reviews", value)} />
            <TextArea label={zh ? "可选：产品事实、限制、兼容性" : "Optional: product facts, limits, compatibility"} value={form.facts} onChange={(value) => update("facts", value)} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={clearForm} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              {zh ? "清空 / Clear" : "Clear"}
            </button>
            <button type="button" onClick={generate} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              {zh ? "提交生成 / Generate" : "Generate"}
            </button>
          </div>
        </form>

        <div className="space-y-5">
          {!result ? <WaitingState locale={locale} dirty={dirty} /> : null}
          {result && dirty ? <WaitingState locale={locale} dirty={dirty} compact /> : null}
          {aiPromptPayload ? <PromptPayloadBoundary payload={aiPromptPayload} locale={locale} /> : null}
          {result?.draft && submittedInput ? <AlexaOpportunityReport result={result} draft={result.draft} input={submittedInput} locale={locale} /> : result ? <MissingCoreBlock missing={result.missing} locale={locale} /> : null}
        </div>
      </section>

      {infoOpen ? <InfoModal result={result} locale={locale} onClose={() => setInfoOpen(false)} /> : null}
    </main>
  );
}

function defaultQuestions(title: string, zh: boolean) {
  if (zh) {
    return ["Who is this best for?", "What problem does this product solve?", "What should buyers check before purchasing?"].join("\n");
  }
  return ["Who is this best for?", "What problem does this product solve?", "What should buyers check before purchasing?"].join("\n");
}

function TextField({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input className={fieldClass()} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <textarea className={`${fieldClass()} min-h-24 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function WaitingState({ locale, dirty, compact = false }: { locale: SupportedLocale; dirty: boolean; compact?: boolean }) {
  const zh = locale === "zh";
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${compact ? "border-amber-200 bg-amber-50" : ""}`}>
      <h2 className="text-xl font-bold">{dirty ? (zh ? "输入已变更" : "Inputs changed") : zh ? "等待提交" : "Waiting for submission"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {dirty
          ? zh
            ? "你修改了输入。点击“提交生成 / Generate”后，右侧才会基于最新内容重新生成结果。"
            : "Inputs changed. Click Generate to refresh the result from the latest content."
          : zh
            ? "填写 ASIN 或手动补充资料后，点击“提交生成 / Generate”查看 Alexa for Shopping Listing 评估和草稿。"
            : "Enter an ASIN or fill the form, then click Generate to see the Alexa for Shopping Listing assessment and draft."}
      </p>
    </section>
  );
}

function PromptPayloadBoundary({ payload, locale }: { payload: AiPromptPayload; locale: SupportedLocale }) {
  const zh = locale === "zh";
  const requiredCount =
    5 +
    payload.bullets.length +
    payload.useCases.length +
    payload.keywords.length +
    payload.buyerQuestions.length +
    Object.keys(payload.optionalContext || {}).length;
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
      <p className="font-bold">{zh ? "AI 输入边界已压缩" : "AI input boundary compressed"}</p>
      <p className="mt-1">
        {zh
          ? `未来接 AI 时，只提交 ${requiredCount} 组必要字段；空字段、UI 文案和超长文本已排除或截断。`
          : `Future AI calls will send only ${requiredCount} necessary field groups; empty fields, UI copy, and long text are excluded or truncated.`}
      </p>
    </section>
  );
}

function AlexaOpportunityReport({ result, draft, input, locale }: { result: Result; draft: Draft; input: NormalizedInput; locale: SupportedLocale }) {
  const zh = locale === "zh";
  const questions = input.questions.slice(0, 3);
  const buyer = input.buyer || (zh ? "目标买家" : "target buyer");
  const category = input.category || (zh ? "这个品类" : "this category");
  const isRisk = result.branch === "proof-gap" || result.branch === "compliance-risk";
  const isObjection = result.branch === "objection-gap";
  const isKeyword = result.branch === "keyword-only";

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-950">AI Answer-Ready 架构</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{result.branch} · {result.confidence}</span>
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-tight">
          {zh ? "Alexa for Shopping 商品文案机会报告" : "Alexa for Shopping Listing Opportunity Report"}
        </h2>
        <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
          <p>
            {zh
              ? `这个 ${category} Listing 现在最危险的不是关键词不够，而是买家问题没有被写成“答案”。对于 ${buyer}，AI 购物助手不会替你脑补卖点，它只会更愿意解释那些结构清楚、proof 充足、边界明确的商品。`
              : `This ${category} listing is not mainly short on keywords. It is short on answer structure. For ${buyer}, an AI shopping assistant will not invent the sales logic for you; it will favor listings that are easier to explain, prove, and compare.`}
          </p>
          <p>
            {isRisk
              ? zh
                ? "我会先把这份 Listing 放进 Proof Chain 证明链修复。强声明不是不能写，而是必须有证据；没有证据的 best、guaranteed、安全、功效类表达，会让文案看起来大胆，但也会让买家和平台都更难信任。"
                : "I would put this listing into Proof Chain repair first. Strong claims are not the issue; unsupported claims are. Best, guaranteed, safety, and performance language must be backed by proof before it deserves buyer trust."
              : isObjection
                ? zh
                  ? "这份 Listing 有卖点，但没有锁住异议。买家真正卡住的地方通常不是“这个产品是什么”，而是“它适不适合我、会不会踩坑、为什么比别人可靠”。这些问题没有被回答，流量来了也会犹豫。"
                  : "The listing has selling points, but it has not locked the objections. Buyers are not only asking what the product is; they are asking whether it fits them, what can go wrong, and why it is safer than alternatives."
                : isKeyword
                  ? zh
                    ? "现在更像 keyword-only：词有了，但购买场景和问句覆盖还虚。关键词能帮你进场，答案结构才决定买家和 AI 助手是否愿意继续解释你。"
                    : "This is still keyword-only. Keywords get you into the conversation; answer structure determines whether buyers and AI assistants can keep explaining you."
                  : zh
                    ? "这份 Listing 已经接近 answer-ready，可以进入结构化改写。现在要做的不是堆更多词，而是把买家问题、场景、proof 和 Search Terms 放到各自正确的位置。"
                    : "This listing is close to answer-ready. The next move is not more keyword stuffing; it is putting buyer questions, use cases, proof, and Search Terms into the right places."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black">{zh ? "买家问题覆盖图" : "Buyer Question Coverage Map"}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {zh
            ? "Listing 要像一个销售顾问一样回答问题。下面这些问句如果不在标题、五点、A+ 或 FAQ 里被回答，AI 购物助手也很难替你讲清楚。"
            : "A listing has to behave like a sales consultant. If these questions are not answered in title, bullets, A+, or FAQ, AI shopping assistants have less to work with."}
        </p>
        <div className="mt-4 grid gap-3">
          {(questions.length ? questions : draft.coverage.map((row) => row.question).slice(0, 3)).map((question, index) => (
            <div key={question} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <p className="font-black text-slate-950">{question}</p>
              <p className="mt-1">
                {zh
                  ? `${index === 0 ? "先放进 Title 和 Bullet 1" : "放进 Bullet / A+ / FAQ"}。回答必须用可验证的产品事实，不用空泛形容词。`
                  : `${index === 0 ? "Place this in Title and Bullet 1" : "Place this in Bullet / A+ / FAQ"}. Answer with verifiable product facts, not loose adjectives.`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black">{zh ? "Listing 改造方案" : "Listing Rewrite Strategy"}</h3>
        <DraftBlock title={zh ? "标题打法：品类 + 场景 + 风险控制 + 人群" : "Title play: category + use case + risk control + buyer"} content={draft.title} />
        <div className="mt-4">
          <h4 className="text-sm font-black text-slate-500">{zh ? "五点打法：每条回答一个买家问题" : "Bullet play: one buyer question per bullet"}</h4>
          <ol className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
            {draft.bullets.map((bullet) => (
              <li key={bullet} className="rounded-md bg-slate-50 p-3">{bullet}</li>
            ))}
          </ol>
        </div>
        <DraftBlock title={zh ? "Search Terms：补语义，不重复标题" : "Search Terms: semantic coverage, not title repetition"} content={draft.searchTerms || "Add keyword variants that are not already repeated in visible copy."} />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h3 className="text-xl font-black">{zh ? "AI 边缘化风险" : "AI Marginalization Risk"}</h3>
        <p className="mt-3 text-sm leading-7">
          {zh
            ? "未来不是关键词最多的 Listing 赢，而是最像标准答案的 Listing 赢。继续只做关键词优化，短期可能有曝光；但当竞品把 proof、FAQ、场景和限制条件写得更清楚，你会慢慢失去 AI 助手替你解释商品的机会。"
            : "The future is not won by the listing with the most keywords. It is won by the listing that looks most like a clear answer. If competitors structure proof, FAQ, use cases, and limits better than you, they become easier for AI assistants to explain."}
        </p>
        <p className="mt-3 text-sm font-bold leading-7">
          {zh
            ? "下一步适合进入完整 AI Listing 改造：标题、五点、A+、FAQ、Search Terms、图片文案一起改。只改标题，是修表面；重建 Answer-Ready 架构，才是修系统。"
            : "Next step: a full AI-ready listing rebuild across title, bullets, A+, FAQ, Search Terms, and image copy. A title rewrite fixes the surface; an Answer-Ready architecture fixes the system."}
        </p>
      </div>
    </section>
  );
}

function MissingCoreBlock({ missing, locale }: { missing: string[]; locale: SupportedLocale }) {
  const zh = locale === "zh";
  return (
    <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-950">
      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">missing-core · low</span>
      <h2 className="text-xl font-bold">{zh ? "Listing 草稿已阻断" : "Listing Draft Blocked"}</h2>
      <p className="mt-2 text-sm leading-6">{zh ? "还不能生成完整 Listing。请先补齐必填输入，避免把关键词堆砌伪装成 Alexa 问句覆盖。" : "A full Listing draft cannot be generated yet. Complete the required inputs first so keyword stuffing is not disguised as Alexa question coverage."}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {missing.map((item) => (
          <span key={item} className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function InfoModal({ result, locale, onClose }: { result: Result | null; locale: SupportedLocale; onClose: () => void }) {
  const zh = locale === "zh";
  const modules: Array<[string, string[]]> = result
    ? [
        [zh ? "关键证据" : "Key Evidence", result.evidence],
        [zh ? "优先动作" : "Priority Actions", result.actions],
        [zh ? "不要做什么" : "Do Not Do", result.dont],
        [zh ? "复查规则" : "Review Rules", result.review],
        [zh ? "缺失数据" : "Missing Data", result.missing],
      ]
    : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{zh ? "功能说明" : "How it works"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {zh ? "主结果区优先展示 Listing 优化草稿。这里保留六模块依据，用来检查本次生成为什么得出这个判断。" : "The main result prioritizes the Listing draft. This panel keeps the six-module rationale for checking why this result was generated."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">
            {zh ? "关闭" : "Close"}
          </button>
        </div>
        {result ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm font-semibold">{zh ? "当前分支" : "Current branch"}: {result.branch}</div>
            {modules.map(([title, items]) => (
              <div key={title} className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-bold">{title}</h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                  {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>{zh ? "暂无。" : "None."}</li>}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{zh ? "提交生成后，这里会展示当前结果的六模块依据。" : "After generation, this panel will show the six-module rationale."}</p>
        )}
      </section>
    </div>
  );
}

function DraftBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-slate-500">{title}</h3>
      <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{content}</p>
    </div>
  );
}
