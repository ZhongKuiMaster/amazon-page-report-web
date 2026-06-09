import type { ToolDefinition } from "@/lib/tools";

export type AmazonToolHelpEntry = {
  slug: string;
  tier: "A" | "B";
  title: {
    en: string;
    zh: string;
  };
  summary: {
    en: string;
    zh: string;
  };
  items: Array<{
    label: {
      en: string;
      zh: string;
    };
    body: {
      en: string;
      zh: string;
    };
  }>;
};

export const amazonToolHelpEntries: AmazonToolHelpEntry[] = [
  {
    slug: "amazon-product-compliance",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to decide the likely compliance lane first, then correct only the evidence gaps that matter.",
      zh: "这页的正确用法，是先判断商品会落入哪条合规路径，再只纠正真正重要的证据缺口。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. If the listing claim, material, or age signal is unusual, be ready to confirm that one point only.",
          zh: "准备好 ASIN 或商品链接。如果商品宣称、材质或适龄信息比较特殊，再额外确认那一个关键信号即可。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live page first. Manual changes should be used only when the live listing does not reflect the true product situation.",
          zh: "先读取实时商品页。只有当当前商品页不能反映真实商品情况时，才需要手动修改输入。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide what proof lane to gather next, not to pretend the listing is already approved.",
          zh: "结果的用途，是决定下一步该补哪条证据链，而不是假装商品已经自动过审。",
        },
      },
      {
        label: { en: "Do not use when", zh: "什么时候先别用" },
        body: {
          en: "If you do not yet know which product or claim you are testing, narrow that down first.",
          zh: "如果你连要评估哪一款商品、哪一种宣称都还没定下来，先别急着跑这页。",
        },
      },
    ],
  },
  {
    slug: "amazon-competitor-monitoring",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to watch a small set of real competitors and turn change into a concrete response path.",
      zh: "这页适合监控一小组真实竞品，并把变化压成明确的响应动作。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring your own PDP plus a short list of real competitor ASINs or URLs.",
          zh: "准备自己的商品页，再带上少量真正重要的竞品 ASIN 或链接。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live watchlist first. Leave advanced watch rules closed unless you already know the exact scenario you want to test.",
          zh: "先加载实时监控列表。除非你已经明确要测试哪一种场景，否则先不要展开高级监控规则。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide whether the next move belongs to pricing, listing, image, or offer work.",
          zh: "结果的用途，是判断下一步该先处理定价、商品页、图片，还是优惠方案。",
        },
      },
    ],
  },
  {
    slug: "amazon-keyword-tracker",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "This page works best when the first watch baseline comes from the live listing and real competitor pages.",
      zh: "这页最好的用法，是让第一轮关键词基线来自实时商品页和真实竞品页面。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring your own PDP and a few direct competitors. You do not need to hand-build a giant keyword list first.",
          zh: "准备自己的商品页和几个直接竞品，不需要一开始就手工整理一大串关键词。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live baseline first. Use manual keyword edits only after the first watch result is visible.",
          zh: "先加载实时基线。只有在第一轮监控结果已经出来后，才考虑手动改关键词。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "The result should tell you whether to defend, recover, or reopen listing work.",
          zh: "结果应该帮助你判断，是继续防守、尽快恢复，还是重新处理商品页优化。",
        },
      },
    ],
  },
  {
    slug: "amazon-listing-optimization",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to diagnose the live listing first, then keep the rewrite focused on the first real blocker.",
      zh: "这页应该先诊断实时商品页，再把改写聚焦到第一处真实阻塞上。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring your PDP and the closest competitor set. That gives the tool a real market frame.",
          zh: "准备自己的商品页和最接近的竞品组，这样工具才有真实市场参照。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Start with the live load. Keep category and keyword overrides closed unless the first read is clearly off.",
          zh: "先从实时读取开始。除非第一轮判断明显不准，否则不要急着展开类目和关键词覆盖。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the output to choose the first rewrite lane, not to start rewriting everything at once.",
          zh: "结果是用来决定第一轮改写主线的，不是拿来一次性重写整页。",
        },
      },
    ],
  },
  {
    slug: "amazon-price-tracker",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page when the decision is really about current price posture, not about the whole competitor landscape.",
      zh: "当你的问题本质上是当前价格姿态，而不是整个竞品战场时，这页最合适。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the live PDP and the most relevant comparison set.",
          zh: "准备当前商品页和最相关的对比组。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live comparison first. Leave response strategy in manual overrides unless you have a specific reaction path in mind.",
          zh: "先加载实时对比。除非你已经有明确应对路径，否则先别展开响应策略类覆盖项。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide whether to hold, move, or escalate into broader competitor monitoring.",
          zh: "结果应该帮助你判断，是先守住、调整，还是升级到更广的竞品监控。",
        },
      },
    ],
  },
  {
    slug: "amazon-category-ungating",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to judge whether the ungating path is realistic before you spend time collecting the wrong paperwork.",
      zh: "这页适合先判断类目解封路径是否现实，避免一开始就把资料准备错方向。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. If you already know the category and brand, that is enough for the first read.",
          zh: "准备 ASIN 或商品链接。如果你已经知道类目和品牌信息，第一轮判断就够用了。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live product page first. Leave invoices, brand relationship, and supply-path overrides closed until the first result says you need them.",
          zh: "先读取实时商品页。发票、品牌关系、供货路径这些覆盖项，等第一轮结果提示需要时再展开。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide whether to continue collecting proof, switch path, or stop before paperwork gets wasted.",
          zh: "结果是用来判断要继续补资料、换路径，还是及时停下来，避免白白耗掉资料准备成本。",
        },
      },
    ],
  },
  {
    slug: "amazon-image-compliance-checker",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to quickly judge whether the current image set can stay live, then fix the riskiest image first.",
      zh: "这页适合先判断当前图片组能不能继续在线使用，再优先修最高风险的那张图。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. If you already know which image is being challenged, keep that note ready.",
          zh: "准备 ASIN 或商品链接。如果你已经知道哪张图片最有争议，把那一点记在手边即可。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live image set first. Only add manual notes when the current page is missing the image context you need.",
          zh: "先读取当前在线图片组。只有当页面缺少你要判断的图片背景时，再补充手动说明。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide which image to fix first and whether the issue is safety, policy, or sequence.",
          zh: "结果是用来判断先修哪张图，以及问题到底是安全、政策，还是图片顺序。",
        },
      },
    ],
  },
  {
    slug: "amazon-search-optimization",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to see whether search visibility is strong enough to keep scaling, then fix the biggest drag first.",
      zh: "这页适合先判断搜索可见性是否还值得继续放大，再优先修最大的拖累点。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. A short note on the main search term is enough if you already know it.",
          zh: "准备 ASIN 或商品链接。如果你已经知道主搜索词，补一条简短备注就够了。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Start from the live product page. Leave deeper keyword tweaks for later unless the first read is obviously off target.",
          zh: "先从实时商品页开始。除非第一轮判断明显跑偏，否则先不要急着改更深的关键词设置。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide whether the next move should fix relevance, conversion drag, or search coverage.",
          zh: "结果是用来判断下一步该先修相关性、转化拖累，还是搜索覆盖。",
        },
      },
    ],
  },
  {
    slug: "amazon-rank-tracker",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to tell whether rank movement is meaningful enough to react to or should stay in watch mode.",
      zh: "这页适合判断排名变化到底值不值得立刻响应，还是继续观察就够了。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. If you know the main keyword or category frame, keep that nearby for context.",
          zh: "准备 ASIN 或商品链接。如果你知道主关键词或类目背景，放在手边作为参考就行。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live page first. Add manual context only when the current page clearly misses the signal you care about.",
          zh: "先读取实时商品页。只有当当前页面明显缺少你关心的信号时，再补手动背景。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide whether to react now, wait for another check, or escalate into a deeper search review.",
          zh: "结果是用来判断现在就响应、继续等下一次复查，还是升级到更深的搜索检查。",
        },
      },
    ],
  },
  {
    slug: "amazon-competitor-analysis",
    tier: "A",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Use this page to find the one competitive gap worth attacking first instead of diffing every detail.",
      zh: "这页适合先找出最值得下手的一处竞争缺口，而不是把所有细节都逐项对比一遍。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring your own product page and a small set of direct competitors. The closest few are enough.",
          zh: "准备自己的商品页和一小组直接竞品。最接近的几家就够了。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live comparison first. Keep extra analysis angles closed until the first gap is clear.",
          zh: "先加载实时对比。等第一处关键缺口看清楚后，再决定要不要展开更多分析角度。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to choose the first test move, not to launch a full rewrite or pricing war at once.",
          zh: "结果是用来决定第一步测试动作的，不是让你一上来就全面重写或直接打价格战。",
        },
      },
    ],
  },
  {
    slug: "amazon-profit-analyzer",
    tier: "B",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Keep this page simple: load the real listing first, then override only the few cost assumptions that change the call.",
      zh: "这页的正确用法很简单：先加载真实商品页，再只修改会改变结论的少数成本假设。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. Have rough COGS or inbound cost ready only if the live read is not enough.",
          zh: "准备 ASIN 或商品链接。只有在实时结果还不够时，再准备货成本或头程成本。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Start with live data. Use overrides only for the numbers Amazon cannot know on its own.",
          zh: "先读取实时数据。只对 Amazon 无法自动知道的数字做覆盖。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the result to decide whether the SKU is worth further work or needs a margin fix first.",
          zh: "结果的用途，是判断这个 SKU 值不值得继续推进，还是应先修利润结构。",
        },
      },
    ],
  },
  {
    slug: "amazon-fba-calculator",
    tier: "B",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: "Start from the live listing and keep manual edits to the few cost drivers that really matter.",
      zh: "先从实时商品页开始，再把手动修改压缩到真正关键的几个成本项。",
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: "Bring the ASIN or product URL. Product cost and inbound cost are optional follow-ups, not first-screen requirements.",
          zh: "准备 ASIN 或商品链接。货成本和头程成本是后续补充，不是首屏必填。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Load the live listing first. Only then adjust the few cost assumptions that are clearly different in your case.",
          zh: "先读取实时商品页，然后只改那些在你场景里明显不同的成本假设。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: "Use the output to decide whether the fee burden is workable before you move into deeper profit or sourcing decisions.",
          zh: "结果的用途，是先判断费用负担是否成立，再决定要不要进入更深的利润或采购决策。",
        },
      },
    ],
  },
];

