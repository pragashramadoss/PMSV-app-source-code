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

// Batch132: named Ayurveda Aahara source references only; immutable legacy ledger is NOT mutated.
const triage=JSON.parse(fs.readFileSync(root+"data/rules/pmsv-batch132-102-identity-source-triage-2026-10-29.json","utf8"));
assert.equal(digest(triage),"e4dffdcebe0f0eeb");
assert.equal(triage.kind,"PMSV_BATCH132_102_SOURCE_IDENTITY_TRIAGE_NO_APPROVAL");
assert.equal(triage.prior_ledger_sha,"d142be820899eac5");
assert.equal(triage.prior_closeout_sha,"4d1590738e747a2a");
assert.equal(triage.summary.provisional_codes_written_to_ledger,0);
assert.equal(triage.summary.commercial_approvals,0);
assert.equal(triage.summary.original_identity_flagged,102);
assert.equal(triage.summary.ayurveda_named_candidates,10);
assert.match(html,/TRIAGE_PIN="e4dffdcebe0f0eeb"/);
assert.match(html,/function validateTriage\(t,base\)/);
assert.match(html,/digest\(t\)!==TRIAGE_PIN/);
assert.match(html,/renderTriage\(\)/);
assert.match(html,/102\.1_SOURCE_REFERENCE_ONLY_NOT_APPLIED/);
assert.match(html,/Official named source lists 102\.1 · not applied to commercial SKU/);
assert.match(html,/Four source snapshots verified/);
const byId=new Map(ledger.records.map(x=>[x.catalog_id,x]));
const expected=new Set(["12.1","13.1","14.1","14.2","14.3","14.4","14.5","14.6","14.7","15.1"]);
let namedConditional=0,namedHeld=0;
for(const r of triage.ayurveda_foscos_source_candidates){
 const original=byId.get(r.catalog_id);
 assert.ok(original&&!original.fcs);
 assert.equal(r.product_name,original.product_name);
 assert.ok(expected.delete(r.recipe_code));
 assert.equal(r.conditional_source_category,"102.1");
 assert.equal(r.source_confirmation,"OFFICIAL_NAMED_PRODUCT_LIST_REFERENCE_ONLY");
 assert.equal(r.marketed_recipe_authenticated,false);
 assert.equal(r.commercial_compliance_approval,false);
 assert.equal(r.commercial_lot_release,false);
 assert.equal(r.original_fcs,"");
 if(original.source_status==="FIRST_EXACT_SOURCE_PENDING")namedHeld++;else namedConditional++;
}
assert.equal(expected.size,0);
assert.deepEqual({namedConditional,namedHeld},{namedConditional:8,namedHeld:2});
assert.equal(triage.duplicate_name_groups.length,4);
for(const group of triage.duplicate_name_groups){
 assert.equal(group.same_fssr,true);assert.equal(group.distinct_fcs,true);
 assert.equal(new Set(group.rows.map(r=>r.fcs)).size,group.rows.length);
}
assert.equal(triage.duplicate_name_groups.reduce((a,x)=>a+x.rows.length,0),14);
const miss=triage.missing_fssr_foscos_family_rollup;
assert.equal(miss.reduce((a,x)=>a+x.count,0),86);
assert.equal(miss.reduce((a,x)=>a+x.held,0),8);
assert.equal(new Set(miss.flatMap(x=>x.catalog_ids)).size,86);
console.log("PMSV Batch132 verified: 10 official named FoSCoS 102.1 source candidates; 4 distinct FCS duplicate groups; 86 FSSR blanks retained.");

