# Alexa Listing Builder P0 Product Spec

## 0. Scope

This document is the P0 product specification and page integration package for `Alexa Listing Builder`.

Ownership:

- Product line: Amazon product system.
- Execution thread: Alexa Listing Builder.
- Supervisor thread: ads agent / Amazon system owner.

P0 deliverable:

> A webpage-ready specification for a tool that helps a seller turn an existing Amazon listing into a draft that is easier for Amazon AI Shopping Assistant / Alexa for Shopping to understand, cite, and match to buyer questions.

P0 is not a generic listing rewriter. It must judge answer coverage gaps before drafting copy.

Out of scope:

- No Ads Workbench changes.
- No Ads Workbench diagnosis branch reuse.
- No Growth & Profit Planner logic.
- No FBA profit, promotion, inventory, or campaign diagnosis.
- No frontend implementation in this round.
- No claim that the output guarantees ranking, traffic, conversion, or Alexa recommendation.

## 1. Tool Identity

- Tool name: Alexa Listing Builder.
- Recommended slug: `amazon-alexa-listing-builder`.
- English title: Alexa Listing Builder for Amazon Listings.
- Chinese title: Alexa Listing Builder 亚马逊 AI 购物 Listing 编辑器.
- Category: Amazon / Listing / AI Shopping Readiness.
- One-line value proposition: Turn an existing Amazon listing, buyer scenario, keywords, and target buyer questions into an English listing draft that is easier for Alexa for Shopping to understand, cite, and match to shopper intent.

Chinese page positioning:

> 输入当前 Listing、目标买家、使用场景、关键词和买家问句，输出一套面向 Alexa for Shopping / Amazon AI Shopping Assistant 的英文 Listing 草稿，并明确哪些问题已覆盖、哪些证据不足、哪些表达不能写。

## 2. P0 Core Result

The P0 result must include:

1. A readiness judgment based on the submitted listing and buyer questions.
2. Evidence from user inputs.
3. Priority editing actions by listing surface.
4. Guardrails against bad listing changes.
5. Review rules after publishing changes.
6. Missing data that limits the conclusion.
7. A full English listing draft:
   - Suggested title.
   - Suggested five bullets.
   - Long description draft.
   - Search Terms suggestions.
   - A+ module suggestions.
   - Alexa question coverage table.
   - Compliance and proof reminders.

The result must help answer one decision:

> What should the seller change in the listing first so the product is more answerable for buyer questions, without making unverifiable or non-compliant claims?

## 3. Hard Boundaries

The page and output must state these boundaries:

- It does not guarantee Alexa recommendation.
- It does not guarantee ranking, traffic, sales, or conversion lift.
- It does not know Amazon internal algorithm weights.
- It does not access Seller Central, ad reports, SQP, order data, or backend listing data unless the user provides inputs.
- `Rufus` is historical terminology only; current shopper-facing product language should use `Alexa for Shopping` and `Amazon AI Shopping Assistant`.
- The tool can improve clarity, answer coverage, keyword placement, buyer-fit language, and evidence discipline; it cannot prove Amazon will cite the listing.

## 4. One-Vote Rejection Points

If any of the following appears in the P0 page, output, or implementation plan, the product is rejected:

1. It becomes a normal listing rewriter that only polishes title and bullets without judging Alexa question coverage gaps.
2. It claims or implies "guaranteed Alexa recommendation", "guaranteed ranking lift", "guaranteed traffic lift", or similar certainty.
3. It presents Rufus as the current main shopper-facing entry instead of historical capability merged into Alexa for Shopping.
4. It pretends to know the internal ranking formula of Alexa, A9, COSMO, or any Amazon retrieval/ranking system.
5. It generates a complete strong listing when required inputs are missing.
6. It only produces a keyword list and does not state where each keyword belongs: title, bullet, A+, Search Terms, FAQ, or image text.
7. It generates exaggerated, medical, absolute, safety, performance, or proof-required claims without warning.
8. It fails to separate `best for`, `not ideal for`, use cases, limitations, compatibility, and proof source.
9. Chinese UI contains internal demo English such as `Current result`, `Execution call`, `Generated recommendations`, `System-generated`, or similar implementation wording.
10. Error states expose traceback, local paths, HTTP stacks, script names, model provider errors, API keys, or raw internal exceptions.

