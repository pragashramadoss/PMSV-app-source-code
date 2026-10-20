"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const root="fssai-product-helper-preview-01/";
const b92=JSON.parse(fs.readFileSync(root+"data/rules/pmsv-final35-legal-test-scope-review-batch92-2026-10-20.json","utf8"));
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const script=fs.readFileSync(root+"pmsv-batch93-legal-lab-readiness-ui-2026-10-20.js","utf8");
const text=fs.readFileSync(root+"data/rules/PMSV-B94-175-ORIGINAL-UNSENT-EVIDENCE-REQUESTS-2026-10-20.csv","utf8");
const forms=fs.readFileSync("PMSV-B94-35-COMMERCIAL-PRODUCT-APPROVAL-SIGNOFF-FORMS-HELD-2026-10-20.csv","utf8");
const rows=new Map(b92.records.map(x=>[x.catalogue_id,x])),proof=new Set(),role=new Map();
let prep=0,later=0;
for(const c of b56.cases){
 const r=rows.get(c.catalogue_id);assert(r);assert.equal(r.product,c.product_name);
 assert.equal(c.gates.length,5);
 for(const g of c.gates){
  assert(r.original_evidence_request_ids.includes(g.request_id));
  assert(!proof.has(g.request_id));proof.add(g.request_id);
  assert.equal(g.immutable_request_state,"NOT_SENT");
  assert.equal(g.immutable_document_state,"NOT_RECEIVED");
  role.set(g.owner_role,(role.get(g.owner_role)||0)+1);
  g.dependency_codes.length?later++:prep++;
 }
 assert.equal(r.current_product_applicable_numeric_limit,"NOT_SIGNED");
 assert.equal(r.valid_lab_method_and_scope,"NOT_SIGNED");
 assert.equal(r.QA_lot_release,"HELD");
}
assert.deepEqual([rows.size,proof.size,prep,later,role.size],[35,175,70,105,5]);
for(const count of role.values())assert.equal(count,35);
assert.equal((text.match(/"NOT_SENT","NOT_RECEIVED","NOT_SIGNED","NO","HELD"/g)||[]).length,175);
assert.equal((forms.match(/"NOT_DETERMINED","HELD"/g)||[]).length,35);
assert.equal(text.trim().split("\r\n").length,176);
assert.equal(forms.trim().split("\r\n").length,36);
assert(script.includes("data-b94-requests")&&script.includes("data-b94-forms"));
assert(script.includes('setTimeout(()=>{void evidence()},0)'));
console.log("B94 PASS: 175 original evidence requests, 35 unchanged HELD commercial cases, 70 preparatory + 105 dependent.");
