# Alexa for Shopping Listing Builder P2 Report Upgrade Plan

## 0. Scope

This plan is for `Alexa for Shopping Listing Builder` only.

Do not change:

- Amazon Ads Audit Workbench.
- Amazon Growth & Profit Planner.
- Pricing.
- AI provider routing.
- Knowledge base ingestion.
- URL / SEO / GEO naming, unless separately approved.

P2 core result:

> After the user submits ASIN or Listing inputs, the page should output an `Alexa for Shopping Listing Opportunity Report`, not just a Listing draft.

The report should feel like an Amazon Listing / CRO expert delivery: commercial, diagnostic, psychologically aware, and specific about buyer questions, proof gaps, and answer-readiness for AI-assisted shopping.

## 1. Product Decision

The report helps the seller decide:

> Is this Listing structured well enough for Alexa for Shopping and AI shopping assistants to understand, compare, and answer buyer questions from, and what should be fixed first?

It must make the opportunity cost visible:

> If the seller does not keep improving AI answer-readiness, more structured competitors may win the assistant's answer surface when shoppers ask comparative or scenario-based questions.

This must be framed as a strategic risk, not a guarantee or scare ad.

## 2. Report Name

English:

`Alexa for Shopping Listing Opportunity Report`

Chinese:

`Alexa for Shopping 商品文案机会报告`

## 3. Report Structure

The P2 report should replace the current main result emphasis. It can keep deterministic branch logic, but the rendered output should become a report.

### 3.1 Executive Judgment

Purpose:

- Give an expert-level diagnosis in one screen.
- State whether Alexa for Shopping / AI shopping assistants can easily understand, cite, and answer from the Listing.

Fields:

- Readiness branch: `missing-core / keyword-only / objection-gap / proof-gap / compliance-risk / answer-ready`.
- Expert verdict.
- Confidence.
- Commercial implication.

Example tone:

> Your Listing is not just missing copy polish; it is missing answer structure. A shopper can understand the product after reading closely, but an AI shopping assistant has weak material to answer comparison, fit, and objection questions from.

Do not say:

- Alexa will recommend this.
- Ranking will improve.
- Traffic will increase.

### 3.2 Buyer Psychology And Sales Blockers

Purpose:

- Explain why buyers hesitate.
- Connect Listing gaps to psychology, not just SEO.

Subsections:

1. Buyer intent.
   - What the buyer is likely trying to decide.
2. Unanswered objections.
   - Fit, size, compatibility, setup, material, durability, safety, cleaning, limits.
3. Proof chain gaps.
   - Claims without support, missing evidence, vague benefits.
4. Trust friction.
   - Where the buyer has to guess or infer.

Example:

> The buyer is not only asking "what is it?" They are asking "will this work for my exact situation?" The current bullets describe benefits but do not reduce the perceived risk of buying the wrong variant or using it in the wrong context.

### 3.3 AI Shopping Assistant Readability Map

Purpose:

- Make the Alexa for Shopping angle concrete.
- Show which questions can or cannot be answered from the Listing.

Required table:

| Buyer / Alexa Question | Current Coverage | Why It Matters | Recommended Placement | Answer-Ready Sentence |
| --- | --- | --- | --- | --- |

Coverage values:

- Covered.
- Partly covered.
- Weakly covered.
- Not covered.
- Needs proof.

The table should prioritize answerability, not keyword count.

### 3.4 Listing Rewrite Strategy

Purpose:

- Give concrete edit moves by Listing surface.

Required surfaces:

1. Title.
   - What to keep.
   - What to remove.
   - What buyer-fit or use-case signal to add.
2. Bullets.
   - Bullet-by-bullet role.
   - First two bullets must answer high-intent questions.
3. Long description.
   - Narrative logic and expectation setting.
4. Search Terms.
   - Keyword variants that do not belong in visible copy.
5. FAQ / A+.
   - Modules that answer objections and comparison questions.

Each surface should include:

- Strategy.
- Suggested rewrite.
- Why this helps AI-assisted shopping.
- Proof or compliance note.

### 3.5 Draft Copy

Purpose:

- Keep the existing title/bullets/description/Search Terms/A+ output, but frame it as the implementation section of the report.

Required outputs:

- Suggested Title.
- Suggested Bullets.
- Long Description Draft.
- Search Terms Suggestions.
- A+ / FAQ Module Suggestions.
- Compliance / Proof Reminders.

Draft copy must remain in English for Amazon US.

### 3.6 Competitive Risk And Service Conversion

Purpose:

- Create urgency without hard-selling.
- Explain why ongoing answer-ready optimization matters.

Allowed framing:

> AI-assisted shopping rewards structured, answerable product information. If your competitors keep making their Listings easier to compare and cite, your product may become less likely to be the clearest answer when shoppers ask scenario-based questions.

Must include:

- Why this matters.
- What ongoing work looks like.
- What the seller should keep monitoring.

Forbidden:

- "You will lose traffic."
- "Alexa will stop recommending you."
- "Buy our service or you will fail."
- Any guaranteed outcome.

### 3.7 Risk And Boundary

Purpose:

- Keep trust and compliance discipline.

Must state:

- No Alexa recommendation guarantee.
- No ranking, traffic, sales, or conversion guarantee.
- No claim to know Alexa, A9, COSMO, or Amazon internal weights.
- No Seller Central backend data unless provided by the user.
- Proof-required claims must be verified before publishing.

This should be concise, not a giant first-screen card.

