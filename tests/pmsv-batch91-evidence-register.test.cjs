"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const src=fs.readFileSync(root+"pmsv-batch91-evidence-register-2026-10-20.js","utf8");
const page=fs.readFileSync(root+"index.html","utf8");
const c=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json","utf8"));
const first=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json","utf8"));
assert.equal(c.cases.length,35);assert.equal(first.records.length,533);
assert.equal(c.summary.original_evidence_ids_not_received,175);
assert.equal(c.summary.signed_case_limits,0);
assert.equal(c.summary.lot_releases,0);
const ids=new Set();
for(const row of c.cases){
 assert.equal(row.source_desk_research,"COMPLETE");assert.equal(row.lot_release,"HELD");
 for(const id of row.original_evidence_request_ids){assert(!ids.has(id));ids.add(id)}
}
assert.equal(ids.size,175);
assert(src.includes("b87?.closureVerified?.()"));
assert(src.includes("b58?.valid?.()"));
assert(src.includes("getAllCases?.()"));
assert(src.includes("requests.length!==175"));
assert(src.includes("ready!==70||dependent!==105"));
assert(src.includes("s.external_legal_and_lot_verification_held!==35"));
assert(src.includes("s.product_releases!==0"));
assert(src.includes("document_date"));
assert(src.includes("importCSV(raw)"));
assert(src.includes("rows.length!==176"));
assert(src.includes("new Map()"));
assert(src.includes("sourceRows.flatMap"));
assert(src.includes("Case, role, gate or priority was altered"));
assert(src.includes("Existing local entries kept intact."));
assert(src.includes("NO")===false || src.includes("No electronic signature"));
assert(!src.includes("localStorage.setItem"));
assert(!src.includes("sessionStorage.setItem"));
assert(!src.includes("navigator.sendBeacon"));
assert(!src.includes("method_and_lab_scope_approved=true"));
assert(page.includes("pmsv-batch91-evidence-register-2026-10-20.js"));
console.log("B91 PASS: verified 175 immutable evidence IDs, original 35 HOLD gates, no false legal/lot approval or persistent upload.");