## 5. Knowledge Boundary

### 5.1 Shared Sources Allowed

The tool may use:

- Amazon official help and public documentation.
- Alexa for Shopping official public information.
- Rufus historical materials, only as historical explanation.
- Moonsees, 跨境紫群, SellerSprite, AMALYTIX, Tinuiti, and similar method sources.
- Shared product rules: missing-input downgrade, no fabricated data, no guaranteed results.

### 5.2 Must Stay Isolated

The tool must not use or copy:

- Ads Workbench ad report diagnosis branches.
- Ads Workbench paid diagnosis CTA.
- Search Term Waste Cutter logic as a standalone listing module.
- Growth & Profit Planner profit, promotion, activity, and inventory logic.
- Any automatic ad optimization or campaign recommendation surface.

### 5.3 Source Priority

- A-level official sources define facts and hard boundaries.
- B-level expert/tool sources provide methods and structure.
- C-level practitioner sources provide scenarios, phrasing, and operational inspiration.
- If A-level conflicts with B/C, A-level wins.
- If user-provided product facts conflict with generic method content, user input wins unless compliance risk is detected.

## 6. Required Inputs

P0 form should be lightweight, but these inputs are required for a complete output:

1. Marketplace and language.
   - Default: `Amazon US / English`.
2. Product category.
3. Current title.
4. Current bullets.
   - Accept 3-5 pasted bullet points.
5. Target buyer.
   - Examples: `commuter`, `new parents`, `beginner golfer`, `small apartment renter`.
6. Three core use cases.
7. Five to ten target keywords or existing keywords.
8. Three to five target Alexa / buyer questions.
   - Example: `Is this good for small apartments?`

## 7. Optional Inputs

Strongly recommended, but not required:

1. Current description or A+ summary.
2. Review / Q&A summary.
3. Competitor ASINs or competitor selling points.
4. Size, material, compatibility, fit, suitable conditions, and not-suitable conditions.
5. Compliance-sensitive flags:
   - Children.
   - Food contact.
   - Medical or health claims.
   - Performance claims.
   - Safety claims.
   - Battery, electrical, or chemical risk.
   - Regulated category.

## 8. Branch Rules

The result must choose exactly one primary branch.

### 8.1 `missing-core`

Use when any required input is missing.

Behavior:

- Do not generate full title, bullets, description, Search Terms, or A+ draft.
- Output only the six-module diagnostic shell with a missing-data list and the next data to provide.
- It may show a short "what will be generated after data is complete" note, but no complete listing copy.

Typical triggers:

- No product category.
- No current title.
- Fewer than 3 current bullets.
- No target buyer.
- Fewer than 3 use cases.
- Fewer than 5 keywords.
- Fewer than 3 target buyer questions.

### 8.2 `keyword-only`

Use when the user provides enough keywords but weak buyer, scenario, limitation, proof, or question detail.

Behavior:

- Generate a downgraded draft.
- Warn that the result is mainly keyword placement, not true answer readiness.
- Prioritize use-case and question coverage before more keyword expansion.

Typical triggers:

- Strong keyword list but vague buyer.
- Generic use cases such as `daily use`, `home`, `gift`.
- Buyer questions repeat keywords but do not expose real concerns.

### 8.3 `objection-gap`

Use when the listing covers benefits but fails to answer buyer doubts.

Behavior:

- Draft must add limitation, fit, compatibility, "not ideal for", and FAQ/A+ answers.
- Do not hide tradeoffs.

Typical triggers:

- Review/Q&A summary mentions concerns not reflected in title, bullets, A+, or questions.
- Buyer asks about fit, apartment size, cleaning, compatibility, durability, noise, smell, battery, setup, or returns, but current listing does not answer.

### 8.4 `proof-gap`