const amazonToolHelpIndex = new Map(
  amazonToolHelpEntries.map((entry) => [entry.slug, entry]),
);

export function getAmazonToolHelpEntry(slug: string) {
  return amazonToolHelpIndex.get(slug);
}

export function getToolHelpEntry(tool: ToolDefinition): AmazonToolHelpEntry {
  const configured = amazonToolHelpIndex.get(tool.slug);
  if (configured) {
    return configured;
  }

  const primaryInputs = tool.requiredInputs.slice(0, 3).join(" / ");
  const primaryOutputs = tool.outputs.slice(0, 3).join(" / ");

  return {
    slug: tool.slug,
    tier: "B",
    title: { en: "How to use this tool", zh: "如何使用这个工具" },
    summary: {
      en: tool.summary,
      zh: tool.summary,
    },
    items: [
      {
        label: { en: "Prepare", zh: "先准备什么" },
        body: {
          en: primaryInputs
            ? `Bring the core inputs first: ${primaryInputs}.`
            : "Bring the minimum context this page needs before you start.",
          zh: primaryInputs
            ? `先准备这页最核心的输入：${primaryInputs}。`
            : "先准备这页完成判断所需的最少信息。",
        },
      },
      {
        label: { en: "Fill", zh: "怎么填" },
        body: {
          en: "Fill only the necessary fields first. Advanced adjustments should come later, not before the first result.",
          zh: "先只填写必要字段。高级调整应放在第一轮结果之后，而不是之前。",
        },
      },
      {
        label: { en: "Use the result", zh: "结果怎么用" },
        body: {
          en: primaryOutputs
            ? `Use the output to make the next decision around: ${primaryOutputs}.`
            : "Use the result to decide the next operational move, not just to read the page once.",
          zh: primaryOutputs
            ? `结果应帮助你推进下一步判断，例如：${primaryOutputs}。`
            : "结果的用途，是帮助你推进下一步动作，而不是只看一眼页面。",
        },
      },
    ],
  };
}
