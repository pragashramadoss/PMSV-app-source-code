import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR61Source} from "../fssai-helper/ctr-spice-seasoning-source-gate-r61-20261105.mjs";
const rd=path=>JSON.parse(fs.readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-asafoetida-seasoning-oleoresins-r61-2026-11-05.json");
const r29=rd("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r60=rd("fssai-helper/ctr-sweeteners-six-source-review-r60-2026-11-05.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(r29.records.length,137);
assert.equal(r50.records.length,137);
assert.equal(r60.unique_focused_cases_R45_to_R60,41);
assert.equal(r.catalogue_original_unique_IDs,533);
assert.equal(r.original_R50_source_screened_cases,137);
assert.equal(r.original_CTR_finished_product_article_applicability_holds_open,137);
assert.equal(r.r60_prior_uniquely_focused_cases,41);
assert.equal(r.r61_new_unique_focused_cases,3);
assert.equal(r.r61_cumulative_unique_focused_cases_selected_rounds,44);
assert.equal(r.r61_original_cases_outside_selected_focused_rounds,93);
assert.equal(r.r61_exact_product_CTR_article_closures,0);
assert.equal(r.r61_full_legal_product_approvals,0);
assert.equal(r.r61_commercial_lot_releases,0);
assert.equal(r.separate_Ayurveda_ingredient_source_candidate_gaps,14);
assert.equal(r.source_product_master_modified,false);
assert.equal(r.original_R29_R50_registers_modified,false);
assert.equal(r.operative_numeric_CTR_rules_modified,false);
assert.equal(r.live_PMSV_helper_modified,false);
assert.equal(r.draft_PR_2_stays_unmerged,true);
const expected={
 "12-12-2-asafoetida-hing-or-hingra":["12.2.1","2.9.29","HING_HINGRA_COMPOUNDED_DISTINCT"],
 "12-12-2-seasoning":["12.2.2","2.9.31","SEASONING_DRY_OR_PASTE"],
 "12-12-2-spice-oleoresins":["12.2.1","2.9.32","EXTRACTED_SPICE_OLEORESIN"]
};
assert.equal(r.R61_catalogue_records.length,3);
assert.equal(new Set(r.R61_catalogue_records.map(x=>x.catalogue_id)).size,3);
for(const x of r.R61_catalogue_records){
 const orig=r29.records.find(z=>z.catalog_id===x.catalogue_id);
 const prior=r50.records.find(z=>z.id===x.catalogue_id);
 assert.ok(orig&&prior);
 assert.deepEqual([x.original_FPC,x.original_FSSR,x.standard_family],expected[x.catalogue_id]);
 assert.equal(x.original_FPC,orig.fcs);assert.equal(x.original_FSSR,orig.fssr);
 assert.equal(x.original_R50_priority,"P2");assert.equal(prior.priority,"P2");
 assert.equal(prior.currentLegalArticleAdjudicated,false);
 assert.equal(prior.fullLegalProductPASS,false);
 assert.equal(x.FSSR_source_clause_confirmed,true);
 assert.equal(x.actual_manufacturer_SKU_ingredient_species_and_processing_confirmed,false);
 assert.equal(x.subtype_selected_from_actual_specification,false);
 assert.equal(x.current_correct_finished_product_CTR_article_adjudicated,false);
 assert.equal(x.full_current_analytical_panel_and_results_reviewed,false);
 assert.equal(x.source_values_auto_applied,false);
 assert.equal(x.finished_product_legal_PASS,false);
 assert.equal(x.commercial_batch_release_authorized,false);
 const good=reviewR61Source(r,x.catalogue_id);
 assert.equal(good.status,"FSSR_SPICE_SOURCE_REVIEWED__ACTUAL_SKU_CTR_EVIDENCE_HOLD");
 assert.equal(good.legalProductPASS,false);
 assert.equal(good.sourceNumericRuleAutoApplied,false);
 const claimed=reviewR61Source(r,x.catalogue_id,{
  legalProductPASS:true,batchRelease:true,autoUseDrySpiceLead:true,
  autoUseAflatoxin30or20:true,assignOneGenericHingAsh:true,treatPasteAsAshExempt:true,
  treatVOCdashAsZero:true,apply30ppmToAllSolvents:true,useGMPasZero:true
 });
 assert.equal(claimed.status,"INDEPENDENT_SKU_AND_CURRENT_LAW_REVIEW_REQUIRED");
 assert.equal(claimed.legalProductPASS,false);
}
const a=r.R61_catalogue_records.find(x=>x.standard_family==="HING_HINGRA_COMPOUNDED_DISTINCT");
assert.deepEqual(a.source_parameters.profiles.map(x=>[
 x.name,x.total_ash_max_pct,x.acid_insoluble_ash_max_pct,x.alcoholic_extract_min_pct,x.starch_max_pct
 ]),[
 ["Hing",15,2.5,12,1],["Hingra",20,8,50,1],
 ["Compounded asafoetida / Bandhani Hing",10,1.5,5,null]
 ]);
const season=r.R61_catalogue_records.find(x=>x.standard_family==="SEASONING_DRY_OR_PASTE");
assert.deepEqual(season.source_parameters.limits.map(x=>[x.parameter,x.value]),[
 ["Moisture",10],["Acid insoluble ash in dilute HCl",2]
 ]);
assert.equal(season.source_parameters.limits[0].exception.includes("pastes"),true);
assert.equal(season.source_parameters.limits[1].exception,null);
const oil=r.R61_catalogue_records.find(x=>x.standard_family==="EXTRACTED_SPICE_OLEORESIN");
assert.deepEqual(oil.source_parameters.solvent_residue_limits.map(x=>x.printed_residual_limit),
 [30,50,25,30,50,"GMP","GMP",2,"GMP",2,2,1,2]);
assert.deepEqual(oil.source_parameters.botanical_voc_reference_examples.map(x=>x.volatile_oil_content_min_ml_100g),
 [1.5,20,null]);
assert.equal(r.selected_CTR_source_rows.length,5);
assert.deepEqual(r.selected_CTR_source_rows.map(x=>x.limit),[10,30,15,20,10]);
assert.ok(r.selected_CTR_source_rows.every(x=>x.numeric_rule_auto_applied===false&&
 x.official_pdf_page_image_checked===true&&x.actual_R61_SKU_article_matched===false));
assert.deepEqual(r.source_documents.find(x=>x.kind.includes("Chapter 2.9")).reviewed_pdf_pages_one_based,[34,35,39,40,41]);
assert.deepEqual(r.source_documents.find(x=>x.kind.includes("CTR Version IX")).reviewed_pdf_pages_one_based,[3,14]);
assert.equal(reviewR61Source(r,"unknown").status,"NOT_IN_R61_SCOPE");
const modifiedHing=structuredClone(r);
modifiedHing.R61_catalogue_records[0].source_parameters.profiles[1].total_ash_max_pct=15;
assert.equal(reviewR61Source(modifiedHing,"12-12-2-asafoetida-hing-or-hingra").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const modifiedSeason=structuredClone(r);
modifiedSeason.R61_catalogue_records[1].source_parameters.limits[1].exception="All seasoning pastes";
assert.equal(reviewR61Source(modifiedSeason,"12-12-2-seasoning").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const modifiedSolvent=structuredClone(r);
modifiedSolvent.R61_catalogue_records[2].source_parameters.solvent_residue_limits[2].printed_residual_limit=30;
assert.equal(reviewR61Source(modifiedSolvent,"12-12-2-spice-oleoresins").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const modifiedCTR=structuredClone(r);
modifiedCTR.selected_CTR_source_rows[3].limit=30;
assert.equal(reviewR61Source(modifiedCTR,"12-12-2-seasoning").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
// Reconcile all previous selected focused rounds to prevent repeated case counting.
const priorRounds=[
["fssai-helper/ctr-cocoa-sugar-article-evidence-r45-2026-11-04.json","reviewed_original_catalogue_entries"],
["fssai-helper/ctr-fruit-cheese-murabba-frozen-vegetables-r46-2026-11-04.json","actual_catalogue_records"],
["fssai-helper/ctr-coconut-milk-cream-powder-r47-2026-11-04.json","products"],
["fssai-helper/ctr-frozen-fruit-tamarind-potato-r48-2026-11-04.json","product_cases"],
["fssai-helper/ctr-category-99-seven-blank-fssr-r54-2026-11-04.json","seven_records"],
["fssai-helper/ctr-mouth-freshener-2021-direction-r55-2026-11-04.json","records"],
["fssai-helper/ctr-edible-seeds-2024-direction-r56-2026-11-04.json","records"],
["fssai-helper/ctr-child-supplement-fssr-standard-r57-2026-11-04.json","catalogue_id"],
["fssai-helper/ctr-pan-masala-product-label-packaging-r58-2026-11-04.json","source_reviewed_catalogue_ids"],
["fssai-helper/ctr-bakery-pasta-five-source-review-r59-2026-11-04.json","product_source_records"],
["fssai-helper/ctr-sweeteners-six-source-review-r60-2026-11-05.json","products"]
];
const universe=new Set(r50.records.map(x=>x.id));
const ids=new Set();
for(const [file,key] of priorRounds){
 const m=rd(file),v=typeof m[key]==="string"?[m[key]]:m[key];
 for(const obj of v){
  const id=typeof obj==="string"?obj:obj.catalogue_id;
  assert.ok(universe.has(id),id);
  ids.add(id);
 }
}
assert.equal(ids.size,41);
for(const row of r.R61_catalogue_records){
 assert.equal(ids.has(row.catalogue_id),false);
 ids.add(row.catalogue_id);
}
assert.equal(ids.size,44);
assert.equal(137-ids.size,93);
console.log(JSON.stringify({
 status:"PASS",unique_new_spice_source_records:3,
 unique_selected_focused_cases:44,remaining_outside_selected_focused_rounds:93,
 original_product_CTR_applicability_holds:137,whole_product_legal_approvals:0
},null,2));
