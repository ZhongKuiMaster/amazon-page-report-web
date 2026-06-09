import { getToolBySlug, type ToolDefinition } from "@/lib/tools";

export type AmazonSupportPageKind =
  | "before-you-use"
  | "how-to"
  | "vs"
  | "examples";

export type AmazonSupportPageEntry = {
  toolSlug: string;
  supportSlug: AmazonSupportPageKind;
  title: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  intro: {
    en: string;
    zh: string;
  };
  sections: Array<{
    heading: {
      en: string;
      zh: string;
    };
    body: {
      en: string[];
      zh: string[];
    };
  }>;
};

export const amazonSeoBattleToolSlugs = [
  "amazon-profit-analyzer",
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-shipping-calculator",
  "amazon-sales-estimator",
  "amazon-price-tracker",
  "amazon-product-compliance",
  "amazon-image-compliance-checker",
  "amazon-category-ungating",
  "amazon-listing-optimization",
  "amazon-keyword-tracker",
  "amazon-competitor-monitoring",
] as const;

export const amazonSupportPagePlan: ReadonlyArray<{
  toolSlug: (typeof amazonSeoBattleToolSlugs)[number];
  minimumSupportTypes: AmazonSupportPageKind[];
}> = [
  { toolSlug: "amazon-profit-analyzer", minimumSupportTypes: ["before-you-use", "examples"] },
  { toolSlug: "amazon-fba-calculator", minimumSupportTypes: ["before-you-use"] },
  { toolSlug: "tariff-calculator-amazon", minimumSupportTypes: ["before-you-use"] },
  { toolSlug: "amazon-shipping-calculator", minimumSupportTypes: ["before-you-use"] },
  { toolSlug: "amazon-sales-estimator", minimumSupportTypes: ["examples", "before-you-use"] },
  { toolSlug: "amazon-price-tracker", minimumSupportTypes: ["vs", "before-you-use"] },
  { toolSlug: "amazon-product-compliance", minimumSupportTypes: ["before-you-use", "how-to"] },
  { toolSlug: "amazon-image-compliance-checker", minimumSupportTypes: ["how-to", "examples"] },
  { toolSlug: "amazon-category-ungating", minimumSupportTypes: ["before-you-use", "how-to"] },
  { toolSlug: "amazon-listing-optimization", minimumSupportTypes: ["how-to", "examples"] },
  { toolSlug: "amazon-keyword-tracker", minimumSupportTypes: ["how-to", "before-you-use"] },
  { toolSlug: "amazon-competitor-monitoring", minimumSupportTypes: ["vs", "before-you-use"] },
] as const;

