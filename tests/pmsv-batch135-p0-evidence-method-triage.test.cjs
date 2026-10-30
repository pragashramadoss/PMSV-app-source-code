"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","fssai-product-helper-preview-01");
const source=JSON.parse(fs.readFileSync(path.join(root,"data/rules/pmsv-batch134-35-held-documentary-readiness-2026-10-29.json"),"utf8"));
const html=fs.readFileSync(path.join(root,"pmsv-batch135-p0-evidence-method-triage.html"),"utf8");
const home=fs.readFileSync(path.join(root,"index.html"),"utf8");
const all35=fs.readFileSync(path.join(root,"pmsv-batch128-35-regulatory-review.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(digest(source),"79fa7beec3d59b37");
assert.equal(source.kind,"PMSV_BATCH134_35_HELD_DOCUMENTARY_READINESS_NO_PRODUCT_APPROVAL");
assert.equal(source.legacy_id_semantics_authenticated,false);
assert.equal(source.proposed_gates_are_separate_from_legacy_ids,true);
assert.equal(source.cases.length,35);assert.equal(source.requests.length,175);assert.equal(source.proposed_gates.length,5);
assert.equal(source.summary.current_receipts_verified,0);assert.equal(source.summary.lot_releases,0);
const p0=source.cases.filter(x=>x.priority==="P0");
assert.equal(p0.length,13);
assert.equal(p0.filter(x=>x.analyte!=="Antibiotics").length,12);
assert.equal(p0.filter(x=>x.case_id==="100-100-royal-jelly"&&x.analyte==="Antibiotics").length,1);
const ids=new Set();
for(const c of p0){
 assert.equal(c.lot_release,"HELD");
 assert.equal(c.legal_limit,"NOT_SIGNED");
 assert.equal(c.laboratory_method_matrix,"NOT_SIGNED");
 assert.equal(c.representative_lot_CoA,"NOT_RECEIVED");
 assert.equal(c.document_receipt_status,"NOT_RECEIVED_AT_2026_10_20_SNAPSHOT_CURRENT_STATUS_UNVERIFIED");
 assert.equal(c.original_request_ids.length,5);
 for(const id of c.original_request_ids){assert.equal(ids.has(id),false);ids.add(id);
  const req=source.requests.find(r=>r.request_id===id);
  assert.ok(req);assert.equal(req.case_id,c.case_id);assert.equal(req.request_wording_authenticated,false);
  assert.equal(req.current_receipt,"NOT_VERIFIED");
 }
}
assert.equal(ids.size,65);
assert.match(html,/const PIN="79fa7beec3d59b37"/);
assert.match(html,/digest\(d\)!==PIN/);
assert.match(html,/function valid\(d\)/);
assert.match(html,/function exportCases\(\)/);
assert.match(html,/function exportIds\(\)/);
assert.match(html,/all P0 cases remain HELD/);
assert.match(html,/1 December 2026/);
assert.doesNotMatch(html,/innerHTML\s*=/);
assert.match(home,/pmsv-batch135-p0-evidence-method-triage\.html/);
assert.match(all35,/pmsv-batch135-p0-evidence-method-triage\.html/);
const script=html.match(/<script>([\s\S]*?)<\/script>/);assert.ok(script);
new Function(script[1]);
console.log("PMSV Batch135: 13 P0 / 12 metals / 1 Royal Jelly, 65 unique opaque IDs, 5 suggested gates, 0 releases; source pinned and links verified.");