Use when the listing or requested benefits include claims that need evidence.

Behavior:

- Draft must soften or qualify claims.
- Compliance/proof reminders must list the exact claims needing evidence.
- Do not invent certifications, test results, warranty, ratings, ingredients, safety proof, or compatibility.

Typical triggers:

- Words like `best`, `safest`, `clinically proven`, `non-toxic`, `guaranteed`, `100%`, `FDA approved`, `medical grade`, `child safe`, `fireproof`, `waterproof`, `lifetime`.
- User requests measurable superiority without proof.

### 8.5 `compliance-risk`

Use when product category, claims, buyer group, or sensitive flags create legal/platform risk.

Behavior:

- Draft must be conservative.
- The output may replace risky claims with evidence-required placeholders.
- The tool must clearly say which input makes the output downgraded.

Typical triggers:

- Health, medical, supplements, children, babies, food contact, pesticide, safety equipment, electronics, batteries, chemicals, cosmetics, or regulated products.
- Claiming treatment, prevention, cure, safety guarantee, or protected-class targeting.

### 8.6 `answer-ready`

Use only when required inputs are complete and the listing has enough scenario, buyer-fit, limitation, keyword, question, and proof detail.

Behavior:

- Generate the full listing draft.
- Still include proof reminders and review rules.
- Do not imply the listing is guaranteed to be cited by Alexa.

## 9. Fixed Output Contract

The output must always use these sections in this order.

### 9.1 Current Judgment

Must include:

- Primary branch: `missing-core`, `keyword-only`, `objection-gap`, `proof-gap`, `compliance-risk`, or `answer-ready`.
- One plain-language sentence explaining the judgment.
- Confidence level: low / medium / high.

Example:

> 当前判断：`objection-gap`。你提供了关键词和使用场景，但目标问句集中在尺寸、清洁和小空间适配，当前五点没有直接回答这些疑问，因此不能只继续堆关键词。

### 9.2 Key Evidence

Must include 3-6 bullets grounded in user input.

Good evidence examples:

- Current title includes `compact coffee maker`, but none of the bullets explain counter depth or cup clearance.
- Target buyer is `small apartment renter`, but no `best for` or `not ideal for` condition is stated.
- Buyer question asks about cleaning, but current listing only says `easy to use`.
- Keyword list includes `BPA free`, but no material or certification input was provided.

Bad evidence examples:

- "AI found opportunities."
- "The listing can be improved."
- "Amazon likes high quality listings."

### 9.3 Priority Actions

Must tell the seller what to edit first and where.

Allowed surfaces:

- Title.
- Bullet 1-5.
- Long description.
- A+ module.
- Search Terms.
- FAQ / Q&A seed answer.
- Image text suggestion.

Each action must include:

- Surface.
- Why this surface matters.
- What to add, remove, or move.

### 9.4 Do Not Do

Must block at least one wrong action.

Examples:

- Do not add all keywords to the title; keep the title readable and reserve variants for Search Terms.
- Do not claim `best for toddlers` unless the product is designed and documented for that use.
- Do not hide compatibility limits; Alexa-style answers need clear fit and limitation language.
- Do not copy competitor claims or invent certifications.

### 9.5 Review Rule

Must tell the seller how to review 7-14 days after publishing changes.

Suggested review signals:

- CTR.
- CVR.
- Sessions.
- New buyer Q&A.
- New review objections.
- Search query terms that start matching the revised use cases.
- Sponsored Prompts / Prompts report if the user has access.
- Customer messages or returns tied to compatibility/fit.

The review rule must not promise causal certainty.

### 9.6 Missing Data

Must list:

- Required inputs missing, if any.
- Optional inputs that would improve output quality.
- Claims that need proof.
- Sensitive category details that require caution.

If no required input is missing:

> 必填输入已覆盖；输出仍受限于用户未提供 Review/Q&A、竞品卖点、实际转化数据和后台搜索词数据。

### 9.7 Listing Draft

Do not include this section for `missing-core`.

Must include:

