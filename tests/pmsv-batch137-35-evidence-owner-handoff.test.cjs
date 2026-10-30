"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","fssai-product-helper-preview-01");
const d=JSON.parse(fs.readFileSync(path.join(root,"data/rules/pmsv-batch134-35-held-documentary-readiness-2026-10-29.json"),"utf8"));
const page=fs.readFileSync(path.join(root,"pmsv-batch137-35-evidence-owner-handoff.html"),"utf8");
const home=fs.readFileSync(path.join(root,"index.html"),"utf8");
const all=fs.readFileSync(path.join(root,"pmsv-batch128-35-regulatory-review.html"),"utf8");
const p0=fs.readFileSync(path.join(root,"pmsv-batch135-p0-evidence-method-triage.html"),"utf8");
const p1=fs.readFileSync(path.join(root,"pmsv-batch136-p1-evidence-reconciliation.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(digest(d),"79fa7beec3d59b37");
assert.equal(d.kind,"PMSV_BATCH134_35_HELD_DOCUMENTARY_READINESS_NO_PRODUCT_APPROVAL");
assert.equal(d.legacy_id_semantics_authenticated,false);
assert.equal(d.proposed_gates_are_separate_from_legacy_ids,true);
assert.equal(d.summary.catalogue,533);assert.equal(d.summary.cases,35);
assert.equal(d.summary.p0,13);assert.equal(d.summary.p1,22);
assert.equal(d.summary.held,35);assert.equal(d.summary.lot_releases,0);
assert.equal(d.summary.current_receipts_verified,0);assert.equal(d.summary.actual_commercial_dossiers_authenticated,0);
assert.equal(d.summary.original_fssr_missing_with_group_route,8);
assert.equal(d.summary.signed_limit_approvals,0);assert.equal(d.summary.method_matrix_approvals,0);
assert.equal(d.summary.regulatory_approvals,0);
assert.equal(d.summary.representative_commercial_lot_coas,0);
assert.equal(d.cases.length,35);assert.equal(d.requests.length,175);
const idMap=new Map(d.requests.map(r=>[r.request_id,r]));
const unique=new Set();
let p0count=0,p1count=0,missing=0;
for(const c of d.cases){
 if(c.priority==="P0")p0count++;if(c.priority==="P1")p1count++;
 if(!c.recorded_fssr){missing++;assert.ok(c.regulatory_route_group);assert.ok(c.regulatory_route_source)}
 assert.equal(c.original_request_ids.length,5);
 assert.equal(c.lot_release,"HELD");
 assert.equal(c.legal_limit,"NOT_SIGNED");
 assert.equal(c.laboratory_method_matrix,"NOT_SIGNED");
 assert.equal(c.representative_lot_CoA,"NOT_RECEIVED");
 assert.equal(c.document_receipt_status,"NOT_RECEIVED_AT_2026_10_20_SNAPSHOT_CURRENT_STATUS_UNVERIFIED");
 for(const id of c.original_request_ids){
  assert.equal(unique.has(id),false);unique.add(id);
  const r=idMap.get(id);assert.ok(r);assert.equal(r.case_id,c.case_id);assert.equal(r.priority,c.priority);
  assert.equal(r.request_wording_authenticated,false);
  assert.equal(r.snapshot_2026_10_20,"NOT_RECEIVED");assert.equal(r.current_receipt,"NOT_VERIFIED");
 }
}
assert.equal(p0count,13);assert.equal(p1count,22);assert.equal(unique.size,175);assert.equal(missing,8);
assert.equal(d.proposed_gates.length,5);
assert.deepEqual(new Set(d.proposed_gates.map(g=>g.gate)).size,5);
assert.equal(d.cases.length*d.proposed_gates.length,175);
assert.match(page,/PIN="79fa7beec3d59b37"/);
assert.match(page,/digest\(d\)!==PIN/);
assert.match(page,/source mismatch or incomplete HOLD safeguards/);
assert.match(page,/function exportCases\(\)/);
assert.match(page,/function exportOriginals\(\)/);
assert.match(page,/function exportOwners\(\)/);
assert.match(page,/OPAQUE_NOT_MAPPED/);
assert.match(page,/not a translation of the opaque historical ID suffixes/);
assert.match(page,/1 December 2026/);
assert.doesNotMatch(page,/innerHTML\s*=/);
assert.match(page,/records and CSV downloads disabled/);
const script=page.match(/<script>([\s\S]*?)<\/script>/);assert.ok(script);new Function(script[1]);
for(const [name,source] of Object.entries({main:home,all35:all,p0,p1})){
 assert.match(source,/pmsv-batch137-35-evidence-owner-handoff\.html/,name+" lacks navigation");
}
console.log("PMSV Batch137 PASS: all 35 cases, 175 opaque IDs, 5 separate owner gates x 35, 8 missing FSSR, no receipts/approvals/releases, links valid and JS compiled.");
