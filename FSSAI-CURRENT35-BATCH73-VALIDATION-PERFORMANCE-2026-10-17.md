# Batch73 — Synchronous validation graph: performance without stale proof

17 October 2026 · **Only** `gh-pages` FSSAI prototype, not WordPress production or `main`.

## Problem

Batch72 reduced live full-browser opt-in loading from ~195 s to ~77 s in one CI run. Much time remains in repeated transitive validation of the exact same signed-source files and 35 held cases during a **single synchronous validation operation**, especially B59 descendants. Network retrieval itself is fast.

## Change

A 92-line source validation coordinator wraps the exported `valid()` calls of B58–B68 and deduplicates each signed-source integrity result **only inside one synchronous root call stack**. There is **no persistent cache**, timer-based trust, cache across event loop turns, storage, transmission, or blanket green approval. A new call recomputes all proofs; any real source modification between calls is detected. If a validator throws or recursively reenters, it is treated as **false**. The authoritative original validation functions and their digest/hold predicates remain unchanged. B59 `getAllCases()` routes through the public wrapper to reuse the already-validated result within the same cycle; it still refuses to return data unless B59 validates.

## Verification

CI uses actual Playwright Chromium, full GitHub Pages HTML, the full optional B23–B68 source chain, all six panels, final B59/B63/B64/B65/B66/B67/B68 checks, and all 35 unchanged cases/175 IDs. A separate synthetic tampering test modifies an upstream boolean after a first valid result, requires rejection on the very next independent validation, then verifies recovery only after restoring the proof. CI records the real elapsed time, without treating speed as a compliance sign-off.

**Safety unchanged:** 533 catalogue products, 498 conditional matches, 35 original source cases HELD (13 P0 / 22 P1), 175 original documentary evidence request IDs open. 0 signed legal contaminant limits, 0 accredited matrix method signoffs, 0 lab CoAs, 0 lot PASS, 0 product release. Browser-local review only.