1. Suggested Title, in English.
2. Suggested Bullets, 5 bullets in English.
3. Long Description Draft, in English.
4. Search Terms Suggestions, in English.
5. A+ Module Suggestions, 3-5 modules.
6. Alexa Question Coverage Table.
7. Compliance / Proof Reminders.

## 10. Form Fields

Recommended fields for P0 page:

| Field | Required | UI Type | Default / Placeholder | Validation |
| --- | --- | --- | --- | --- |
| Marketplace and language | Yes | Select | Amazon US / English | Must be selected |
| Product category | Yes | Text input | `Home & Kitchen > Small Appliances` | Non-empty |
| Current title | Yes | Textarea | Paste current Amazon title | 20+ characters recommended |
| Current bullets | Yes | Textarea | Paste 3-5 bullet points, one per line | At least 3 non-empty lines |
| Target buyer | Yes | Text input | `small apartment renter` | Non-empty and specific |
| Core use cases | Yes | Textarea | 3 use cases, one per line | At least 3 non-empty lines |
| Target keywords | Yes | Textarea | 5-10 keywords, comma or line separated | At least 5 terms |
| Target buyer / Alexa questions | Yes | Textarea | 3-5 questions, one per line | At least 3 questions |
| Current description / A+ summary | No | Textarea | Optional | No validation |
| Review / Q&A summary | No | Textarea | Optional concerns from reviews or Q&A | No validation |
| Competitor ASINs or selling points | No | Textarea | Optional | No validation |
| Product facts and limits | No | Textarea | Size, material, compatibility, not ideal for | No validation |
| Compliance-sensitive flags | No | Checkbox group + textarea | Children, food contact, medical, safety, battery, regulated | If selected, force proof reminder |

## 11. Default Example Input

Use this seed example for page preview and QA.

Marketplace and language:

```text
Amazon US / English
```

Product category:

```text
Home & Kitchen > Small Appliances > Countertop Coffee Makers
```

Current title:

```text
Compact Single Serve Coffee Maker for K Cup Pods and Ground Coffee, Small Coffee Machine for Home Office Dorm
```

Current bullets:

```text
Brews coffee fast with one button operation.
Works with pods and ground coffee.
Compact size fits many kitchens and offices.
Removable drip tray for travel mugs.
Easy to clean water tank and reusable filter.
```

Target buyer:

```text
small apartment renters and dorm users who need quick coffee without taking much counter space
```

Core use cases:

```text
Making one cup before commuting.
Keeping a coffee maker on a small kitchen counter or dorm desk.
Switching between K Cup pods and ground coffee.
```

Target keywords:

```text
single serve coffee maker, compact coffee maker, K Cup coffee machine, small coffee maker, dorm coffee maker, coffee maker for apartment, ground coffee brewer, travel mug coffee maker
```

Target buyer / Alexa questions:

```text
Is this coffee maker good for small apartments?
Can it use both K Cup pods and ground coffee?
Will a travel mug fit under it?
Is it easy to clean in a dorm room?
```

Current description / A+ summary:

```text
No A+ content yet. Current description repeats the bullets and does not include a size chart or cleaning steps.
```

Review / Q&A summary:

```text
Buyers ask whether tall mugs fit, whether the reusable filter is included, and whether it splashes on short cups.
```

Competitor ASINs or selling points:

```text
Competitors emphasize slim width, cup height clearance, and pod/ground coffee flexibility.
```

Product facts and limits:

```text
8.2 inches wide, removable 7-inch drip tray clearance, reusable filter included. Not ideal for brewing a full carafe or serving multiple people at once.
```

Compliance-sensitive flags:

```text
Electrical appliance; no medical, child, food-contact material, or safety certification claim provided.
```

## 12. Default Example Output

### Current Judgment

当前判断：`objection-gap`，中等置信度。你已经提供了目标买家、使用场景和关键词，但买家问句集中在小空间、旅行杯高度、清洁和 pod/ground 兼容性，当前 Listing 没有足够直接回答这些问题。

### Key Evidence

