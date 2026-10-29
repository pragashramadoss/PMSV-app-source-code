# PMSV Batch128 — 35-case evidence acceptance rubric

**Date:** 29 October 2026. **Classification:** internal workflow specification; not regulatory advice or a release approval.

## Purpose
Standardize how the original 35 HELD FSSAI compliance cases (13 P0, 22 P1) are evaluated when original evidence is eventually obtained. Do not substitute this rubric for the primary regulations or the original case-specific evidence gates. The original source queue contains 70 first-action requests and 105 dependent gates (175 total). At creation, none of the original evidence requests has been authenticated as sent/received by this workflow.

## Gate decisions (each independently reviewed)
| Gate | Required evidence | Acceptance condition | Fail-closed reason |
|---|---|---|---|
| R1 — legal source | Original applicable FSSAI regulation/notification and subsequent amendments | Exact operative clause, version, effective date and source provenance independently confirmed | Unverified secondary citation, missing amendment, obsolete rule |
| R2 — classification | Finished-product composition, manufacturing process and packaging | Product category and any exclusions justified against original legal text | Analogy to another confectionery or unclear classification |
| M1 — manufacturer identity | Approved controlled formulation, product specification, revision history | Identical SKU/product and analyte; responsible QA approval and traceability | Supplier marketing sheet or different product |
| L1 — method | Primary analytical standard and method applicability | Matrix/analyte suitability, preparation, detection/quantitation and method validity reviewed | Generic test or unverified method substitution |
| L2 — laboratory | Laboratory authorization/accreditation and scope, if applicable | Scope and test dates cover relevant method, analyte and matrix | Accreditation assumed from logo or expired scope |
| L3 — results | Original signed CoA/report and sample/lot identifiers | Results, units, limits, sampling, date, uncertainty/decision rule where applicable checked | Untraceable screenshot or unrelated lot |
| D1 — dependencies | All applicable downstream original evidence requests | Each dependent gate independently verified and resolved | First-action request marked complete while downstream open |
| A1 — authorization | Dated Regulatory, Laboratory and QA dispositions | Named authorized reviewers, decision rationale and conflict resolution retained | Self-reported status, unsigned checklist or inferred approval |
| C1 — commercial disposition | Formal authorized product/lot release decision | All applicable gates accepted and disposition traceably signed | Automatic release based on evidence receipt alone |

## Controlled decision vocabulary
- `MISSING`: original evidence not available or unverified.
- `RECEIVED_UNVERIFIED`: document exists but provenance/applicability not yet authenticated.
- `CLARIFICATION_REQUIRED`: conflicts, incomplete chain, or inadequate match.
- `REJECTED`: documented reason evidence does not satisfy the original gate.
- `ACCEPTED`: qualified reviewer authenticated a specific document for a specific original gate, with date and citation.
- `NOT_APPLICABLE_VERIFIED`: a qualified reviewer documents primary-source-backed reason a gate is inapplicable; never inferred by a UI rule.

`ACCEPTED` is a gate-level evidence decision, **not** a legal article approval, laboratory approval, lot pass or commercial release. Cases remain `HOLD` unless all applicable gates and authorized disposition are documented.

## Per-gate private review record schema
`case_id, request_id, original_gate_id, product_sku, analyte, evidence_type, source_document_id, source_title, issuer, publication_date, effective_date, revision, document_hash, document_location_private, reviewer_function, reviewer_name_private, review_date, decision, decision_reason, applicable_clause, method_id, laboratory_scope_reference, lot_reference_private, conflict_reference, next_action, qa_approval_reference_private`

All identifiers must join exactly to the original source record; no invented IDs or fabricated legal limits. Keep personally identifying information, manufacturer formulations, CoAs and raw documents outside public GitHub Pages. If any source identity or join fails, stop the export and keep the case on HOLD.

## Practical triage order
1. **P0 (13 cases, 26 first-action requests):** reconcile source and method authority (`-01`) with manufacturer/supplier QA (`-02`) for each case.
2. **P1 (22 cases, 44 first-action requests):** prepare the same evidence chain in parallel.
3. **105 downstream dependencies:** evaluate only after their prerequisites are verified; retain separate decisions for each.
4. **Exception queue:** prioritize conflicting effective dates, unclear finished-product category, missing product identity, unscoped method, absent lot CoA, and unsigned dispositions.

## Validation before closure
A case is eligible for a *human* closure decision only if (a) every required original gate is linked to original verified documents; (b) all conflicting sources are resolved by qualified reviewers; (c) the applicable product-specific legal requirement and laboratory findings are independently signed; and (d) authorized QA/commercial disposition is recorded. The software must not auto-approve or auto-release.

**Batch128 changes no product state, does not send requests, and records no documentary receipt or approval.**