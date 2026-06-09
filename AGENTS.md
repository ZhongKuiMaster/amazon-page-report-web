<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product page-shell rules

These rules are mandatory for all future Codex edits in this repo unless the user explicitly overrides them.

1. Homepage shows platform roadmap only. Do not add internal planning language, strategic notes, or explanatory sections aimed at the team instead of the user.
2. Platform pages should stay focused on the tool directory. Remove or avoid “why this page exists”, “current focus”, “next wave”, search-intent essays, FAQ blocks, and other self-explanatory marketing copy.
3. Tool detail pages should stay minimal: tool header, runtime/tool area, result area, and related tool recommendations. Do not add method, FAQ, trust, intent, fit, output, or conversion sections unless the user explicitly asks for them.
4. Do not surface internal product planning, rollout sequencing, platform expansion notes, or roadmap reasoning in user-facing copy.
5. All locales must follow the same information architecture. If a section is removed in one locale, remove it in every locale unless the user explicitly requests an exception.
6. On tool pages, prioritize above-the-fold usability. Do not push the runtime and result area downward with long explanatory content.
7. Keep tool form controls visually consistent. Inputs, selects, textareas, and primary buttons inside the runtime surface should use aligned sizing and spacing unless a specific tool requires a deliberate exception.
8. Respect the live-data-first tool contract. Do not promote advanced parameters, manual overrides, or strategy fields into the default first-screen task on tool pages.

## Paid-product page standard

Use this standard when editing homepage, platform pages, and tool detail pages. The target is not "looks fine"; the target is "a customer would believe this is a paid operator product and would pay to use the output."

### 1. Information architecture

- Homepage: platform roadmap only. It is a product entry, not an internal memo, content hub, or strategy essay.
- Platform pages: platform-level tool matrix entry only. Keep platform positioning, tool-group hierarchy, and obvious entry CTAs.
- Tool pages: header, runtime, result surface, and related tools. Keep the interactive work above the fold whenever possible.

### 2. Platform-page rules

- A platform page must feel like a commercial operator console or tool matrix, not a blog post and not a workflow lecture.
- Keep copy short and directional. Remove repeated explanations of why the workflow matters or how the team should think internally.
- Preserve platform-specific hierarchy already established in code:
  - Amazon: protect the `8 + 4` featured split and do not flatten it.
  - TikTok Shop: keep the page as a matrix/entry page, not a long workflow explainer.
  - Shopify: keep the page feeling like an operator system, not a generic directory.
- Secondary and support tools can exist, but they must not visually compete with first-wave featured tools.

### 3. Tool-page rules

- Tool pages are runtime-first. The customer should understand the task, enter the minimum required inputs, and reach a useful result fast.
- Do not add long educational blocks ahead of the runtime.
- Do not frame the page like a generic calculator unless the output is genuinely calculator-only.
- The result area should read like a deliverable:
  - a decision memo
  - an execution brief
  - a review board
  - an approval packet
  - a handoff artifact
- Every tool page should make the next action legible after the result appears.

### 4. Output-quality standard

- A result is not good enough if it only echoes inputs or produces generic advice.
- Paid-worthy output should help the user:
  - make a decision
  - justify a decision
  - assign work
  - review risk
  - move to the next operating step
- Prefer concise, high-signal sections over long undifferentiated paragraphs.

### 5. Metadata and naming rules

- Avoid weak directory language such as `seller tools`, `tool list`, or `workflow page` when a stronger product term is accurate.
- Prefer productized language such as `operator system`, `operator pages`, `execution tools`, `commercial audit`, `decision board`, or `brief`.
- Metadata and visible page language must agree. Do not let the page feel premium while metadata still reads like a commodity tool directory.

### 6. Cross-locale rules

- English and Chinese pages must follow the same structural logic and product positioning.
- Do not leave one locale in product language while the other still reads like a generic tool directory.
- Chinese copy should read like natural product copy, not translated internal notes.

### 7. What to borrow vs rewrite

- Safe to borrow:
  - task decomposition
  - input/output logic
  - decision order
  - operator workflow shape
- Must be rewritten into our own system:
  - naming
  - copy
  - page hierarchy
  - metadata
  - visual framing
  - result expression

### 8. Release check before considering a page "done"

- Does the page look like part of one commercial system, not a loose collection of utilities?
- Is the first screen focused on the user's next action?
- Is advanced noise kept out of the default path?
- Does the result feel valuable enough that a team could use it in a real review, approval, or execution flow?
- Does the page avoid article-like filler and internal planning language?