// Batch133: 86 missing-FSSR source-navigation routes, with no inferred numeric standards or approvals.
const routes=JSON.parse(fs.readFileSync(root+"data/rules/pmsv-batch133-86-fssr-regulatory-routes-2026-10-29.json","utf8"));
assert.equal(digest(routes),"464f450d6fbe367c");
assert.equal(routes.kind,"PMSV_BATCH133_86_FSSR_REGULATORY_ROUTE_CROSSWALK_NO_APPROVAL");
assert.equal(routes.prior_ledger_sha,"d142be820899eac5");
assert.equal(routes.prior_closeout_sha,"4d1590738e747a2a");
assert.equal(routes.prior_batch132_sha,"e4dffdcebe0f0eeb");
assert.equal(routes.summary.original_catalogue,533);
assert.equal(routes.summary.missing_original_fssr,86);
assert.equal(routes.summary.route_groups,9);
assert.equal(routes.summary.source_held,8);
assert.equal(routes.summary.source_conditional,78);
assert.equal(routes.summary.stored_fssr_codes_added,0);
assert.equal(routes.summary.exact_product_standards_authenticated,0);
assert.equal(routes.summary.commercial_approvals,0);
assert.equal(routes.summary.commercial_lot_releases,0);
assert.match(html,/ROUTES_PIN="464f450d6fbe367c"/);
assert.match(html,/function validateRoutes\(r,base\)/);
assert.match(html,/digest\(r\)!==ROUTES_PIN/);
assert.match(html,/renderTriage\(\);renderRoutes\(\)/);
assert.match(html,/Batch133: source routes for all 86 absent FSSR numbers/);
assert.match(html,/batch133_regulatory_route_NOT_FSSR/);
assert.match(html,/drafts, not operative limits/);
const expectedRoutes=new Map([
 ["FRESH_PRODUCE",[6,0,"FOSCOS_NO_DIRECT_FSSR_NUMBER"]],
 ["EDIBLE_DRY_SEEDS",[2,0,"LICENSING_ORDER_NOT_PRODUCT_STANDARD"]],
 ["MOUTH_FRESHENERS",[3,0,"FOSCOS_NO_DIRECT_FSSR_NUMBER"]],
 ["INFANT_NUTRITION",[11,1,"SEPARATE_PRODUCT_REGULATION"]],
 ["ALCOHOLIC_BEVERAGES",[20,0,"SEPARATE_PRODUCT_REGULATION"]],
 ["INDIAN_SWEETS",[12,0,"LICENSING_ORDER_NOT_PRODUCT_STANDARD"]],
 ["NAMED_ADDITIVES",[18,0,"SUBSTANCE_USE_REQUIRES_MATRIX_CHECK"]],
 ["OTHER_SUBSTANCES",[6,5,"SUBSTANCE_USE_REQUIRES_MATRIX_CHECK"]],
 ["AYURVEDA_RECIPES",[8,2,"SPECIAL_REGULATION_NAMED_SOURCE"]]
]);
const routeIDs=new Set();let routedHeld=0;
for(const g of routes.groups){
 const expected=expectedRoutes.get(g.key);assert.ok(expected,g.key);
 assert.deepEqual([g.count,g.source_held,g.type],expected);expectedRoutes.delete(g.key);
 assert.equal(g.ids.length,g.count);
 assert.ok(/^https:\/\//.test(g.url));
 for(const id of g.ids){const r=byId.get(id);assert.ok(r&&!r.fssr&&!routeIDs.has(id),id);routeIDs.add(id);
  if(r.source_status==="FIRST_EXACT_SOURCE_PENDING")routedHeld++;}
 for(const key of ["product_identity_authenticated","exact_numeric_fssr_code_confirmed","legal_limit_signed","commercial_approval","commercial_lot_release"])assert.equal(g[key],false,key);
}
assert.equal(expectedRoutes.size,0);assert.equal(routeIDs.size,86);assert.equal(routedHeld,8);
assert.ok(ledger.records.filter(x=>!x.fssr).every(x=>routeIDs.has(x.catalog_id)));
const seeds=routes.groups.find(g=>g.key==="EDIBLE_DRY_SEEDS");
assert.equal(seeds.ids.length,2);assert.ok(seeds.note.includes("draft"));
assert.ok(!routes.groups.some(g=>g.exact_numeric_fssr_code_confirmed));
console.log("PMSV Batch133 verified: all 86 FSSR blanks have official source-navigation groups; 8 held; no standards, limits, or approvals inferred.");
