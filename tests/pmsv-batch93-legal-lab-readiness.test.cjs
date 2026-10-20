"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const scope=JSON.parse(fs.readFileSync(root+"data/rules/pmsv-final35-legal-test-scope-review-batch92-2026-10-20.json","utf8"));
const closed=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json","utf8"));
const js=fs.readFileSync(root+"pmsv-batch93-legal-lab-readiness-ui-2026-10-20.js","utf8");
const html=fs.readFileSync(root+"index.html","utf8");
let a=0x811c9dc5,b=0x9747b28c;
for(const c of JSON.stringify(scope)){let x=c.charCodeAt(0);a=Math.imul(a^x,16777619);b=Math.imul(b^x,2246822519)}
const digest=(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
assert.equal(digest,"aa456a9cb3ca2d2b");
assert(js.includes('PIN="aa456a9cb3ca2d2b"'));
assert.equal(scope.records.length,35);
const previous=new Map(closed.cases.map(x=>[x.case_id,x])),ids=new Set(),proof=new Set();
for(const r of scope.records){
 const old=previous.get(r.catalogue_id);assert(old);
 assert.equal(r.product,old.product);assert.equal(r.priority,old.priority);
 assert.equal(r.analyte,old.analyte);assert.deepEqual(r.original_evidence_request_ids,old.original_evidence_request_ids);
 assert.equal(r.current_product_applicable_numeric_limit,"NOT_SIGNED");
 assert.equal(r.valid_lab_method_and_scope,"NOT_SIGNED");
 assert.equal(r.representative_lot_coa,"NOT_RECEIVED");
 assert.equal(r.lot_regulatory_PASS,"NOT_DETERMINED");
 assert.equal(r.QA_lot_release,"HELD");
 assert.equal(r.product_approval,"NO");
 assert(!ids.has(r.catalogue_id));ids.add(r.catalogue_id);
 for(const id of r.original_evidence_request_ids){assert(!proof.has(id));proof.add(id)}
}
assert.deepEqual([ids.size,proof.size],[35,175]);
assert(js.includes("window.pmsvB87Catalogue?.closureVerified"));
assert(js.includes("pmsvB14Digest(v)!==PIN"));
assert(js.includes("typeof productCatalog"));
assert(js.includes("r.product_approval!=="));
assert(js.includes("original_evidence_request_ids.join"));
assert(js.includes("window.pmsvB91EvidenceRegister"));
assert(js.includes("openInProductChecker"));
assert(js.includes("No authenticated original supplier documents"));
assert(!js.includes("localStorage.setItem"));
assert(!js.includes("sessionStorage.setItem"));
assert(html.includes("pmsv-batch93-legal-lab-readiness-ui-2026-10-20.js"));
console.log("B93 PASS: authentic 35 B92 scopes pinned, original 175 proof IDs, no legal/lot approvals.");
