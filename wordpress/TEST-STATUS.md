# Migration verification status — 27 September 2026

Not production ready. The migration preview is installed on WordPress staging; version 0.5.0-preview is built and awaiting installation/testing. Live PMSV home and DNS are unchanged.

## Passed
- WordPress frontend build completed successfully in GitHub Actions.
- 34 React route shells are packaged, including `/updates` and `/about`.
- The separate `pragashramadoss/pmsv-fssai-audit` project is imported at build time into `public/audits` with 35 allowed audit files, including both FSSAI Schedule IV Inspection and Hygiene Rating flows, Saved Audits, NC Management/NC Follow-up and reports.
- The WordPress app no longer renders the stale bundled news snapshot first; it starts with an empty/loading state and reads the WordPress `/api/news` archive.
- Global News excludes India.
- Latest-update sections show every item from the latest publication day and top up with recent items only when fewer than three are available.
- The FSANZ/Australia local SVG has been adjusted for visibility on the light UI.
- The About us page is included with the PMSV purpose and Pragash Ramadoss contact details.
- The packaged WordPress plugin was scanned and contains no `chatgpt.site`, `chatgpt.com`, `openai.com` or `modelContext` runtime strings.
- The independent GitHub updater now targets the WordPress staging API through `PMSV_BASE_URL`; its 27 September 2026 migration run completed successfully, authenticated with GitHub OIDC, imported against WordPress, and completed push dispatch with no failed deliveries.
- Existing archive rows remain durable in WordPress and updater imports are idempotent.
- Original production/main branch remains separate from the migration branch.

## Not yet passed / release blockers
- Install and visually test version 0.5.0-preview on the actual WordPress staging site.
- Verify all navigation, direct URL refresh, browser Back, search, tabs, mobile layout and error/loading states in the browser.
- Verify both bundled audit families end-to-end on the WordPress origin, including new audit, saved audit, reports and NC follow-up. LocalStorage data previously created on the GitHub Pages origin will not automatically migrate to the WordPress origin.
- Cold notification-key generation previously returned HTTP 503 in the local Playground test; pre-provisioned key generation path passed. Real-device notification enable/disable and delivery still require staging verification.
- Legacy subscription cancellation backend remains fail-closed (503) in preview and should be resolved or retired before production.
- Map/cut over `pmsvgroup.com` only after staging verification. WordPress currently reports no mapped custom domain for the staging site.
- Complete host-side backup/rollback verification immediately before production cutover.

## Preservation and rollback
The migration remains isolated to `wordpress-independent`. The existing WordPress v0.2.0 plugin has not been replaced. The migration preview uses `/pmsv-app-review` and separate `pmsv_app_*` tables/options. Deactivating the migration-preview plugin stops its routes; there is no uninstall hook that drops the migration tables.
