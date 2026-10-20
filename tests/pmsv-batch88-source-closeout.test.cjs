"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),root="fssai-product-helper-preview-01/";
const d=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json","utf8"));
const a=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json","utf8"));
const l=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json","utf8"));
const js=fs.readFileSync(root+"fssai-final35-legal-review-2026-10-18.js","utf8");
const ext=n=>{const p="const "+n+"=Object.freeze(",i=js.indexOf(p);assert(i>=0);let start=i+p.length;return JSON.parse(js.slice(start,js.indexOf("]);",start)+1))};
const cmp=new Map([...ext("B84_SCOPE"),...ext("B85_SCOPE")].map(x=>[x[0],x]));
const original=new Map(a.rows.map(x=>[x.rank,x]));
const ids=new Set(),proof=new Set();let p0=0,p1=0,numeric=0,named=0;
for(const r of d.cases){
 const a=original.get(r.rank),c=cmp.get(r.rank);
 assert(a&&c);assert(!ids.has(r.case_id));ids.add(r.case_id);
 assert.equal(r.product,a.product);assert.equal(r.analyte,a.analyte);assert.equal(r.case_id,a.case_id);
 assert.equal(r.comparator_analyte,c[1]);assert.equal(r.referenced_article,c[2]);
 assert.equal(r.published_value_NOT_APPLIED,c[3]);assert.equal(r.unit_NOT_APPLIED,c[3]===null?null:c[4]);
 assert.equal(r.official_ctr_page,c[5]);assert.equal(r.regulatory_reason_not_transferred,c[6]);
 assert.equal(r.first_commercial_document_needed,c[7]);
 assert.equal(r.source_desk_research,"COMPLETE");assert.equal(r.applicable_legal_limit,"NOT_SIGNED");
 assert.equal(r.lab_method_matrix,"NOT_SIGNED");assert.equal(r.lot_release,"HELD");
 for(const id of r.original_evidence_request_ids){assert(!proof.has(id));proof.add(id)}
 r.priority==="P0"?p0++:p1++;if(r.published_product_identity)named++;if(r.published_value_NOT_APPLIED!==null)numeric++;
}
assert.deepEqual([ids.size,proof.size,p0,p1,numeric,named],[35,175,13,22,23,28]);
assert.deepEqual([l.records.length,l.partial_exact,l.first_source_pending],[533,498,35]);
assert.equal(d.summary.signed_case_limits,0);assert.equal(d.summary.lot_releases,0);
assert.equal(d.future_CTR_amendment_effective,"2026-12-01");
console.log("B88 PASS: source desk research complete 35/35, 23 + 12, 175 original requests, 0 approvals / 0 releases.");
