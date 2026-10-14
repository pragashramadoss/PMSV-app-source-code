# PMSV FSSAI Helper — Batch 23: safe evidence transfer and real browser verification
**As of 14 October 2026.** GitHub gh-pages preview only. No WordPress changes.

## Fixed: importing a valid JSON previously overwrote local drafts without a preview

A Batch15 unverified review packet is now read and parsed **locally** on the first Import click. Batch23 intercepts that click before Batch15's original write handler, rejecting invalid JSON, tampered approval flags, duplicate product IDs, non-FSSAI links, wrong FSSR identities and wrong 498/35 baseline using the existing **strict Batch15 validator**.

The draft comparison preview reports the total records, newly populated reviewer drafts, existing reviewer drafts to replace, changed document-receipt sets and changed conditional-route claims. It displays **counts only**, not sensitive text. It does not write to localStorage.

A separate **Confirm replacement / merge** action is required. Selected file identity and three exact localStorage keys are checked again before saving, so a changed file or another-tab edit invalidates the preview and prevents an outdated overwrite. Cancel makes no changes. All existing receipt claims, proposed articles and lot IDs stay unverified and never authorize numeric contaminant limits or product PASS.

The underlying existing atomic multi-key B15 import/rollback remains in use. Review screens refresh only **after** a successful import.

## Real Chromium integration test
- Opens the actual hosted-preview HTML in a local HTTP server and confirms the complete B22 regulator-loader startup chain.
- Enters a draft for trehalose; exports a genuine 35-case unverified packet; stages a changed article in the transfer.
- Verifies malformed JSON, forged finished-product compliance approval and duplicate catalogue ID are rejected before storage mutation.
- Verifies a valid packet produces a truthful conflict summary and leaves saved reviewer drafts unchanged until confirmation.
- Forces a stale localStorage conflict between preview and confirmation and requires a new preview.
- Confirms changed trehalose source draft is restored **only** after consent; the generic `Foods not specified` fallback remains a scope challenge.
- Verifies **533 catalogue / 498 conditional / 35 pending / zero laboratory PASS or independent legal approvals** remain unchanged.

## Legal-source scope
Official FSSAI Contaminants, Toxins and Residues Version IX (03 February 2026):
https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

Batch23 is a reviewer-draft **import-security** and audit-integrity improvement. It is not an independent legal review or laboratory analysis. Prospective December 2026 provisions remain inactive.