- Current title says `Compact`, but does not state who it is best for or the counter-space scenario.
- Buyer questions ask whether a travel mug fits; current bullets only mention a removable drip tray.
- Review/Q&A summary says buyers ask about reusable filter inclusion and splashing, but current bullets do not answer both clearly.
- Product facts include `8.2 inches wide` and `7-inch drip tray clearance`; these are strong answer-ready details that should move into bullets and A+.
- The product is not ideal for full-carafe brewing; this limitation should be stated to avoid mismatched buyer expectations.

### Priority Actions

1. Title: keep the core keyword, but add the target buyer/use context. Do not overpack every keyword into the title.
2. Bullet 1-2: answer the highest-intent questions first: small apartment fit, pod/ground compatibility, and mug clearance.
3. A+ module: add a compact-size module and a "Fits / Not Ideal For" comparison so Alexa-style answers can cite clear fit conditions.
4. Search Terms: move keyword variants such as `dorm coffee maker` and `coffee maker for apartment` out of the title and into backend Search Terms if not already covered.
5. FAQ / Q&A seed answer: add direct answers for travel mug fit, reusable filter inclusion, cleaning, and splashing expectations.

### Do Not Do

- Do not claim it is the `best coffee maker for apartments`; that is an unverifiable absolute claim.
- Do not hide the limitation that it is not for full-carafe or multi-person batch brewing.
- Do not repeat `coffee maker` in every bullet just to force keywords.
- Do not invent safety certifications or splashing test results.

### Review Rule

After publishing the revised listing, review the next 7-14 days. Watch CTR, CVR, new Q&A questions about mug fit or cleaning, review mentions of counter size, and any Sponsored Prompts / Prompts report if available. If questions about travel mug clearance still appear, add the clearance answer to an image, A+ module, or top bullet.

### Missing Data

Required inputs are complete. Output is still limited because no exact product dimensions beyond width and cup clearance, no image text, no live conversion data, and no verified safety/certification details were provided.

### Listing Draft

Suggested Title:

```text
Compact Single Serve Coffee Maker for Small Apartments and Dorms, K Cup Pod and Ground Coffee Brewer with Reusable Filter, Removable Drip Tray for Travel Mugs
```

Suggested Bullets:

```text
1. Built for small spaces: The 8.2-inch-wide design fits apartment counters, dorm desks, office corners, and other tight coffee stations without taking over the surface.
2. Brew pods or ground coffee: Use K Cup style pods for quick mornings or the included reusable filter when you want to brew your own ground coffee.
3. Travel mug friendly setup: The removable drip tray creates up to 7 inches of cup clearance, making it easier to brew into many travel mugs before commuting.
4. Simple one-cup routine: One-button brewing helps you make a single cup for work, class, or a quick break without preparing a full carafe.
5. Easy daily cleanup: The removable drip tray, water tank access, and reusable filter help simplify cleanup in apartments, dorm rooms, and shared office spaces.
```

Long Description Draft:

```text
Make one cup of coffee without giving up your counter space. This compact single serve coffee maker is designed for small apartments, dorm rooms, home offices, and quick morning routines. It works with K Cup style pods and ground coffee, so you can choose convenience or your own blend.

The 8.2-inch-wide body helps it fit into tight coffee stations, while the removable drip tray creates up to 7 inches of clearance for many travel mugs. Use it when you need one cup before commuting, studying, or starting work. It is not designed for brewing a full carafe or serving several people at once, making it best for solo daily coffee routines.
```

Search Terms Suggestions:

```text
compact single serve brewer, small apartment coffee machine, dorm room coffee maker, pod and ground coffee brewer, travel mug coffee brewer, office desk coffee maker, reusable filter coffee machine
```

Search Terms rules:

- Do not repeat exact title phrases unnecessarily.
- Do not include competitor brand names.
- Do not include unsupported claims such as `best`, `safest`, or `guaranteed`.
- Keep variants that are useful but too repetitive for the visible listing.

A+ Module Suggestions:

