"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const src=fs.readFileSync(root+"fssai-final35-legal-review-2026-10-18.js","utf8");
const l=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json","utf8"));
const a=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json","utf8"));
assert(src.includes("Batch87 — searchable, verified 533-item"));
assert(src.includes("window.pmsvB87Catalogue=Object.freeze({load,render,csv,verify:()=>!!verify(),focus})"));
assert(src.includes("pmsv498Valid()")&&src.includes("pmsvFinal35LegalReview?.verified?.()"));
assert(src.includes("proof.size!==175")&&src.includes("partial!==498||pending!==35"));
assert(src.includes("window.URL.createObjectURL")&&src.includes("window.URL.revokeObjectURL"));
assert(!src.includes("localStorage")&&!src.includes("sessionStorage"));
assert.equal(l.records.length,533);assert.equal(a.rows.length,35);
const ids=new Set(),p=new Set(),cases=new Set(a.rows.map(r=>r.case_id));
let held=0,matched=0;
for(const r of l.records){
 assert(!ids.has(r.catalog_id));ids.add(r.catalog_id);
 assert.equal(r.product_compliance_approval,false);
 assert.equal(r.sample_lab_pass,false);
 assert.equal(r.complete_contaminant_panel,false);
 if(r.source_status==="FIRST_EXACT_SOURCE_PENDING"){held++;assert(cases.has(r.catalog_id));}
 else {matched++;assert.equal(r.source_status,"PARTIAL_EXACT_SOURCE_MATCH");assert(!cases.has(r.catalog_id))}
}
for(const r of a.rows){
 assert.equal(r.release,"HELD");assert.equal(r.current_assigned_legal_limit,"NOT_SIGNED");
 for(const id of r.original_documentary_request_IDs.split(" | ")){assert(!p.has(id));p.add(id);}
}
assert.deepEqual([matched,held,ids.size,p.size],[498,35,533,175]);
console.log("B87 PASS: 533/498/35 source records, 175 preserved evidence requests, all no PASS or release.");
