"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","fssai-product-helper-preview-01");
const d=JSON.parse(fs.readFileSync(path.join(root,"data/rules/fssai-current35-dual-manual-method-conflict-batch42-2026-10-16.json"),"utf8"));
const o=JSON.parse(fs.readFileSync(path.join(root,"data/rules/pmsv-batch134-35-held-documentary-readiness-2026-10-29.json"),"utf8"));
const page=fs.readFileSync(path.join(root,"pmsv-batch138-metals-method-authority.html"),"utf8");
const home=fs.readFileSync(path.join(root,"index.html"),"utf8");
const all35=fs.readFileSync(path.join(root,"pmsv-batch128-35-regulatory-review.html"),"utf8");
const p0=fs.readFileSync(path.join(root,"pmsv-batch135-p0-evidence-method-triage.html"),"utf8");
const p1=fs.readFileSync(path.join(root,"pmsv-batch136-p1-evidence-reconciliation.html"),"utf8");
const handoff=fs.readFileSync(path.join(root,"pmsv-batch137-35-evidence-owner-handoff.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(digest(d),"3ae26a20e1c30661");
assert.equal(digest(o),"79fa7beec3d59b37");
assert.equal(d.counts.method_ids_colliding_across_official_hosted_manuals,7);
assert.equal(d.counts.additional_trace_only_method_numbers,3);
assert.equal(d.counts.trace_metals_on_method_version_hold,27);
assert.equal(d.counts.other_cases_on_compound_matrix_evidence_hold,8);
assert.equal(d.counts.all_cases_touched,35);
assert.equal(d.counts.legally_approved_ctr_articles,0);assert.equal(d.counts.real_laboratory_lot_passes,0);
assert.equal(d.product_method_holds.length,35);
assert.equal(d.conflict_method_cards.length,7);assert.equal(d.one_sided_trace_method_cards.length,3);
const original=new Map(o.cases.map(c=>[c.case_id,c]));
assert.equal(original.size,35);assert.equal(o.summary.held,35);assert.equal(o.summary.lot_releases,0);
assert.equal(o.summary.method_matrix_approvals,0);assert.equal(o.summary.current_receipts_verified,0);
const metal=d.product_method_holds.filter(x=>x.analyte_family==="TRACE_METALS");
assert.equal(metal.length,27);
for(const c of d.product_method_holds){
 const v=original.get(c.catalog_id);
 assert.ok(v);assert.equal(v.rank,c.rank);assert.equal(v.product,c.product_name);assert.equal(v.analyte,c.analyte);
 assert.equal(v.lot_release,"HELD");assert.equal(v.legal_limit,"NOT_SIGNED");
 assert.equal(v.laboratory_method_matrix,"NOT_SIGNED");assert.equal(v.representative_lot_CoA,"NOT_RECEIVED");
}
for(let i=0;i<7;i++){
 const c=d.conflict_method_cards[i];
 assert.equal(c.method_number,"FSSAI 09.00"+(i+1)+":2024");
 assert.equal(c.method_identity_consistent_across_manuals,false);
 assert.equal(c.source_priority_established,false);
 assert.equal(c.allow_method_number_only,false);
 assert.ok(c.trace_elements_manual?.url?.startsWith("https://"));
 assert.ok(c.metals_and_minerals_manual?.url?.startsWith("https://"));
 assert.notEqual(c.trace_elements_manual.title,c.metals_and_minerals_manual.title);
}
assert.match(page,/PIN_CONFLICT="3ae26a20e1c30661"/);
assert.match(page,/PIN_ORIGINAL="79fa7beec3d59b37"/);
assert.match(page,/digest\(d\)!==PIN_CONFLICT/);assert.match(page,/digest\(o\)!==PIN_ORIGINAL/);
assert.match(page,/function exportConflicts\(\)/);assert.match(page,/function exportCases\(\)/);
assert.match(page,/source pin\/integrity or HOLD invariant mismatch/i);
assert.match(page,/downloads disabled/);
assert.match(page,/These are source descriptions, not approved procedure selections/);
assert.doesNotMatch(page,/innerHTML\s*=/);
const inline=page.match(/<script>([\s\S]*?)<\/script>/);assert.ok(inline);new Function(inline[1]);
for(const [where,src] of Object.entries({home,all35,p0,p1,handoff})){
 assert.match(src,/pmsv-batch138-metals-method-authority\.html/,where+" navigation broken");
}
console.log("PMSV Batch138 PASS: 7 official dual-manual method ID collisions, 3 trace-only, 27 metal/8 other cases, 35 HOLD, source pin verified, links intact.");
