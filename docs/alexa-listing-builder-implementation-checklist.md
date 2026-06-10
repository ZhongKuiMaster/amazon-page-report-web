# Alexa Listing Builder Implementation Checklist

## 0. Purpose

This is the pre-implementation checklist and QA case list for the `Alexa Listing Builder` P0 page.

Primary spec:

`/Users/ortom/Documents/Amazon Page Report/web/docs/alexa-listing-builder-p0-spec.md`

This file is not a new product spec. It only turns the approved P0 spec into implementation and test gates for the future page-building thread.

Current status:

- P0 spec: report-level approved.
- Frontend implementation: not started in this thread.
- Ads Workbench: untouched.
- Growth & Profit Planner: out of scope.

## 1. Implementation Result

The future page must let a user enter:

- Current Amazon listing.
- Target buyer.
- Core use cases.
- Keywords or prompts.
- Buyer / Alexa questions.

Then it must produce:

- One primary branch.
- Six diagnostic modules.
- English listing draft when allowed.
- Alexa question coverage table.
- Compliance and proof reminders.

The page must not become a generic listing rewriter.

## 2. Non-Negotiable Gates

### Gate 1: First Screen Positioning

The first screen must make the product identity clear:

> This is a buyer-question coverage and Amazon listing draft tool for Alexa for Shopping, not a universal listing rewrite tool.

Required above-the-fold signals:

- Tool name: `Alexa Listing Builder`.
- Chinese title: `Alexa Listing Builder 亚马逊 AI 购物 Listing 编辑器`.
- One-line promise focused on `问句覆盖 + Listing 草稿`.
- Boundary note:
  - No guarantee of Alexa recommendation.
  - No guarantee of ranking, traffic, sales, or conversion lift.
  - No claim of knowing Amazon internal algorithm weights.

Reject if:

- The first screen only says "optimize your listing".
- The first screen promises ranking, traffic, conversion, or Alexa recommendation.
- The first screen does not mention buyer questions, Alexa for Shopping, or answer coverage.

### Gate 2: `missing-core` Must Block Draft Generation

If any required field is missing, the page must select `missing-core`.

Required behavior:

- Show current judgment.
- Show key evidence for missing inputs.
- Show priority actions to complete the form.
- Show do-not-do warning.
- Show review rule.
- Show missing data list.
- Do not render Suggested Title, five bullets, long description, Search Terms, A+ modules, or Alexa coverage table as if complete.

Reject if:

- Missing required inputs still generate a complete listing draft.
- Example output silently fills missing user facts.
- The page shows a high-confidence answer while required fields are absent.

### Gate 3: Single-Branch Consistency

Every output must derive from one primary branch:

- `missing-core`
- `keyword-only`
- `objection-gap`
- `proof-gap`
- `compliance-risk`
- `answer-ready`

Required behavior:

- The branch label, evidence, actions, draft confidence, and missing data must agree.
- `missing-core` cannot have a full draft.
- `compliance-risk` must show conservative drafting and proof warnings.
- `proof-gap` must soften or qualify proof-required claims.
- `answer-ready` still cannot imply guaranteed Alexa citation.

Reject if:

- Evidence says inputs are missing but the draft is complete.
- Compliance-risk output writes aggressive claims.
- Proof-gap output invents certifications or test results.
- Keyword-only output claims full Alexa readiness.

### Gate 4: Chinese Product Copy

Chinese UI and result headings must be user-facing and productized.

Allowed headings:

- 当前判断
- 关键证据
- 优先动作
- 不要做什么
- 复查规则
- 缺失数据
- Listing 草稿
- Alexa 问句覆盖表
- 合规/证据提醒

Forbidden UI copy:

- `Current result`
- `Execution call`
- `Generated recommendations`
- `System-generated`
- `Action plan`
- `Result loaded`
- `Model output`
- `Debug`

Reject if:

- Internal demo English appears in the Chinese page.
- The page exposes implementation language instead of seller-facing instructions.

### Gate 5: Error States Must Hide Technical Details

All errors must be Chinese, actionable, and non-technical.

Allowed examples:

- `还不能生成完整 Listing。请先补齐产品类目、当前标题、至少 3 条五点、目标买家、3 个使用场景、5 个关键词和 3 个买家问句。`
- `本次生成暂时不可用。请稍后重试，或先保存输入内容。系统不会丢弃你已填写的信息。`

Forbidden:

- `Command failed`
- `Traceback`
- Local paths.
- HTTP stack.
- Script names.
- Raw model provider errors.
- API keys.
- JSON exception dumps.

Reject if:

- Any technical stack or provider error is visible to the user.

## 3. Minimal Page Sections

The future P0 page should include these sections:

1. Header and boundary note.
2. Required input form.
3. Optional evidence form.
4. Compliance-sensitive flags.
5. Generate / evaluate action.
6. Six-module result.
7. Listing draft, hidden for `missing-core`.
8. Alexa question coverage table.
9. Compliance/proof reminders.
10. Review rule.

Do not add:

- Ads Workbench paid diagnosis CTA.
- Campaign optimization panels.
- Profit calculator.
- Promotion planner.
- Inventory or FBA decision sections.
- A wall of unrelated Amazon tools.

## 4. Required Form Validation

Required field validation:

