"use strict";
/* Batch89: user-visible research closeout is entirely distinct from legal/lot release. */
const assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const src=fs.readFileSync(root+"fssai-final35-legal-review-2026-10-18.js","utf8");
const b88=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json","utf8"));
const ledger=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json","utf8"));
const audit=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json","utf8"));
let a=0x811c9dc5,b=0x9747b28c;
for(const ch of JSON.stringify(b88)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}
const digest=(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
assert.equal(digest,"4d1590738e747a2a");
assert(src.includes('B89_PIN="4d1590738e747a2a"'));
assert(src.includes('B89_FILE="./data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json"'));
assert(src.includes('closeout.kind!=="PMSV_FINAL35_SOURCE_DESK_RESEARCH_COMPLETE_NO_PRODUCT_APPROVAL"'));
assert(src.includes('closeout.future_CTR_amendment_effective!=="2026-12-01"'));
assert(src.includes('function verifyResearchCloseout(all)'));
assert(src.includes('if(!verifyResearchCloseout(all))return blocked('));
assert(src.includes('public_source_desk_research_open:0'));
assert(src.includes('external_legal_and_lot_verification_held:35'));
assert(src.includes('CLOSED_PUBLIC_SOURCE_DESK_RESEARCH'));
assert(src.includes('EXTERNAL_EVIDENCE_HELD'));
assert(src.includes('CONDITIONAL_FIRST_SOURCE_REFERENCE_RECORDED'));
assert(src.includes('source_status_original_ledger'));
assert(src.includes('source_desk_research_disposition'));
assert(src.includes('original_evidence_request_ids'));
assert(src.includes('getAll?.()'));
assert.deepEqual([ledger.records.length,ledger.partial_exact,ledger.first_source_pending],[533,498,35]);
assert.deepEqual([b88.cases.length,audit.rows.length],[35,35]);
const proof=new Set(),cases=new Map(audit.rows.map(c=>[c.case_id,c]));
let n=0,none=0,p0=0,p1=0;
for(const c of b88.cases){
 const prior=cases.get(c.case_id);assert(prior);
 assert.equal(c.product,prior.product);
 assert.equal(c.analyte,prior.analyte);
 assert.equal(c.source_desk_research,"COMPLETE");
 assert.equal(c.applicable_legal_limit,"NOT_SIGNED");
 assert.equal(c.lab_method_matrix,"NOT_SIGNED");
 assert.equal(c.lot_release,"HELD");
 assert.equal(c.regulatory_pass,"NOT_DETERMINED");
 assert.equal(c.original_evidence_request_ids.length,5);
 for(const id of c.original_evidence_request_ids){assert(!proof.has(id));proof.add(id)}
 if(c.published_value_NOT_APPLIED===null)none++;else n++;
 c.priority==="P0"?p0++:p1++;
}
assert.deepEqual([n,none,p0,p1,proof.size],[23,12,13,22,175]);
assert.equal(b88.summary.signed_case_limits,0);
assert.equal(b88.summary.lot_releases,0);
console.log("B89 PASS: all 35 original-source desk cases finalized and live-UI gated; 0 new compliance approvals, 35 legal/lot HELD.");
