"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","fssai-product-helper-preview-01");
const d=JSON.parse(fs.readFileSync(path.join(root,"data/rules/pmsv-batch134-35-held-documentary-readiness-2026-10-29.json"),"utf8"));
const html=fs.readFileSync(path.join(root,"pmsv-batch136-p1-evidence-reconciliation.html"),"utf8");
const main=fs.readFileSync(path.join(root,"index.html"),"utf8");
const all35=fs.readFileSync(path.join(root,"pmsv-batch128-35-regulatory-review.html"),"utf8");
const p0page=fs.readFileSync(path.join(root,"pmsv-batch135-p0-evidence-method-triage.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
function group(c){if(c.analyte==="Lead")return"LEAD";if(c.analyte==="Pesticide MRLs"||c.analyte==="Residues")return"RESIDUES";if(c.analyte==="Aflatoxins"||c.analyte==="Ochratoxin A")return"MYCOTOXINS";return"UNKNOWN"}
assert.equal(digest(d),"79fa7beec3d59b37");
assert.equal(d.kind,"PMSV_BATCH134_35_HELD_DOCUMENTARY_READINESS_NO_PRODUCT_APPROVAL");
assert.equal(d.legacy_id_semantics_authenticated,false);
assert.equal(d.proposed_gates_are_separate_from_legacy_ids,true);
assert.equal(d.summary.catalogue,533);
assert.equal(d.cases.length,35);assert.equal(d.requests.length,175);assert.equal(d.proposed_gates.length,5);
assert.equal(d.summary.current_receipts_verified,0);
assert.equal(d.summary.regulatory_approvals,0);assert.equal(d.summary.lot_releases,0);
const p1=d.cases.filter(c=>c.priority==="P1"),p0=d.cases.filter(c=>c.priority==="P0");
assert.equal(p1.length,22);assert.equal(p0.length,13);
assert.equal(p1.filter(c=>group(c)==="LEAD").length,15);
assert.equal(p1.filter(c=>group(c)==="RESIDUES").length,4);
assert.equal(p1.filter(c=>group(c)==="MYCOTOXINS").length,3);
assert.equal(p1.filter(c=>!c.recorded_fssr).length,5);
const ids=new Set(),requestIndex=new Map(d.requests.map(r=>[r.request_id,r]));
for(const c of p1){
 assert.equal(c.original_request_ids.length,5);
 assert.equal(c.legal_limit,"NOT_SIGNED");
 assert.equal(c.laboratory_method_matrix,"NOT_SIGNED");
 assert.equal(c.representative_lot_CoA,"NOT_RECEIVED");
 assert.equal(c.lot_release,"HELD");
 assert.equal(c.document_receipt_status,"NOT_RECEIVED_AT_2026_10_20_SNAPSHOT_CURRENT_STATUS_UNVERIFIED");
 for(const id of c.original_request_ids){
  assert.equal(ids.has(id),false);ids.add(id);
  const req=requestIndex.get(id);
  assert.ok(req);assert.equal(req.case_id,c.case_id);assert.equal(req.priority,"P1");
  assert.equal(req.request_wording_authenticated,false);
  assert.equal(req.snapshot_2026_10_20,"NOT_RECEIVED");assert.equal(req.current_receipt,"NOT_VERIFIED");
 }
}
assert.equal(ids.size,110);
assert.equal(new Set(p0.flatMap(c=>c.original_request_ids)).size,65);
assert.match(html,/PIN="79fa7beec3d59b37"/);
assert.match(html,/digest\(d\)!==PIN/);
assert.match(html,/function validate\(d\)/);
assert.match(html,/function exportCases\(\)/);
assert.match(html,/function exportRequests\(\)/);
assert.match(html,/no cases or CSV exports enabled/);
assert.match(html,/ORIGINAL FSSR BLANK/);
assert.match(html,/1 December 2026/);
assert.doesNotMatch(html,/innerHTML\s*=/);
assert.match(main,/pmsv-batch136-p1-evidence-reconciliation\.html/);
assert.match(all35,/pmsv-batch136-p1-evidence-reconciliation\.html/);
assert.match(p0page,/pmsv-batch136-p1-evidence-reconciliation\.html/);
const script=html.match(/<script>([\s\S]*?)<\/script>/);assert.ok(script);
new Function(script[1]);
console.log("PMSV Batch136: source pin correct; 22 P1 (15 Pb, 4 residue, 3 mycotoxin), 5 missing FSSR, 110 original IDs; all HELD, 0 releases; 3 navigation links present.");
