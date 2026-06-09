# Amazon Page Report Web

Current scope:

- Amazon beta only
- 30 retained tools
- featured / secondary / support layering = `12 / 4 / 14`
- deterministic-first launch mode

## Local development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Open:

- `http://127.0.0.1:3000`

## Production build

Build the current app:

```bash
pnpm build
```

Start a local production server:

```bash
pnpm start
```

Or bind explicitly:

```bash
pnpm exec next start -H 127.0.0.1 -p 3027
```

## Environment

Current beta runtime expects:

### Required for production correctness

- `NEXT_PUBLIC_SITE_URL`

### Recommended for the current launch mode

- `NEXT_PUBLIC_GUARDED_ASSIST_ENABLED=false`

### Optional only if enabling assisted mode

- `GUARDED_ASSIST_API_KEY`
- `GUARDED_ASSIST_BASE_URL`
- `GUARDED_ASSIST_ENGINE`

Current local template:

```env
NEXT_PUBLIC_SITE_URL=https://amazon-page-report.com
NEXT_PUBLIC_GUARDED_ASSIST_ENABLED=false
GUARDED_ASSIST_API_KEY=
GUARDED_ASSIST_BASE_URL=
GUARDED_ASSIST_ENGINE=
```

## Verification commands

### Local beta gate

Checks featured tools, result-layer structure, and image-studio route integrity:

```bash
TOOL_PAGE_BASE_URL=http://127.0.0.1:3027 \
NEXT_PUBLIC_SITE_URL=https://amazon-page-report.com \
pnpm run verify:beta-launch
```

### Deployment smoke gate

Checks entry pages, sample routes, removed tools, image-studio routing, and canonical basics:

```bash
TOOL_PAGE_BASE_URL=http://127.0.0.1:3027 \
NEXT_PUBLIC_SITE_URL=https://amazon-page-report.com \
pnpm run verify:deployment-smoke
```

## Deployment

Recommended current release mode:

- deterministic-only beta

Recommended platform:

- Vercel for hosting and deploy previews

Current go-live sequence:

1. Set production env:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_GUARDED_ASSIST_ENABLED=false`
2. Deploy current verified build
3. Run:
   - `pnpm run verify:deployment-smoke`
4. Follow:
   - `/Users/ortom/Documents/Amazon Page Report/reports/deployment-verification-runbook.md`
5. Manually verify one live ASIN / URL flow on deployed infra

## Source-of-truth documents

- `/Users/ortom/Documents/Amazon Page Report/reports/local-beta-readiness-status.md`
- `/Users/ortom/Documents/Amazon Page Report/reports/deployment-environment-checklist.md`
- `/Users/ortom/Documents/Amazon Page Report/reports/deployment-verification-runbook.md`
- `/Users/ortom/Documents/Amazon Page Report/reports/deployment-go-live-checklist.md`
- `/Users/ortom/Documents/Amazon Page Report/reports/beta-deployment-mode-options.md`
