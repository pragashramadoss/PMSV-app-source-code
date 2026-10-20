"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const a=JSON.parse(fs.readFileSync("fssai-product-helper-preview-01/data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const b=JSON.parse(fs.readFileSync("fssai-product-helper-preview-01/data/rules/pmsv-batch95-35-first-evidence-sequence-2026-10-20.json","utf8"));
assert.equal(b.kind,"PMSV_BATCH95_EVIDENCE_ACTION_SEQUENCE_NO_APPROVAL");
assert.deepEqual([b.totals.cases,b.totals.immediate,b.totals.dependent,b.totals.real_approvals,b.totals.released_lots],[35,70,105,0,0]);
const cases=new Map(a.cases.map(x=>[x.catalogue_id,x])),used=new Set(),ready=new Set(),wait=new Set();
for(const r of b.cases){
 const src=cases.get(r.id);assert(src);assert.equal(src.product_name,r.product);assert.equal(src.analyte,r.analyte);
 assert.equal(r.status,"RESEARCH_COMPLETE_COMMERCIAL_HELD");assert.equal(r.first_two.length,2);assert.equal(r.downstream_three.length,3);
 for(const id of r.first_two){const g=src.gates.find(g=>g.request_id===id);assert(g);assert.equal(g.dependency_codes.length,0);assert(!used.has(id));used.add(id);ready.add(id);}
 for(const id of r.downstream_three){const g=src.gates.find(g=>g.request_id===id);assert(g);assert(g.dependency_codes.length>0);assert(!used.has(id));used.add(id);wait.add(id);}
}
assert.deepEqual([used.size,ready.size,wait.size],[175,70,105]);
const now=fs.readFileSync("PMSV-BATCH95-70-IMMEDIATE-UNSENT-EVIDENCE-REQUESTS-2026-10-20.csv","utf8");
const later=fs.readFileSync("PMSV-BATCH95-105-DOWNSTREAM-LEGAL-LAB-QA-BLOCKERS-2026-10-20.csv","utf8");
assert.equal(now.trim().split("\r\n").length,71);
assert.equal(later.trim().split("\r\n").length,106);
assert.equal((now.match(/"NO","NO","NO","NO","NO","HELD"/g)||[]).length,70);
assert.equal((later.match(/"NO","NO","NO","NO","NO","HELD"/g)||[]).length,105);
console.log("Batch95 PASS: 35 cases; 70 initial requests + 105 gated later, 0 real approvals or releases.");