1. Compact Fit Module: answer "Will this fit my small kitchen, dorm, or desk?"
2. Pod and Ground Coffee Module: answer "Can I use both pods and ground coffee?"
3. Mug Clearance Module: answer "Will my travel mug fit?"
4. Daily Cleanup Module: answer "How hard is it to clean in a small space?"
5. Best For / Not Ideal For Module: answer "Is this for one-cup routines or full-carafe brewing?"

Alexa Question Coverage Table:

| Buyer / Alexa Question | Current Coverage | Suggested Placement | Suggested Answer |
| --- | --- | --- | --- |
| Is this coffee maker good for small apartments? | Partly covered | Title, Bullet 1, A+ Compact Fit | Yes. The 8.2-inch-wide design is built for apartments, dorm rooms, and other small counters. |
| Can it use both K Cup pods and ground coffee? | Covered but weak | Bullet 2, A+ Pod and Ground Coffee | It works with K Cup style pods and includes a reusable filter for ground coffee. |
| Will a travel mug fit under it? | Partly covered | Bullet 3, image text, A+ Mug Clearance | The removable drip tray creates up to 7 inches of cup clearance for many travel mugs. |
| Is it easy to clean in a dorm room? | Weakly covered | Bullet 5, A+ Daily Cleanup | The removable drip tray and reusable filter are designed for simpler daily cleanup in small spaces. |

Compliance / Proof Reminders:

- Do not use `best`, `safest`, `guaranteed`, or superiority claims without proof.
- If claiming electrical safety certification, provide the certification name and confirm it is valid for this product.
- If claiming a specific cup clearance, verify the measurement from the actual product.
- If saying the product prevents splashing, provide test evidence or soften to a setup/usage suggestion.

## 13. Missing-Core Example Output

Use this behavior when required data is missing.

Input state:

- Product category present.
- Current title present.
- Only 1 bullet provided.
- Target buyer missing.
- Use cases missing.
- Keywords present.
- Buyer questions missing.

Output:

### Current Judgment

当前判断：`missing-core`，低置信度。当前输入不足，不能生成完整 Listing 草稿，否则会把关键词堆砌伪装成 Alexa 可回答内容。

### Key Evidence

- 当前五点少于 3 条，无法判断卖点结构。
- 未提供目标买家，无法判断 `best for` 和 `not ideal for`。
- 未提供 3 个核心使用场景，无法把关键词转成真实购买问题。
- 未提供 3 个以上买家/Alexa 问句，无法判断问答覆盖缺口。

### Priority Actions

1. 补 3-5 条当前五点，保留原始表达。
2. 补一个具体目标买家，例如 `small apartment renter`，不要只写 `everyone`。
3. 补 3 个真实使用场景。
4. 补 3-5 个买家问句，例如 `Will this fit under a low cabinet?`。

### Do Not Do

不要现在生成标题和五点。缺目标买家和问句时，输出只会变成普通关键词改写，无法判断 Alexa 问答覆盖。

### Review Rule

补齐必填输入后再生成完整 Listing。生成后先检查是否回答了买家最可能问的 3-5 个问题，再决定是否发布。

### Missing Data

- 当前五点：至少还需要 2 条。
- 目标买家：缺失。
- 3 个核心使用场景：缺失。
- 3-5 个买家/Alexa 问句：缺失。

## 14. Error State Copy

All user-facing error states must be in clear Chinese, actionable, and free of internal technical details.

### 14.1 Missing Required Inputs

```text
还不能生成完整 Listing。请先补齐：产品类目、当前标题、至少 3 条五点、目标买家、3 个使用场景、5 个关键词和 3 个买家问句。
```

### 14.2 Too Few Buyer Questions

```text
买家问句不足。这个工具需要至少 3 个真实问题，才能判断 Alexa 风格问答覆盖缺口。请补充买家会问的尺寸、适配、使用场景、限制条件或清洁维护问题。
```

### 14.3 Compliance Risk

```text
当前输入包含合规敏感表达。系统会先降级输出，并标出需要证明或需要改写的句子。请不要发布未经证明的医疗、儿童、安全、功效或绝对化承诺。
```

