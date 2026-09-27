# PMSV WordPress migration baseline

Status: implementation and staging validation in progress; NOT approved for live cutover.

Source: pragashramadoss/PMSV-app-source-code, commit 77f5225c109e85a4412b95f39739d37170d89c02. Original tracked source is retained unchanged. Local git bundle preserves the baseline. No audit repository is included.

## Implemented routes
- / — six original section tiles, search, today's updates with older stories filling to three
- /regulatory; /regulatory/{india,us,eu,uk,australia}
- /news; /news/{india,global}
- /quality, /excellence, /certifications and each body declared in data/professional-sources.json
- /blogs, /privacy, /subscriptions/manage (legacy cancellation)

Original implementation: app/newsroom.tsx, app/app-notifications.tsx, app/globals.css, lib/news-model.ts, lib/professional-bodies.ts, lib/professional-topics.ts, original Radix components and public assets. Preserve these instead of the installed v0.2 reconstruction.

## Hosting dependencies found
- .openai/hosting.json, Sites build plugin, Sites build scripts and Wrangler/Vinext: deployment infrastructure, excluded from WordPress runtime package.
- db/{index,archive,push}.ts and server routes depend on cloudflare:workers and D1: require WordPress database/API adapters.
- app/chatgpt-auth.ts contains optional ChatGPT sign-in helpers; not used by public UI and excluded from WordPress bundle.
- middleware.ts allows chatgpt.com framing: WordPress response should allow self only.
- lib/push-protocol.ts uses old chatgpt.site VAPID contact: use PMSV public contact instead.
- app/privacy/page.tsx describes old hosting: WordPress build must describe actual hosting.
- Optional modelContext browser tool in newsroom: no AI network dependency, but excluded from WordPress build.
- No OpenAI API calls or API keys are required by the existing reader application.

## Data flow found
Private pmsv-updater GitHub Actions cron 02:37 UTC collects existing real sources, authenticates with GitHub OIDC, POSTs batches to /api/updater, then POSTs /api/push/dispatch. It currently hardcodes the old chatgpt.site destination. Its current source set is broader than the exported app allowlist. Do not change its production destination until the WordPress endpoint and source validation are tested. The GitHub app repository data/news.json is a bundled baseline, NOT the current live archive. Full archive and push state require separate migration. Never publish device endpoints or VAPID private keys in GitHub or plugin ZIPs.

## WordPress findings
Site 257389619: Atomic hosting, pragashramadoss-hlxqw.wpcomstaging.com, coming-soon enabled, no custom domain mapped according to connector. Existing PMSV plugin v0.2.0 is a reconstruction and excludes push. Preserve it. pmsvgroup.com must not be redirected or DNS modified. Production cutover remains blocked until the existing domain routing can be preserved without DNS changes.

## Release gates
Every route direct-load/reload/back; original UI desktop/mobile; search and clear; section/body/category filters; today's highlights; live archive import; source ingestion and deduplication; error/empty states; permission-denied/opt-in/opt-out/push delivery; offline page; no console errors or unexpected third-party requests; no theme CSS; no OpenAI runtime. Live cutover requires completed staging tests and secure archive/push migration, verified rollback, existing domain routing solution. Do not claim completion from a build alone.