export const amazonSupportPageEntries: AmazonSupportPageEntry[] = [
  {
    toolSlug: "amazon-profit-analyzer",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use the Amazon Profit Analyzer",
      zh: "使用 Amazon 利润分析器前先确认什么",
    },
    description: {
      en: "Know which inputs matter before using the Amazon Profit Analyzer, so the result reflects real margin pressure instead of guessed math.",
      zh: "先确认哪些输入最关键，再使用 Amazon 利润分析器，避免结果建立在拍脑袋的成本假设上。",
    },
    intro: {
      en: "This page exists for one job: make sure the profit check starts from the few assumptions that actually change the decision.",
      zh: "这页只做一件事：帮你在跑利润判断前，先抓住真正会改变结论的那几个前提。",
    },
    sections: [
      {
        heading: { en: "Bring the live listing first", zh: "先加载真实商品页" },
        body: {
          en: [
            "Use the ASIN or product URL first so the page can anchor the decision to the live selling context before you touch manual overrides.",
            "If you start with only a rough idea of price or fees, the result becomes a planning sketch instead of a reliable go or no-go call.",
          ],
          zh: [
            "优先使用 ASIN 或商品链接，让页面先基于真实售价和商品上下文做判断，再考虑手动覆盖。",
            "如果一开始只有模糊的价格或费用印象，结果更像粗略草稿，不足以支持是否继续推进。",
          ],
        },
      },
      {
        heading: { en: "Only override what is truly unknown to the system", zh: "只覆盖系统确实不知道的成本" },
        body: {
          en: [
            "COGS, inbound shipping, coupon pressure, and return drag matter only when they differ from the default operating assumption enough to change the call.",
            "Do not expand the input surface just because you can fill more fields. Fill the fields that move the margin decision.",
          ],
          zh: [
            "货成本、头程、优惠券压力和退货拖累，只有在明显偏离默认经营假设时，才值得手动改。",
            "不要因为字段存在就把整张表全部填满，真正该填的是会改变利润判断的部分。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-fba-calculator",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use the Amazon FBA Calculator",
      zh: "使用 Amazon FBA 计算器前先确认什么",
    },
    description: {
      en: "Use the Amazon FBA Calculator with the right live listing and only a few meaningful overrides.",
      zh: "先选对真实商品页，再用少量有意义的覆盖项来使用 Amazon FBA 计算器。",
    },
    intro: {
      en: "The FBA page works best when it starts from a live listing and only asks you to correct the few cost drivers that Amazon cannot infer on its own.",
      zh: "FBA 页面最佳用法，是先读取真实 listing，再让你只纠偏 Amazon 无法自行推断的少数成本。",
    },
    sections: [
      {
        heading: { en: "Do not start with a blank cost sheet", zh: "不要从空白成本表开始" },
        body: {
          en: [
            "The live listing is already enough to establish the first fee direction, dimensional risk, and selling context.",
            "Manual cost entry should come second, not first.",
          ],
          zh: [
            "真实 listing 已经足够给出第一轮费用方向、尺寸风险和售卖背景。",
            "手动录成本应该是第二步，而不是首页主任务。",
          ],
        },
      },
      {
        heading: { en: "Override landed assumptions only when they are real", zh: "只有真实存在差异时才覆盖到岸假设" },
        body: {
          en: [
            "Product cost, inbound shipping, and storage duration should be changed only when your actual lane is materially different from the default read.",
            "That keeps the page useful as a decision tool instead of turning it into bookkeeping theater.",
          ],
          zh: [
            "货成本、头程运费和仓储周期，只有在你的真实经营路径明显不同于默认估计时才值得修改。",
            "这样页面才像一个决策工具，而不是一张账务表演页。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "tariff-calculator-amazon",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use the Amazon Tariff Calculator",
      zh: "使用 Amazon 关税计算器前先确认什么",
    },
    description: {
      en: "Clarify sourcing lane, delivery responsibility, and cost ownership before using the Amazon tariff calculator.",
      zh: "先厘清采购路径、交付责任和成本归属，再使用 Amazon 关税计算器。",
    },
    intro: {
      en: "Tariff math is useful only when the cost lane is real enough to avoid mixing supplier quotes, freight assumptions, and Amazon economics into one blurry number.",
      zh: "只有当成本路径足够真实时，关税测算才有价值，否则供应商报价、物流假设和 Amazon 费用会被混成一个模糊数字。",
    },
    sections: [
      {
        heading: { en: "Separate sourcing cost from Amazon fees", zh: "把采购成本和 Amazon 费用分开看" },
        body: {
          en: [
            "The tariff page should answer landed-cost pressure first, before the broader marketplace margin stack is discussed.",
            "That separation helps the operator see whether the trade problem is at the border, with the supplier, or inside the selling model.",
          ],
          zh: [
            "这页首先回答的是到岸成本压力，而不是直接把所有平台利润问题混在一起。",
            "分开之后，运营才能判断问题究竟出在关税、供应商，还是销售模型本身。",
          ],
        },
      },
      {
        heading: { en: "Bring the cleanest freight assumption you have", zh: "带入你手里最干净的物流假设" },
        body: {
          en: [
            "If freight or customs handling is still vague, use the result as a directional screen rather than a final unit-economics answer.",
            "This is the page to narrow the range, not to pretend uncertainty has disappeared.",
          ],
          zh: [
            "如果物流或报关处理仍然模糊，就把这次结果当方向筛选，而不是最终单件经济结论。",
            "这页的任务是缩小区间，不是假装不确定性已经消失。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-shipping-calculator",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use the Amazon Shipping Calculator",
      zh: "使用 Amazon 发货成本计算器前先确认什么",
    },
    description: {
      en: "Use the shipping calculator after clarifying shipment direction, replenishment rhythm, and the part of the burden you are truly trying to estimate.",
      zh: "先明确发货方向、补货节奏和你真正要估算的负担，再使用 Amazon 发货成本计算器。",
    },
    intro: {
      en: "This page should reduce operational uncertainty, not become another long form. Start with the shipment question you are actually trying to answer.",
      zh: "这页应该帮你减少履约不确定性，而不是再制造一张长表。先明确你到底要回答哪一个发货问题。",
    },
    sections: [
      {
        heading: { en: "Pick the decision first", zh: "先明确决策问题" },
        body: {
          en: [
            "Are you estimating whether a SKU can survive current shipping pressure, or whether the next replenishment plan still makes sense?",
            "The same calculator is more useful when the operator knows which call it is supposed to support.",
          ],
          zh: [
            "你是在判断某个 SKU 能否承受当前物流压力，还是在判断下一轮补货是否还成立？",
            "同一个计算器，在决策目标明确时才真正有用。",
          ],
        },
      },
      {
        heading: { en: "Do not stuff every logistics detail into first use", zh: "第一次使用不要塞满所有物流细节" },
        body: {
          en: [
            "Use a clean shipment assumption first, then correct only the variables that clearly change the answer.",
            "That keeps the shipping page fast enough to use in real operator workflows.",
          ],
          zh: [
            "先用一个干净的发货假设跑第一轮，再只修正真正会改变结论的变量。",
            "这样这页才适合真实运营场景里的快速判断。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-sales-estimator",
    supportSlug: "examples",
    title: {
      en: "Examples of when to use the Amazon Sales Estimator",
      zh: "哪些场景适合使用 Amazon 销量估算器",
    },
    description: {
      en: "See the common operator situations where an Amazon sales estimate is useful and where it should stay directional.",
      zh: "看看哪些常见运营场景适合用 Amazon 销量估算，哪些情况下它只能做方向参考。",
    },
    intro: {
      en: "The sales estimator is most useful when the team needs a range-based demand check before committing more work.",
      zh: "当团队在投入更深工作之前，只需要先做一轮区间式需求判断时，销量估算器最有价值。",
    },
    sections: [
      {
        heading: { en: "Good use cases", zh: "适合的使用场景" },
        body: {
          en: [
            "Use it before sourcing deeper, before expanding a catalog branch, or before deciding whether a niche deserves a closer margin review.",
            "It is also useful when a team needs to compare a few candidate ASINs without opening a full research workflow for each one.",
          ],
          zh: [
            "适合在深入采购前、扩展目录分支前，或者在判断某个细分是否值得继续做利润复核前使用。",
            "当团队只是想快速对比几个候选 ASIN，而不想为每个都开完整调研流程时，它也很好用。",
          ],
        },
      },
      {
        heading: { en: "When to treat the result as directional only", zh: "什么时候只能把它当方向参考" },
        body: {
          en: [
            "If traffic quality, variation structure, or seasonal timing are still unclear, the estimate should guide prioritization, not final inventory commitments.",
            "That is the difference between a screen and a forecast.",
          ],
          zh: [
            "如果流量质量、变体结构或季节性窗口仍不清楚，这个结果更适合帮助排优先级，而不是直接拍板库存。",
            "这就是筛选工具和预测工具之间的边界。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-price-tracker",
    supportSlug: "vs",
    title: {
      en: "Amazon Price Tracker vs Competitor Monitoring",
      zh: "Amazon 价格追踪 与 竞品监控怎么区分",
    },
    description: {
      en: "Know when price tracking is the right first tool and when you actually need broader competitor monitoring.",
      zh: "搞清楚什么时候应该先看价格追踪，什么时候其实需要更广的竞品监控。",
    },
    intro: {
      en: "These two tools are related, but they do not answer the same question. Price tracking is narrower and faster. Competitor monitoring is wider and more structural.",
      zh: "这两个工具彼此相关，但回答的问题不同。价格追踪更窄、更快；竞品监控更宽，也更偏结构判断。",
    },
    sections: [
      {
        heading: { en: "Use the price tracker when the decision is about immediate posture", zh: "当决策是当前价格姿态时，先用价格追踪" },
        body: {
          en: [
            "If the operator needs to know whether the current price is exposed, compressed, or out of line with the live pack, the price tracker is the fastest entry.",
            "It helps when the next move is likely a price adjustment, floor decision, or alert threshold review.",
          ],
          zh: [
            "如果运营想知道当前价格是否暴露、被压缩，或者明显偏离实时竞品，价格追踪是最快入口。",
            "当下一步可能是调价、守底价，或重新设预警阈值时，这页最适合先开。",
          ],
        },
      },
      {
        heading: { en: "Use competitor monitoring when the market move is broader than price", zh: "当市场动作不只是价格时，应该用竞品监控" },
        body: {
          en: [
            "If the team needs to watch assortment shifts, listing updates, image changes, or offer strategy around the price move, competitor monitoring is the better home.",
            "That tool is built for repeated watchlists, not just one immediate price call.",
          ],
          zh: [
            "如果团队还要一起看竞品的产品组合、listing 变化、图片更新或 offer 策略，就该用竞品监控。",
            "它更适合反复追踪，而不是只做一次即时调价判断。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-product-compliance",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use the Amazon Product Compliance Checker",
      zh: "使用 Amazon 商品合规检查前先确认什么",
    },
    description: {
      en: "Know what evidence, claims, and product context matter before using the Amazon compliance checker.",
      zh: "先确认哪些证据、宣称和商品上下文重要，再使用 Amazon 合规检查页。",
    },
    intro: {
      en: "The compliance page should start from the live product signal and the likely risk lane, not from a giant document checklist.",
      zh: "合规页应该从真实商品信号和高概率风险通道开始，而不是先扔给用户一大串资料清单。",
    },
    sections: [
      {
        heading: { en: "Start with the product signal, not the paperwork pile", zh: "先看商品信号，不要先扑向资料堆" },
        body: {
          en: [
            "Claims, age targeting, materials, and use context matter because they change the compliance lane the product falls into.",
            "The right question is which evidence lane the product is entering, not how many documents you can upload.",
          ],
          zh: [
            "宣称、适龄、人群定位、材质和使用场景之所以重要，是因为它们会改变商品落入的合规通道。",
            "真正的问题不是你能上传多少文件，而是这件商品要走哪条证据路径。",
          ],
        },
      },
      {
        heading: { en: "Use overrides only when the listing signal is incomplete", zh: "只有 listing 信号不完整时才做手动覆盖" },
        body: {
          en: [
            "If the live page already makes the main claim and category risk visible, the first call should come from that signal.",
            "Manual correction is for edge cases, not the default path.",
          ],
          zh: [
            "如果真实页面已经能看出核心宣称和类目风险，第一轮判断就应先基于这些信号完成。",
            "手动纠偏是给边缘情况准备的，不该成为默认路径。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-image-compliance-checker",
    supportSlug: "how-to",
    title: {
      en: "How to use the Amazon Image Compliance Checker",
      zh: "如何使用 Amazon 图片合规检查页",
    },
    description: {
      en: "Use the Amazon image checker to confirm whether the current gallery is clean enough before a creative rewrite or reshoot.",
      zh: "使用 Amazon 图片合规检查页，先判断当前图片组是否干净合规，再决定是否要重做创意或重拍。",
    },
    intro: {
      en: "This page works best as a first-screen compliance pass. The goal is not to redesign the gallery. The goal is to catch the blocker fast.",
      zh: "这页最适合作为第一轮合规筛查。目标不是重新设计整个图组，而是先快速找出阻塞项。",
    },
    sections: [
      {
        heading: { en: "Load the live gallery before discussing better creative", zh: "先读取真实图组，再谈更好的创意" },
        body: {
          en: [
            "The first question is whether the current image set contains compliance-breaking elements or avoidable rejection pressure.",
            "Creative improvement comes later, after the current gallery is clean enough to survive review.",
          ],
          zh: [
            "第一步先回答：当前图组里有没有会触发违规或明显增加驳回压力的元素。",
            "创意优化是下一步，前提是现有图组先足够干净，能过审。",
          ],
        },
      },
      {
        heading: { en: "Keep the result tied to action", zh: "让结果直接指向动作" },
        body: {
          en: [
            "If the page flags a main-image issue, the next move is to replace or strip that asset first.",
            "If the page flags a secondary-frame issue, the team should fix that slot before expanding the gallery discussion into storytelling.",
          ],
          zh: [
            "如果页面指出主图问题，下一步就应该优先替换或清理那张图。",
            "如果是辅图问题，就先修对应位置，再考虑更大的叙事和转化表达。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-category-ungating",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use the Amazon Category Ungating Checker",
      zh: "使用 Amazon 类目解封检查前先确认什么",
    },
    description: {
      en: "See what to gather before running an Amazon ungating check, without turning the page into a document dump.",
      zh: "了解在跑 Amazon 类目解封检查前该准备什么，同时避免把页面变成资料堆。",
    },
    intro: {
      en: "Ungating work fails when evidence is vague, not when the page is too short. Start from the likely approval path and only then check proof gaps.",
      zh: "类目解封失败的原因，通常是证据链模糊，而不是页面不够长。先确认可能的审批路径，再检查证据缺口。",
    },
    sections: [
      {
        heading: { en: "Identify the approval story first", zh: "先确认审批故事线" },
        body: {
          en: [
            "The page should help answer whether the likely path is invoice-led, brand-relationship-led, or documentation-led.",
            "Without that story, even a long packet of files stays weak.",
          ],
          zh: [
            "这页应该先帮你判断，当前最可能的路径是发票型、品牌关系型，还是资料证明型。",
            "如果故事线不清楚，再多文件也会显得弱。",
          ],
        },
      },
      {
        heading: { en: "Do not front-load every proof field", zh: "不要一开始就摊开所有证据字段" },
        body: {
          en: [
            "Start with the ASIN and category situation. Then move into proof correction only if the first system call is incomplete.",
            "That keeps the page readable and keeps the operator focused on the approval blocker, not the whole archive.",
          ],
          zh: [
            "先从 ASIN 和类目情况开始，只有在系统第一轮判断不够清楚时，再进入证据纠偏层。",
            "这样页面才可读，运营也能聚焦真正的审批阻塞，而不是面对一整个资料库。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-listing-optimization",
    supportSlug: "how-to",
    title: {
      en: "How to use the Amazon Listing Optimization tool",
      zh: "如何使用 Amazon Listing 优化工具",
    },
    description: {
      en: "Use the listing optimization page to get a live-data-first content call instead of rewriting blindly.",
      zh: "用 Amazon Listing 优化工具先拿到基于 live data 的内容判断，而不是盲目重写。",
    },
    intro: {
      en: "This page should not begin as a copywriting exercise. It should begin as a diagnosis of what the live listing is failing to do.",
      zh: "这页不该从写文案开始，而应先诊断当前 live listing 没有完成什么任务。",
    },
    sections: [
      {
        heading: { en: "Load your PDP and the real competitor set", zh: "先加载自己的 PDP 和真实竞品组" },
        body: {
          en: [
            "The first value comes from reading your page against the real visible market, not from drafting new copy in isolation.",
            "That is why category and keyword assumptions should stay in overrides unless the live read is clearly wrong.",
          ],
          zh: [
            "这页的第一价值，来自把你的页面放进真实可见市场里比较，而不是脱离环境直接开始改写。",
            "所以类目和关键词假设应该收在 overrides 中，除非 live read 明显失真。",
          ],
        },
      },
      {
        heading: { en: "Use the result to choose the first rewrite lane", zh: "用结果决定第一轮改写该落在哪一层" },
        body: {
          en: [
            "Some listings need clearer positioning first. Others need better relevance coverage, proof, or page structure.",
            "The page is strongest when it narrows the rewrite to one lane instead of inviting a full rewrite everywhere.",
          ],
          zh: [
            "有些 listing 第一优先是定位不清，有些则是相关性覆盖、证明材料或页面结构出了问题。",
            "这页最强的时候，是把改写范围收窄到一条主线，而不是鼓励整页全面大改。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-keyword-tracker",
    supportSlug: "how-to",
    title: {
      en: "How to use the Amazon Keyword Tracker",
      zh: "如何使用 Amazon 关键词追踪工具",
    },
    description: {
      en: "Use the Amazon keyword tracker to defend, watch, and react to live keyword movement without overbuilding the first screen.",
      zh: "使用 Amazon 关键词追踪工具来防守、观察并响应关键词变化，同时避免把首屏做得过重。",
    },
    intro: {
      en: "The keyword tracker is most useful when it starts with the real listing and a real comparison set, then turns that into a compact watch decision.",
      zh: "关键词追踪工具最有价值的用法，是先读取真实 listing 和真实对比组，再把它压成一个紧凑的 watch 决策。",
    },
    sections: [
      {
        heading: { en: "Do not begin by hand-picking a giant keyword list", zh: "不要一开始就手工堆一大串关键词" },
        body: {
          en: [
            "The live page and competitor set should draft the first watch context.",
            "Manual tracked-keyword fields belong later, once the first baseline is visible.",
          ],
          zh: [
            "第一版 watch 上下文应该尽量由 live 页面和竞品组自己生成。",
            "手工指定大量追踪词，应当放到基线已经清楚之后。",
          ],
        },
      },
      {
        heading: { en: "Use the page for decisions, not passive watching", zh: "这页应该用来做决定，不是被动看盘" },
        body: {
          en: [
            "If the tracker shows pressure, the output should point to defend, recover, or reopen listing work.",
            "A watchlist without a response path quickly becomes dashboard furniture.",
          ],
          zh: [
            "如果工具显示出关键词压力，输出就应该指向防守、恢复，或重新打开 listing 优化。",
            "只有观察没有响应路径的 watchlist，很快就会变成摆设。",
          ],
        },
      },
    ],
  },
  {
    toolSlug: "amazon-competitor-monitoring",
    supportSlug: "before-you-use",
    title: {
      en: "Before you use Amazon Competitor Monitoring",
      zh: "使用 Amazon 竞品监控前先确认什么",
    },
    description: {
      en: "Use competitor monitoring after clarifying what kind of market change you actually need to watch.",
      zh: "先明确你到底想监控哪一类市场变化，再使用 Amazon 竞品监控。",
    },
    intro: {
      en: "Competitor monitoring is strongest when it starts narrow. A clean watchlist beats a vague market diary every time.",
      zh: "竞品监控最强的时候，是从一个窄而清晰的 watchlist 开始。干净的监控清单，比含糊的市场日记有用得多。",
    },
    sections: [
      {
        heading: { en: "Pick the change that matters", zh: "先挑出真正重要的变化" },
        body: {
          en: [
            "You may care about price moves, listing edits, image changes, offer posture, or catalog expansion. Those are not the same job.",
            "The tool becomes much sharper when the monitoring objective is obvious, even if the objective stays hidden in advanced controls by default.",
          ],
          zh: [
            "你可能在意的是价格、listing 改动、图片变化、offer 姿态，还是目录扩张。这些不是一件事。",
            "即使监控目标默认收进 advanced，只要团队心里清楚，工具结果就会更锋利。",
          ],
        },
      },
      {
        heading: { en: "Bring the smallest useful competitor set", zh: "带入最小但有用的竞品组" },
        body: {
          en: [
            "A short list of true market rivals is better than a bloated watchlist built from weak substitutes.",
            "The first page should make the change legible, not exhaust the operator.",
          ],
          zh: [
            "一小组真正的市场对手，比一长串质量很差的替代品更有价值。",
            "第一页的任务是把变化看清楚，不是先把运营累坏。",
          ],
        },
      },
    ],
  },
];

const supportPageIndex = new Map(
  amazonSupportPageEntries.map((entry) => [`${entry.toolSlug}:${entry.supportSlug}`, entry]),
);

export function getAmazonSupportPageEntry(toolSlug: string, supportSlug: string) {
  return supportPageIndex.get(`${toolSlug}:${supportSlug}`);
}

export function getAmazonSupportPagesForTool(toolSlug: string) {
  return amazonSupportPageEntries.filter((entry) => entry.toolSlug === toolSlug);
}

export function getAmazonSupportPageStaticParams() {
  return amazonSupportPageEntries.map((entry) => ({
    platform: "amazon",
    slug: entry.toolSlug,
    supportSlug: entry.supportSlug,
  }));
}

export function getAmazonSeoBattleTools() {
  return amazonSeoBattleToolSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((tool): tool is ToolDefinition => Boolean(tool));
}
