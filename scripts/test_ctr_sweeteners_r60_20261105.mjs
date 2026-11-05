import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR60SweetenerSource,R60_CATEGORY_INDEX} from "../fssai-helper/ctr-sweeteners-source-gate-r60-20261105.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-sweeteners-six-source-review-r60-2026-11-05.json");
const p29=rd("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const p50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(p29.records.length,137);assert.equal(p50.records.length,137);
assert.equal(r.review_id,"PMSV_R60_2026_11_05");
assert.equal(r.original_catalogue_id_count,533);
assert.equal(r.original_source_screened_CTR_cases,137);
assert.equal(r.original_exact_CTR_product_article_decisions_open,137);
assert.equal(r.prior_unique_focused_cases_R45_to_R59,35);
assert.equal(r.unique_focused_cases_R45_to_R60,41);
assert.equal(r.original_cases_outside_R45_to_R60_focus,96);
assert.equal(r.finished_product_CTR_legally_decided_this_round,0);
assert.equal(r.legally_approved_whole_products,0);
assert.equal(r.commercial_releases,0);
assert.equal(r.separate_Ayurveda_source_candidate_gaps,14);
assert.equal(r.original_R29_R50_audit_files_modified,false);
assert.equal(r.product_master_modified,false);
assert.equal(r.numerical_live_rules_modified,false);
assert.equal(r.deployed_PMSV_helper_modified,false);
assert.equal(r.draft_PR_2_unmerged,true);
assert.equal(r.products.length,6);
assert.equal(new Set(r.products.map(x=>x.catalogue_id)).size,6);
assert.equal(Object.keys(R60_CATEGORY_INDEX).length,6);
const expected={
 "11-11-1-cane-jaggery-or-cane-gur":{"Reducing sugars":[5.5,20],"Moisture":[7],"Sulphate ash":[4]},
 "11-11-1-gur-or-jaggery":{"Total ash":[6],"Moisture":[10]},
 "11-11-1-misri":{"Sucrose":[98],"Total ash":[0.4]},
 "11-11-3-golden-syrup":{"Moisture":[25],"Total ash":[2.5],"Total sugar as invert sugar":[72]},
 "11-11-1-dried-glucose-syrup":{"Total solids":[93],"Reducing sugar":[20],"Sulphated ash":[1]},
 "11-11-1-edible-lactose":{"Lactose":[99],"Sulphated ash":[0.3],"pH in 10 percent solution":[4.5,7]}
};
for(const row of r.products){
 const src=p29.records.find(x=>x.catalog_id===row.catalogue_id);
 const queue=p50.records.find(x=>x.id===row.catalogue_id);
 assert.ok(src&&queue);
 assert.equal(row.original_fpc,src.fcs);assert.equal(row.original_fssr,src.fssr);
 assert.equal(row.original_fpc,R60_CATEGORY_INDEX[row.catalogue_id][0]);
 assert.equal(row.original_fssr,R60_CATEGORY_INDEX[row.catalogue_id][1]);
 assert.equal(row.standard_kind,R60_CATEGORY_INDEX[row.catalogue_id][2]);
 assert.equal(row.priority,queue.priority);
 assert.equal(queue.currentLegalArticleAdjudicated,false);
 assert.equal(row.identity_source_verified,true);
 assert.equal(row.actual_manufacturer_SKU_raw_source_and_form_confirmed,false);
 assert.equal(row.precise_legally_applicable_finished_CTR_article_decided,false);
 assert.equal(row.legal_finished_food_PASS,false);
 assert.equal(row.batch_release_authorized,false);
 assert.equal(row.numeric_rule_auto_assignment,false);
 assert.ok(row.selected_standard_parameters.every(x=>x.regulatory_limit_auto_applied===false&&x.source_unit&&x.qualifier));
 for(const [test,values] of Object.entries(expected[row.catalogue_id])){
  assert.deepEqual(row.selected_standard_parameters.filter(x=>x.test===test).map(x=>x.source_number),values);
 }
 const s=reviewR60SweetenerSource(r,row.catalogue_id);
 assert.equal(s.status,"OFFICIAL_SWEETENER_FSSR_SOURCE__ACTUAL_SKU_AND_CTR_ARTICLE_HOLD");
 assert.equal(s.wholeProductLegalPASS,false);
 const bad=reviewR60SweetenerSource(r,row.catalogue_id,{
   legalPASS:true,batchRelease:true,autoUseAshLead5:true,autoUseCaneOnlyMaxReducingSugar:true,
   autoUseDextroseTestsForGoldenSyrup:true,autoTreatLactoseAsRefinedSugar:true
 });
 assert.equal(bad.status,"INDEPENDENT_ACTUAL_SKU_LEGAL_ASSESSMENT_REQUIRED");
 assert.equal(bad.numericCTRLimitAutoApplied,false);
}
const official=r.official_sources;
const sweet=official.find(x=>x.kind.startsWith("FPSFA Chapter 2.8"));
assert.deepEqual(sweet.pages_visually_checked_zero_based,[2,3,9,10,11,12]);
assert.match(sweet.cane_2023_minimum_printed,/2023/);
const dairy=official.find(x=>x.kind.startsWith("FPSFA Chapter 2.1"));
assert.deepEqual(dairy.pages_visually_checked_zero_based,[71,72]);
const ctr=official.find(x=>x.kind.startsWith("CTR Version IX"));
assert.deepEqual(ctr.pages_visually_checked_zero_based,[1,3]);
assert.equal(r.source_CTR_lead_article_examples.length,3);
assert.deepEqual(r.source_CTR_lead_article_examples.map(x=>x.limit_mgkg),[5,0.5,5]);
assert.ok(r.source_CTR_lead_article_examples.every(x=>x.auto_apply===false));
assert.equal(reviewR60SweetenerSource(r,"unreviewed").status,"NOT_IN_R60_SCOPE");
const tamper=structuredClone(r);tamper.products[0].selected_standard_parameters.find(x=>x.test==="Reducing sugars"&&x.comparison===">=").source_number=0;
assert.equal(reviewR60SweetenerSource(tamper,tamper.products[0].catalogue_id).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const wrong=structuredClone(r);wrong.products.find(x=>x.standard_kind==="GOLDEN_SYRUP").original_fssr="2.8.5";
assert.equal(reviewR60SweetenerSource(wrong,"11-11-3-golden-syrup").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const illegal=structuredClone(r);illegal.source_CTR_lead_article_examples[0].auto_apply=true;
assert.equal(reviewR60SweetenerSource(illegal,"11-11-1-misri").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
// Count previous focused 35 unique and prove no double counted R60 cases.
const previous=[
["fssai-helper/ctr-cocoa-sugar-article-evidence-r45-2026-11-04.json","reviewed_original_catalogue_entries"],
["fssai-helper/ctr-fruit-cheese-murabba-frozen-vegetables-r46-2026-11-04.json","actual_catalogue_records"],
["fssai-helper/ctr-coconut-milk-cream-powder-r47-2026-11-04.json","products"],
["fssai-helper/ctr-frozen-fruit-tamarind-potato-r48-2026-11-04.json","product_cases"],
["fssai-helper/ctr-category-99-seven-blank-fssr-r54-2026-11-04.json","seven_records"],
["fssai-helper/ctr-mouth-freshener-2021-direction-r55-2026-11-04.json","records"],
["fssai-helper/ctr-edible-seeds-2024-direction-r56-2026-11-04.json","records"],
["fssai-helper/ctr-child-supplement-fssr-standard-r57-2026-11-04.json","catalogue_id"],
["fssai-helper/ctr-pan-masala-product-label-packaging-r58-2026-11-04.json","source_reviewed_catalogue_ids"],
["fssai-helper/ctr-bakery-pasta-five-source-review-r59-2026-11-04.json","product_source_records"]
];
const ids=new Set();
const universe=new Set(p50.records.map(x=>x.id));
for(const [f,k] of previous){
 const d=rd(f),vals=typeof d[k]==="string"?[d[k]]:d[k];
 for(const x of vals){const id=typeof x==="string"?x:x.catalogue_id;assert.ok(universe.has(id),id);ids.add(id);}
}
assert.equal(ids.size,35);
for(const x of r.products){assert.equal(ids.has(x.catalogue_id),false);ids.add(x.catalogue_id);}
assert.equal(ids.size,41);assert.equal(137-ids.size,96);
console.log(JSON.stringify({status:"PASS",new_FSSR_cases:6,unique_focused:41,without_these_focused_rounds:96,CTR_legal_article_holds:137,legal_full_product_PASS:0},null,2));
