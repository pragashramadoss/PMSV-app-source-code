"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const html=fs.readFileSync(root+"pmsv-batch131-533-identity-qa.html","utf8");
const ledger=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json","utf8"));
const closed=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json","utf8"));
function digest(data){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(data)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(digest(ledger),"d142be820899eac5");
assert.equal(digest(closed),"4d1590738e747a2a");
assert.match(html,/LEDGER_PIN="d142be820899eac5"/);
assert.match(html,/CLOSED_PIN="4d1590738e747a2a"/);
assert.match(html,/digest\(l\)!==LEDGER_PIN\|\|digest\(c\)!==CLOSED_PIN/);
assert.match(html,/l\.partial_exact!==498\|\|l\.first_source_pending!==35/);
assert.match(html,/flagged!==102\|\|all\.filter/);
assert.match(html,/all\.filter\(x=>x\.flags\.length===0\)\.length!==431/);
assert.match(html,/c\.summary\?\.lot_releases!==0/);
assert.match(html,/x\.applicable_legal_limit!=="NOT_SIGNED"/);
assert.match(html,/NOT_APPROVED","HELD/);
assert.match(html,/Same name under multiple catalogue IDs/);
assert.match(html,/Never automatically merge duplicated names/);
assert.doesNotMatch(html,/innerHTML\s*=/);
assert.match(html,/document\.createElement\("td"\)/);
assert.match(html,/^\s*<!doctype html>/i);
let script=html.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(script);new Function(script[1]); // client syntax only, no DOM execution
const ids=new Set(),names=new Map(),cases=new Map(closed.cases.map(x=>[x.case_id,x]));
let source={conditional:0,held:0},missingFssr=0,missingFcs=0;
for(const r of ledger.records){
 assert.ok(!ids.has(r.catalog_id));ids.add(r.catalog_id);
 assert.equal(r.product_compliance_approval,false);
 assert.equal(r.complete_contaminant_panel,false);
 assert.equal(r.sample_lab_pass,false);
 if(!r.fssr)missingFssr++;
 if(!r.fcs)missingFcs++;
 let key=r.product_name.toLocaleLowerCase("en").trim().replace(/\s+/g," ");
 if(!names.has(key))names.set(key,[]);names.get(key).push(r.catalog_id);
 if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"){
  assert.ok(!cases.has(r.catalog_id));source.conditional++;
 }else{
  assert.equal(r.source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(cases.get(r.catalog_id)?.product,r.product_name);
  source.held++;
 }
}
const duplicateGroups=[...names.values()].filter(x=>x.length>1);
const repeat=new Set(duplicateGroups.flat());
const flagged=ledger.records.filter(r=>!r.fssr||!r.fcs||repeat.has(r.catalog_id));
assert.deepEqual({count:ids.size,missingFssr,missingFcs,dupGroups:duplicateGroups.length,duplicateNameRows:repeat.size,flagged:flagged.length,noFlag:ids.size-flagged.length,source},
 {count:533,missingFssr:86,missingFcs:10,dupGroups:4,duplicateNameRows:14,flagged:102,noFlag:431,source:{conditional:498,held:35}});
assert.equal(closed.summary.original_evidence_ids_not_received,175);
assert.equal(closed.summary.signed_case_limits,0);
assert.equal(closed.summary.regulatory_passes,0);
assert.equal(closed.summary.lot_releases,0);
console.log("PMSV Batch131 verified: all 533; 102 source-ledger identity flags; 35 held; 0 approvals.");
