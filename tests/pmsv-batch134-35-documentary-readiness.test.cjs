"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","fssai-product-helper-preview-01");
const d=JSON.parse(fs.readFileSync(path.join(root,"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json"),"utf8"));
const o=JSON.parse(fs.readFileSync(path.join(root,"data/rules/pmsv-batch134-35-held-documentary-readiness-2026-10-29.json"),"utf8"));
const h=fs.readFileSync(path.join(root,"pmsv-batch128-35-regulatory-review.html"),"utf8");
function digest(value){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(value)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(digest(d),"4d1590738e747a2a");
assert.equal(digest(o),"79fa7beec3d59b37");
assert.match(h,/INTAKE_PIN="79fa7beec3d59b37"/);
assert.match(h,/digest\(o\)!==INTAKE_PIN/);
assert.match(h,/validIntake\(overlay,data\)/);
assert.match(h,/Promise\.all/);
assert.match(h,/Download filtered 175-request CSV/);
assert.match(h,/Opaque historical ID/);
assert.match(h,/five suggested gates/i);
assert.match(h,/all commercial releases HELD/i);
assert.match(h,/source integrity mismatch/);
assert.doesNotMatch(h,/innerHTML\s*=/);
const script=h.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(script);new Function(script[1]);
assert.equal(o.kind,"PMSV_BATCH134_35_HELD_DOCUMENTARY_READINESS_NO_PRODUCT_APPROVAL");
assert.equal(o.legacy_id_semantics_authenticated,false);
assert.equal(o.proposed_gates_are_separate_from_legacy_ids,true);
assert.equal(o.document_status_reference_as_of,"2026-10-20");
assert.equal(o.prior_closeout_digest,"4d1590738e747a2a");
assert.equal(o.prior_batch133_digest,"464f450d6fbe367c");
assert.equal(o.summary.original_request_ids,175);
assert.equal(o.summary.current_receipts_verified,0);
assert.equal(o.summary.original_fssr_present,27);
assert.equal(o.summary.original_fssr_missing_with_group_route,8);
assert.equal(o.summary.source_research_closed,35);
assert.equal(o.summary.lot_releases,0);
assert.equal(o.summary.held,35);
assert.equal(o.proposed_gates.length,5);
assert.equal(new Set(o.proposed_gates.map(g=>g.gate)).size,5);
assert.equal(o.cases.length,35);assert.equal(o.requests.length,175);
const originals=new Map(d.cases.map(c=>[c.case_id,c]));
const rids=new Set();let missing=0,p0=0,p1=0;
for(const c of o.cases){
 const prev=originals.get(c.case_id);assert.ok(prev);
 assert.equal(c.rank,prev.rank);assert.equal(c.product,prev.product);
 assert.equal(c.priority,prev.priority);assert.equal(c.analyte,prev.analyte);
 assert.deepEqual(c.original_request_ids,prev.original_evidence_request_ids);
 assert.equal(c.document_receipt_status,"NOT_RECEIVED_AT_2026_10_20_SNAPSHOT_CURRENT_STATUS_UNVERIFIED");
 assert.equal(c.legal_limit,"NOT_SIGNED");assert.equal(c.laboratory_method_matrix,"NOT_SIGNED");
 assert.equal(c.lot_release,"HELD");
 if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else assert.fail("priority");
 if(!c.recorded_fssr){missing++;assert.ok(c.regulatory_route_group);assert.ok(c.regulatory_route_source)}
 else assert.equal(c.regulatory_route_group,null);
}
for(const r of o.requests){
 const c=originals.get(r.case_id);assert.ok(c.original_evidence_request_ids.includes(r.request_id));
 assert.equal(r.request_wording_authenticated,false);
 assert.equal(r.snapshot_2026_10_20,"NOT_RECEIVED");
 assert.equal(r.current_receipt,"NOT_VERIFIED");
 assert.ok(!rids.has(r.request_id));rids.add(r.request_id);
}
assert.equal(rids.size,175);assert.equal(missing,8);assert.equal(p0,13);assert.equal(p1,22);
assert.deepEqual(o.summary.groups_missing_fssr,{INFANT_NUTRITION:1,OTHER_SUBSTANCES:5,AYURVEDA_RECIPES:2});
console.log("PMSV Batch134: 35 original cases, 175 opaque request IDs, five separate suggested gates, eight FSSR route flags; zero approvals/releases.");
