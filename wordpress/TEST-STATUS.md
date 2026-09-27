# Migration verification status — 27 September 2026

Not production ready. Not installed on WordPress.com. Live PMSV and DNS unchanged.

## Passed locally
- Original app, data, component, asset and business-rule files are byte-for-byte unchanged from source commit 77f5225.
- Vite WordPress frontend build, 32 route inventory, no audit routes or audit code.
- All original packaged images/assets match their source bytes.
- Seed export contains 605 real live news records with unique IDs and required fields; no generated sample data.
- Compiled JavaScript excludes ChatGPT-host URLs, OpenAI API endpoints, ChatGPT authentication, Cloudflare Worker imports and optional modelContext registration.
- Original eight security/regression groups and updater OIDC regression tests passed.
- All PHP files pass PHP 8.3 WASM syntax checks.
- PHP tests: push endpoint restrictions, malformed-token rejection, allowed-source checks, invalid date rejection, VAPID P-256 key generation and signature verification.

- Local WordPress HTTP tests preserve all 605 archive rows and return all 32 route shells; unknown routes return 404, unauthorized publishing returns 401 and foreign-origin notification writes return 403. App shells exclude theme CSS. These are HTTP checks, not browser interaction tests.
- Fixed archive import loss: records with distinct IDs but shared source URLs are preserved; future updater deduplication remains enabled.

## Not yet passed / release blockers
- WordPress.com admin browser sign-in; custom plugin installation. Google sign-in returned a 502 page; a fresh WordPress admin tab still shows login.
- Remaining WordPress database/API integration: cold notification-key generation currently returns HTTP 503 in the local Playground test; pre-provisioned key path passes registration, conflict and deletion checks. Do not count the full suite as passed.
- Staging theme isolation and visual checks on the actual WordPress host.
- Browser route traversal, direct access, refresh and Back behavior for all 32 routes.
- Visual/mobile comparison, search, tabs, empty/error screens and network/console review.
- Real daily collector ingestion; production workflow still targets the old host and is intentionally unchanged.
- Secure migration of VAPID private key and existing device registrations. Preview uses a separate origin/path and new keys. Never distribute old device data in this repository.
- Live-device notifications, opt-out and provider failure/retry behavior.
- Legacy subscription cancellation backend is fail-closed (503) in preview; must resolve before production.
- Domain cutover without DNS changes: WordPress currently reports no mapped custom domain. Must inspect existing domain/proxy routing; do not assume WordPress currently serves pmsvgroup.com.

## Preservation and rollback
Original GitHub main remains unchanged. Migration work is isolated to a separate branch and wordpress/ directory. A local git bundle preserves baseline repository history. Existing WordPress v0.2.0 plugin is untouched; its original ZIP was recovered. Migration preview uses /pmsv-app-review and separate pmsv_app_* tables/options. Disable the preview plugin to stop its routes; no drop-table/uninstall or live-DNS action is included. Production backup/cutover/rollback still requires host-side verification.
