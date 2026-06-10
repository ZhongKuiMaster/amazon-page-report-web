# Commercial P0 Launch Ops

## 唯一核心结果

把 dealingnow.com 的三个旗舰工具接上可运营的商业化底座：用户可以注册领取每个工具 1 次体验，加微信群后用兑换码每个工具再领 3 次，后续付费包可以给每个工具追加次数。

P0 不接真实 AI、不强制阻断 deterministic demo、不承诺自动微信闭环。P0 先把账号、次数、兑换、数据库、部署环境变量和运营流程打通。

## 当前已落地

- 前端：三个工具页都有账户与次数面板。
- 后端：`/api/commercial/register`、`/api/commercial/entitlements`、`/api/commercial/redeem`、`/api/commercial/usage`。
- 数据库：`docs/supabase/commercial-p0-schema.sql`。
- 次数规则：注册后 3 个产品各 1 次；加群兑换后 3 个产品各 3 次。
- 收费包配置：Starter `$19`、Operator `$49`、Expert `$199`，目前先作为前端与规则层配置，未接真实支付商。

## Supabase 配置

当前生产项目：

- Project name：`dealingnow-production`
- Project ref：`csyewqvkevbsljzughjy`
- Project URL：`https://csyewqvkevbsljzughjy.supabase.co`

配置步骤：

1. 新建 Supabase project。
2. 在 SQL editor 执行：
   `docs/supabase/commercial-p0-schema.sql`
3. 如果 REST API 返回 `permission denied for table ...`，在 SQL editor 再执行：
   `docs/supabase/commercial-p0-service-role-grants.sql`
4. 在 Vercel 环境变量配置：
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://dealingnow.com`

注意：`SUPABASE_SERVICE_ROLE_KEY` 只允许放在服务端环境变量，不得放到浏览器、GitHub、前端代码或截图里。

本地验证：

1. 确保本地 `.env.local` 已配置 Supabase 变量。
2. 运行生产服务：`pnpm exec next start -H 127.0.0.1 -p 3188`
3. 新终端运行：`TOOL_PAGE_BASE_URL=http://127.0.0.1:3188 COMMERCIAL_REDEEM_CODE=WECHAT-DEMO-0001 pnpm verify:commercial-p0-api`
4. 如果 demo 兑换码已经被使用，换一个未使用的兑换码，或在 Supabase 后台新增一次性兑换码。

## GitHub / Vercel

推荐链路：

1. GitHub 只存代码，不存 `.env.local`。
2. Vercel 连接 GitHub 仓库。
3. Vercel 环境变量里填 Supabase 和后续支付/微信密钥。
4. 每次 push 到主分支后由 Vercel build。
5. build 过后人工验收三个 URL：
   - `/amazon/amazon-ads-audit-workbench/zh`
   - `/amazon/alexa-for-shopping-listing-builder/zh`
   - `/amazon/amazon-growth-profit-planner/zh`

## 微信私域运营

P0 不硬接微信开放平台，先用兑换码闭环：

1. 用户注册邮箱。
2. 页面提示加群。
3. 运营在微信群发放一次性兑换码。
4. 用户在页面输入邮箱 + 兑换码。
5. 系统给三个工具各增加 3 次。

后续 P1 再接：
- 企业微信客户标签
- 自动欢迎语
- 兑换码自动发放
- 付费用户分层标签
- 过期用户唤醒

## 收费模式

P0 建议先卖次数包，不卖 SaaS 月费：

- Starter Pack：`$19`，每个工具 3 次。适合试用后低门槛转化。
- Operator Pack：`$49`，每个工具 10 次。适合运营每周使用。
- Expert Review：`$199`，每个工具 30 次，并引导人工复核。

原因：当前三个工具是高价值报告型工具，用户先按“报告机会”付费更容易理解；等保存报告、团队空间、历史复盘、AI 供应商成本稳定后，再推订阅。

## 何时开始真正扣次

现在 deterministic demo 不强制扣次，避免影响验收和 SEO 入口。

接 AI 后：

1. 用户点击生成。
2. 前端先调用 `/api/commercial/usage`。
3. 后端确认有次数后扣 1 次。
4. 才调用 AI 报告生成。
5. 如果 AI 供应商全部失败，应返还次数或不扣次。这个逻辑放在 P1 AI gateway。

## 一票驳回点

- 前端暴露 Supabase service role key。
- 没登录/没邮箱也能扣真实次数。
- 失败时显示 traceback、HTTP stack、本机路径、供应商原始错误。
- 加群兑换码可重复使用。
- 支付成功但不写 ledger。
- AI 调用失败仍扣用户次数。
- Ads Workbench 因商业化改动导致原工具体验下降。