### 14.4 AI Provider Failure

```text
本次生成暂时不可用。请稍后重试，或先保存输入内容。系统不会丢弃你已填写的信息。
```

Forbidden error wording:

- `Command failed`
- `Traceback`
- Local file paths.
- HTTP stack traces.
- Script names.
- API provider raw errors.
- Model exception details.
- `Execution call`
- `Generated recommendations`
- `Current result`

## 15. Page Structure Recommendation

Recommended P0 page layout:

1. Header
   - Tool name.
   - One-line value proposition.
   - Boundary note: no ranking or Alexa recommendation guarantee.
2. Input form
   - Required inputs grouped first.
   - Optional inputs collapsed or placed after required inputs.
   - Compliance-sensitive flags visible before generation.
3. Result state
   - Six fixed modules.
   - Listing draft shown only when not `missing-core`.
4. Question coverage table
   - Make this visually prominent; it is the key difference from a generic listing rewriter.
5. Compliance/proof reminders
   - Always visible when proof-required claims appear.
6. Review rule
   - Keep as an operational checklist, not marketing copy.

## 16. Integration Package For Website-Building Thread

Use these values directly when creating the P0 page.

```json
{
  "toolName": "Alexa Listing Builder",
  "slug": "amazon-alexa-listing-builder",
  "englishTitle": "Alexa Listing Builder for Amazon Listings",
  "chineseTitle": "Alexa Listing Builder 亚马逊 AI 购物 Listing 编辑器",
  "oneLineValue": "Turn your current Amazon listing, target buyer, use cases, keywords, and buyer questions into an English listing draft that is easier for Alexa for Shopping to understand and answer from.",
  "defaultMarketplace": "Amazon US / English",
  "primaryDecision": "What should the seller change first so the listing better answers buyer questions without making unsupported claims?",
  "requiredFields": [
    "Marketplace and language",
    "Product category",
    "Current title",
    "Current bullets",
    "Target buyer",
    "Three core use cases",
    "Five to ten target keywords",
    "Three to five target buyer / Alexa questions"
  ],
  "optionalFields": [
    "Current description or A+ summary",
    "Review / Q&A summary",
    "Competitor ASINs or selling points",
    "Product facts, limits, compatibility, suitable and not-suitable conditions",
    "Compliance-sensitive flags"
  ],
  "branches": [
    "missing-core",
    "keyword-only",
    "objection-gap",
    "proof-gap",
    "compliance-risk",
    "answer-ready"
  ],
  "fixedModules": [
    "Current Judgment",
    "Key Evidence",
    "Priority Actions",
    "Do Not Do",
    "Review Rule",
    "Missing Data",
    "Listing Draft"
  ],
  "adsWorkbenchBoundary": "Do not reuse Ads Workbench ad report diagnosis, paid diagnosis CTA, or Search Term Waste Cutter logic. This page is listing answer-readiness and drafting only."
}
```

## 17. Acceptance Checklist

P0 page or implementation plan passes only if all are true:

- The page makes Alexa question coverage the central differentiator.
- Required-input missing state produces `missing-core` and does not generate a full listing draft.
- Output includes all six modules plus listing draft when eligible.
- Listing draft is in English by default for Amazon US.
- Chinese UI copy does not contain internal demo English.
- The page includes the no-guarantee boundary.
- Rufus is only historical context; current public language uses Alexa for Shopping.
- Keywords are assigned to surfaces, not dumped into one list.
- The result includes `best for`, `not ideal for`, use cases, limits, compatibility, and proof reminders where relevant.
- Error states are productized, Chinese, actionable, and contain no technical leakage.
- Ads Workbench remains untouched.

## 18. Suggested Next Step

Recommended next step after this spec:

1. Build the P0 frontend page from this document.
2. Use deterministic branching first.
3. Keep AI generation behind a single output function later, after the form and branch states are stable.

Do not start with knowledge-base expansion before the P0 page unless the implementation team lacks enough source material for compliance wording. The core product shape is already clear enough for a first usable page.
