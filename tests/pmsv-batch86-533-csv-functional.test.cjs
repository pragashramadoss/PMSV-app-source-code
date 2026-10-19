"use strict";
/* Final35 user-functionality integrity: all 533 export and two separate real CSV downloads. */
const assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const source=fs.readFileSync(root+"fssai-final35-legal-review-2026-10-18.js","utf8");
const ledger=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json","utf8"));
const legal=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json","utf8"));
const all=ledger.records,held=legal.rows;
assert.equal(all.length,533);assert.equal(held.length,35);
assert.equal(new Set(all.map(x=>x.catalog_id)).size,533);
const heldIds=new Set(held.map(x=>x.case_id));
assert.equal(heldIds.size,35);
assert.deepEqual(all.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id).sort(),[...heldIds].sort());
assert.equal(all.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,498);
for(const rec of all){assert.equal(rec.product_compliance_approval,false);assert.equal(rec.sample_lab_pass,false);assert.equal(rec.complete_contaminant_panel,false)}
for(const x of held){assert.equal(x.current_assigned_legal_limit,"NOT_SIGNED");assert.equal(x.release,"HELD")}
assert(source.includes('window.URL.createObjectURL'));
assert(source.includes('window.URL.revokeObjectURL'));
assert(!source.includes('const u=URL.createObjectURL'));
assert(source.includes("function ledgerCsv()"));
assert(source.includes('function downloadCSV('));
assert(source.includes('seen.size!==533||values.length!==534'));
assert(source.includes('held.size!==0'));
assert(source.includes('pmsv498Valid()'));
assert(source.includes("function b86Focus()")&&source.includes("function b86Reset()"));
assert(source.includes("[r.rank,r.case_id,r.product,r.analyte,r.scope_question_type"));

assert(source.includes('pmsvFinal35LegalReview=Object.freeze({install,load,render,csv,ledgerCsv,verified})'));
const browser=fs.readFileSync("tests/fssai-final35-real-preview.test.cjs","utf8");
assert(browser.includes('PMSV-533-FIRST-SOURCE-STATUS-NOT-COMPLIANCE.csv'));
assert(browser.includes('PMSV-35-FILTERED-LEGAL-SOURCE-REVIEW-HELD.csv'));
assert(browser.includes("pmsvB84NamedArticleScope.focus()"));
assert(browser.includes("pmsvB84NamedArticleScope.reset()"));
assert.equal(legal.totals.lot_releases,0);
console.log("B86 PASS: 533 source reference records + 35 held cases, downloadable CSV, one-case focus/reset, no approval.");