### 3.8 7 / 14 / 30 Day Review Plan

Purpose:

- Make the report operational.

Required plan:

7 days:

- Check whether new Q&A or buyer messages repeat the same objections.
- Check CTR if the title or main visual text changed.
- Check whether users still ask basic fit/use-case questions.

14 days:

- Check CVR if sessions are stable.
- Review new reviews for proof gaps, fit confusion, compatibility issues, or expectation mismatch.
- Check Search Terms / query data if available.

30 days:

- Decide whether to expand FAQ/A+ modules, adjust title structure, or create a second copy test.
- Compare against 2-3 structured competitors.
- Decide whether to continue self-serve edits or request expert Listing/CRO review.

## 4. Branch-Specific Report Behavior

### 4.1 `missing-core`

Do not generate a full opportunity report.

Output:

- Report blocked.
- Missing input list.
- What each missing input is used for.
- What the report will produce after completion.

Reject if it generates full copy.

### 4.2 `keyword-only`

Report angle:

- Seller has keywords but lacks buyer psychology and answer structure.

Must warn:

- Keywords alone do not make the Listing answer-ready.

Priority:

- Turn generic keywords into buyer questions, objections, and placement decisions.

### 4.3 `objection-gap`

Report angle:

- Buyers hesitate because practical doubts are not answered.

Priority:

- Use title/bullets/A+/FAQ to answer objections before adding more keywords.

### 4.4 `proof-gap`

Report angle:

- Claims may be persuasive but cannot be safely used without proof.

Priority:

- Replace unsupported claims with verifiable facts.
- Add proof requirements.

### 4.5 `compliance-risk`

Report angle:

- Sensitive claims or category terms require conservative copy.

Priority:

- Make claims factual, qualified, and proof-backed.

### 4.6 `answer-ready`

Report angle:

- Listing has enough structure for a solid draft, but still needs monitoring.

Must still include:

- No guarantee language.
- Competitive risk.
- 7/14/30 review plan.

## 5. One-Vote Rejection Points

Reject P2 if any occur:

1. Report still feels like a generic title/bullet generator.
2. It does not explain buyer psychology, hesitation, objection, or proof gaps.
3. It does not include an Alexa / AI shopping assistant readability map.
4. It promises Alexa recommendation, search ranking, traffic, sales, conversion, or ROI lift.
5. It pretends to know Alexa, A9, COSMO, or Amazon internal weights.
6. It uses fear-based hard selling such as "buy our service or lose traffic."
7. It generates a full report under `missing-core`.
8. It hides proof/compliance risk.
9. It imports Ads Workbench ad diagnosis logic.
10. It imports Growth Planner profit, promotion, inventory, or margin logic.
11. It exposes traceback, local paths, HTTP stack, scripts, or provider raw errors.
12. It uses internal demo labels such as `Current result`, `Execution call`, `Generated recommendations`, `Debug`.

## 6. Minimal Implementation Plan

Do not rebuild the page. Reuse current P1 structure.

### Step 1: Extend Result Model

Add report fields to the existing deterministic result object:

- `reportTitle`.
- `executiveJudgment`.
- `buyerPsychology`.
- `salesBlockers`.
- `readabilityMap`.
- `rewriteStrategy`.
- `competitiveRisk`.
- `riskBoundary`.
- `reviewPlan`.

Keep existing:

- `branch`.
- `confidence`.
- `draft`.
- `evidence/actions/dont/review/missing` for the modal.

### Step 2: Replace Main Result Rendering

Current main result:

- Current judgment.
- Listing draft.
- A+ modules.
- Alexa question table.
- Compliance reminders.

P2 main result:

1. Report title and executive judgment.
2. Buyer psychology and sales blockers.
3. AI Shopping Assistant Readability Map.
4. Listing Rewrite Strategy.
5. Draft Copy.
6. Competitive Risk / Ongoing Optimization.
7. Risk Boundary.
8. 7/14/30 Review Plan.

Keep `How it works / 功能说明` modal for six-module rationale.

### Step 3: Branch Copy Upgrade

For each branch, upgrade only the report copy.

Do not change:

- URL.
- ASIN import.
- Generate-only interaction.
- SEO/GEO metadata.
- Ads/Growth files.

### Step 4: QA Cases

Use existing branch verification, then add P2 report assertions:

- `missing-core` blocks report.
- `keyword-only` includes buyer psychology warning.
- `objection-gap` includes sales blocker language.
- `proof-gap` includes proof-chain downgrade.
- `compliance-risk` includes conservative claim handling.
- `answer-ready` includes competitive risk and 7/14/30 review plan.

### Step 5: Build Verification

Run:

```bash
pnpm exec eslint src/app/amazon/alexa-for-shopping-listing-builder/page.tsx src/app/amazon/alexa-for-shopping-listing-builder/zh/page.tsx src/components/alexa-listing-builder.tsx
pnpm build
TOOL_PAGE_BASE_URL=http://127.0.0.1:<port> pnpm verify:amazon-three-product-branches
TOOL_PAGE_BASE_URL=http://127.0.0.1:<port> pnpm verify:amazon-three-product-seo-geo
```

## 7. Recommendation

Recommended next action after approval:

Implement P2 inside `src/components/alexa-listing-builder.tsx` only, plus branch test updates if needed.

Do not add AI yet. Deterministic P2 report copy is enough to validate whether the new report shape feels like an expert deliverable before spending tokens.