| Field | Minimum Rule | Missing-Core Message |
| --- | --- | --- |
| Marketplace and language | selected | `请选择站点和语言。默认可使用 Amazon US / English。` |
| Product category | non-empty | `请填写产品类目。` |
| Current title | non-empty, preferably 20+ chars | `请粘贴当前标题。` |
| Current bullets | at least 3 non-empty lines | `请至少粘贴 3 条当前五点。` |
| Target buyer | non-empty and specific | `请填写具体目标买家，不要只写 everyone。` |
| Core use cases | at least 3 non-empty lines | `请填写 3 个核心使用场景。` |
| Target keywords | at least 5 terms | `请填写 5-10 个目标关键词或已有关键词。` |
| Buyer / Alexa questions | at least 3 questions | `请填写 3-5 个买家或 Alexa 可能会问的问题。` |

Validation should be deterministic before any AI generation.

## 5. Branch Test Cases

### Case A: `missing-core`

Input:

- Category: present.
- Title: present.
- Bullets: only 1 line.
- Target buyer: missing.
- Use cases: missing.
- Keywords: 5 terms.
- Buyer questions: missing.

Expected:

- Branch: `missing-core`.
- No full listing draft.
- Missing data lists bullets, target buyer, use cases, and buyer questions.
- Do-not-do warns against generating copy from keywords alone.

Reject if:

- Page shows Suggested Title or five full bullets.

### Case B: `keyword-only`

Input:

- Category: present.
- Title and 5 bullets: present.
- Target buyer: `everyone who needs a useful home product`.
- Use cases: `home`, `gift`, `daily use`.
- Keywords: 10 terms.
- Buyer questions: generic keyword-like questions.

Expected:

- Branch: `keyword-only`.
- Draft may be generated but must be downgraded.
- Output says keyword coverage is not equal to answer readiness.
- Priority actions ask user to add specific buyer, use cases, limitations, and real questions.

Reject if:

- Output says the listing is fully Alexa-ready.

### Case C: `objection-gap`

Input:

- Complete required fields.
- Review/Q&A says buyers ask about fit, compatibility, cleaning, or setup.
- Current bullets only describe generic benefits.

Expected:

- Branch: `objection-gap`.
- Evidence references unanswered buyer objections.
- Priority actions place answers in bullets, A+, FAQ/Q&A, and image text.
- Draft includes `best for` and `not ideal for` where appropriate.

Reject if:

- Draft hides limits or only adds more keywords.

### Case D: `proof-gap`

Input:

- Complete required fields.
- User requests claims like `best`, `safest`, `clinically proven`, `non-toxic`, `guaranteed`, `100% waterproof`, or `FDA approved`.
- No proof supplied.

Expected:

- Branch: `proof-gap`.
- Risky claims are softened or replaced.
- Compliance/proof reminders list exact claims needing evidence.
- Draft does not invent certifications, tests, or guarantees.

Reject if:

- Output repeats unsupported claims as final listing copy.

### Case E: `compliance-risk`

Input:

- Complete required fields.
- Category or flags include children, medical, food contact, safety, battery, chemical, supplement, cosmetic, or regulated use.

Expected:

- Branch: `compliance-risk`.
- Conservative draft.
- Exact sensitive inputs are named.
- Strong compliance/proof reminder is visible.

Reject if:

- Output makes treatment, prevention, child-safety, or absolute safety claims without proof.

### Case F: `answer-ready`

Input:

- Complete required fields.
- Specific target buyer.
- Three concrete use cases.
- 5-10 relevant keywords.
- 3-5 real buyer questions.
- Product facts include dimensions, material, compatibility, best-for and not-ideal-for details.
- No unsupported sensitive claims.

Expected:

- Branch: `answer-ready`.
- Full English draft.
- Alexa question coverage table maps each question to placement and answer sentence.
- Proof reminders still mention limits.
- No guarantee language.

Reject if:

- Output implies Alexa will cite, recommend, rank, or drive traffic.

## 6. Regression Checks

Before marking the future page ready:

- Search page text for forbidden internal phrases.
- Search page text for guarantee phrases:
  - `guarantee`
  - `guaranteed`
  - `will rank`
  - `will improve traffic`
  - `will be recommended by Alexa`
- Test missing required inputs.
- Test all six branches.
- Test mobile layout for form and coverage table.
- Test that the listing draft stays hidden in `missing-core`.
- Test that branch, evidence, and draft remain consistent.
- Test that error state contains no traceback, path, HTTP stack, script name, provider error, or API key.

## 7. Frontend Implementation Notes

Recommended implementation sequence:

1. Build static form and result shell.
2. Implement deterministic validation and branch selection.
3. Add seeded example input/output.
4. Add branch-specific render logic.
5. Add mobile layout checks.
6. Only then attach AI generation or backend logic.

Keep AI behind one generation boundary:

- Input: normalized form fields and selected branch.
- Output: fixed output contract.
- If AI fails: show productized Chinese fallback error.

Do not let AI decide whether required fields are present. Required-field validation must be deterministic.

## 8. Handoff Summary

Ready for future page implementation:

- Product spec exists.
- Implementation gates are defined.
- Required validation is defined.
- Six branch test cases are defined.
- Ads Workbench boundaries are explicit.

Recommended next action from this execution thread:

> Wait for the total owner to issue the unified three-product page entry and implementation order.

