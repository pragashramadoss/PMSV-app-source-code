# PMSV security and functional review — 14 September 2026

Scope: application source, dependency advisories, public archive response, live desktop navigation/search/filter behaviour, PWA and notification implementation, scheduled publishing instructions. This is a bounded review, not a penetration-test certification.

## Confirmed findings and changes

| Priority | Finding | Resolution |
|---|---|---|
| High | Anonymous POST could invoke notification dispatch and consume provider/database capacity. Existing delivery cursors limited repeats, but did not authorize the caller. | Fail-closed bearer authorization with a secret held by the publisher; readers and opt-in remain public. Scheduled publisher rotates the secret securely before publication. |
| High | Dependency audit reported critical/high advisories; some packages listed as development dependencies also participate in server rendering. | Updated affected application/framework packages and rechecked the complete dependency graph; see validation and remaining limitations. Advisory severity is not proof of a demonstrated exploit in this application. |
| Medium | Notification off state was set before browser revocation; a network failure could leave an active subscription. | Browser unsubscribe runs even if server cleanup fails; confirm browser state before reporting success and retry persisted opt-outs on reload. |
| Medium | Re-registering notifications on every page could exhaust the per-device/network rate limit during ordinary navigation. | Reuse an existing enabled browser subscription instead of writing it again on every page. |
| Medium | FSSAI collector used midnight-only firstSeen timestamps. A subscriber joining that morning could miss a subsequently discovered story. | New entries use full collection timestamps; existing firstSeen values remain unchanged. |
| Medium | Collector regenerated IDs for prior editorial corrections, risking duplicates or lost corrections. | Preserve existing IDs, match known URLs, and retain summary/firstSeen. |
| Medium | Archive import marker depended on status timestamps, so a content correction without a timestamp change could stay stale. | Import version is a hash of the complete edition content. |
| Medium | API request size was checked only after buffering the entire body. | Stream bounded JSON input and reject oversized payloads before complete buffering. |
| Low | External article URLs were not scheme-validated at render time. No unsafe URLs were found in current data. | Exclude executable/non-HTTP links and URLs with embedded credentials. |
| Low | Rate-limit records had an expiry column but no cleanup. | Remove expired records during rate-limit checks. |
| Low | Several parsed JSON responses failed TypeScript checks; archive response structure was unchecked. | Add response typing and archive shape checks with a saved-edition fallback. |
| Low | Basic response hardening was missing from app responses. | Add nosniff, referrer, camera/microphone/location restrictions, and object/base CSP controls. This is not a strict script CSP. |

## Verification

- Live archive before changes: 265 source records and 265 database records; no missing source IDs or duplicate source IDs; all URLs used HTTP(S).
- Live desktop Home showed exactly three latest stories. Search for BRCGS found two scheme-owner stories; FSSC returned the expected empty result because no dated FSSC article is currently stored.
- Certification Food safety filter showed seven stories; Quality showed its empty state, with no unrelated provider/professional-exam content substituted.
- Eight automated regression groups cover dispatch authorization, absence of unauthorized dispatch side effects, push SSRF allowlisting, streamed request limits, archive schema, link safety/deduplication/search, section isolation and CSRF.
- Isolated collector fixture verified stable IDs, preserved summaries/firstSeen, full timestamps for new records, and byte-for-byte archive preservation on an unreadable source.
- TypeScript checks passed after framework updates. Production build is checked before saving the release. No real notification was sent as a test.
- Follow-up complete dependency audit: zero known vulnerabilities across all dependencies. A scoped override replaces only @esbuild-kit/core-utils’s esbuild with 0.25.12, retaining drizzle-kit 0.31.10. Both synchronous/asynchronous TypeScript transforms, drizzle-kit check, the eight regression groups and TypeScript checks pass. No live database schema was changed.

## Limits and follow-up

- Live database follow-up found zero registered push devices. Real Android/iOS installation, background notification delivery, notification-permission flows and physical-device mobile layout are not verified by this review. A user must first opt in on a device before a real recipient delivery test is possible.
- Prior notification dispatch was blocked in scheduled runs. Securing the endpoint does not prove the scheduler can complete delivery; a successful authorized publication-to-phone run remains necessary.
- Daily source checks use the existing ChatGPT automation, not a self-contained worker cron. Its schedule is configured, but the task response did not supply a next-run time; an exact delivery-time SLA is not established.
- Source/social coverage is selective; unavailable sources are disclosed. The collector parses an upstream JavaScript bundle and can fail if its structure changes. No exhaustive revalidation of every external article/PDF was performed.
- Archive retrieval currently loads the whole archive. At 265 records it is small; server-side pagination should be revisited if the archive becomes large.
- Full independent security testing, distributed abuse/load testing and a strict nonce-based script CSP remain outside this bounded review.

## Published-version follow-up

Version 14 deployment succeeded. The external HTTP test client was denied by Cloudflare (403 / 1010); those live API checks were not counted as passing. Read-only production logs returned one canceled archive request but no application exception in the sampled window. This does not establish complete production health. The app remains public.
