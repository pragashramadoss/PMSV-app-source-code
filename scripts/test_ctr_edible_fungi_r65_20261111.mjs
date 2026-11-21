import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR65FungiSource} from "../fssai-helper/ctr-edible-fungi-source-gate-r65-20261111.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-edible-fungi-ten-styles-r65-2026-11-11.json");
const r29=rd("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r64=rd("fssai-helper/ctr-vanilla-three-source-review-r64-2026-11-11.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(r29.records.length,137);assert.equal(r50.records.length,137);
assert.equal(r.original_catalogue_ids,533);
assert.equal(r.original_R50_CTR_article_legal_holds,137);
assert.equal(r.previous_R64_unique_focused_cases,50);
assert.equal(r64.R64_cumulative_unique_focused_cases,50);
assert.equal(r.R65_new_distinct_focused_cases,10);
assert.equal(r.R65_cumulative_unique_focused_cases,60);
assert.equal(r.original_cases_outside_R45_R65_focused_rounds,77);
assert.equal(r.legal_PRODUCT_PASS_count,0);
assert.equal(r.commercial_release_count,0);
assert.equal(r.exact_CTR_article_decisions_closed_this_round,0);
assert.equal(r.independent_Ayurveda_raw_ingredient_source_gaps,14);
assert.equal(r.independent_Ayurveda_raw_ingredient_source_reference_links,94);
assert.equal(r.original_R29_R50_registers_modified,false);
assert.equal(r.product_master_modified,false);
assert.equal(r.live_PMSV_Helper_modified,false);
assert.equal(r.operative_numeric_CTR_rules_modified,false);
assert.equal(r.PR_2_remains_draft_unmerged,true);
assert.deepEqual(r.official_sources[0].pdf_pages_zero_based_actually_visually_checked,[96,97,98,99,100,101,102,103]);
assert.equal(r.official_sources[0].compendium_is_reference_original_Gazette_controls,true);
assert.equal(r.official_sources[0].all_applicable_original_notifications_2026_legally_reconciled,false);
assert.equal(r.product_source_records.length,10);
const expectedFPC={
 "04-04-2-dried-fungi":"04.2.2.2",
 "04-04-2-dried-fungi-concentrate":"04.2.2.2",
 "04-04-2-fermented-fungi":"04.2.2.7",
 "04-04-2-fungi-extract-and-fungi-concentrate":"04.2.2.2",
 "04-04-2-fungi-grits-and-fungi-powder":"04.2.2.2",
 "04-04-2-fungi-in-olive-oil-and-other-vegetable-oils":"04.2.2.3",
 "04-04-2-pickled-fungi":"04.2.2.7",
 "04-04-2-quick-frozen-fungi":"04.2.2.1",
 "04-04-2-salted-fungi-semi-processed-products":"04.2.2.3",
 "04-04-2-sterilized-fungi":"04.2.2.4"
};
assert.deepEqual(new Set(r.product_source_records.map(x=>x.catalogue_id)),new Set(Object.keys(expectedFPC)));
for(const p of r.product_source_records){
 const old=r29.records.find(x=>x.catalog_id===p.catalogue_id);
 const old50=r50.records.find(x=>x.id===p.catalogue_id);
 assert.ok(old&&old50, "All ten must be original 137 cases");
 assert.equal(old.product_name,p.original_name);
 assert.equal(p.source_FPC,expectedFPC[p.catalogue_id]);
 assert.equal(p.source_FPC,old.fcs);
 assert.equal(p.source_FSSR,old.fssr);
 assert.equal(p.source_FSSR,"2.3.62");
 assert.equal(old50.priority,"P2");
 assert.equal(old50.currentLegalArticleAdjudicated,false);
 assert.equal(p.legal_product_PASS,false);
 assert.equal(p.commercial_batch_release_authorized,false);
 assert.equal(p.numeric_limits_auto_applied,false);
 assert.equal(p.exact_finished_product_CTR_article_legally_decided,false);
 assert.equal(typeof p.source_specs.process,"string");
 assert.equal(typeof p.source_specs.critical_guard,"string");
 const decision=reviewR65FungiSource(r,p.catalogue_id);
 assert.equal(decision.status,"FSSR_2_3_62_TEN_STYLE_SOURCE__PRODUCT_CTR_HOLD");
 assert.equal(decision.legalProductPASS,false);
 assert.equal(decision.commercialBatchReleaseAuthorized,false);
}
const byStyle=Object.fromEntries(r.product_source_records.map(x=>[x.source_specs.style,x.source_specs.limits]));
assert.deepEqual([byStyle.dried_fungi.moisture_pct_m_m_max_freeze_dried,byStyle.dried_fungi.moisture_pct_m_m_max_other_dried,byStyle.dried_fungi.moisture_pct_m_m_max_shiitake],[6,12,13]);
assert.deepEqual([byStyle.dried_fungi.organic_impurities_pct_m_m_max_except_shiitake,byStyle.dried_fungi.organic_impurities_pct_m_m_max_shiitake],[0.02,1]);
assert.deepEqual([byStyle.fungi_grits_and_powder.grits_moisture_pct_m_m_max,byStyle.fungi_grits_and_powder.powder_moisture_pct_m_m_max,byStyle.fungi_grits_and_powder.powder_sieve_microns],[13,9,200]);
assert.deepEqual([byStyle.fermented_fungi.naturally_occurring_lactic_acid_pct_m_m_min,byStyle.fermented_fungi.salt_nacl_pct_m_m_min,byStyle.fermented_fungi.salt_nacl_pct_m_m_max,byStyle.fermented_fungi.maggot_damaged_pct_m_m_max],[1,3,6,4]);
assert.deepEqual([byStyle.pickled_fungi.salt_nacl_pct_m_m_max,byStyle.pickled_fungi.sugars_pct_m_m_max,byStyle.pickled_fungi.vinegar_as_acetic_acid_pct_m_m_max],[2.5,2.5,2]);
assert.equal(byStyle.quick_frozen_fungi.thermal_centre_celsius_at_completion_max,-18);
assert.deepEqual([byStyle.salted_fungi_semi_processed.salt_nacl_pct_m_m_min,byStyle.salted_fungi_semi_processed.salt_nacl_pct_m_m_max],[15,18]);
assert.deepEqual([byStyle.fungi_extract_and_concentrate.fungi_extract_saltless_extract_pct,byStyle.fungi_extract_and_concentrate.fungi_concentrate_saltless_extract_pct,byStyle.fungi_extract_and_concentrate.salt_nacl_pct_m_m_max],[7,24,20]);
assert.deepEqual([byStyle.dried_fungi_concentrate.moisture_pct_m_m_max,byStyle.dried_fungi_concentrate.salt_nacl_pct_m_m_max],[9,5]);
assert.deepEqual([byStyle.sterilized_fungi.salt_nacl_pct_m_m_max,byStyle.fungi_in_vegetable_oils.salt_nacl_pct_m_m_max],[2,1]);
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
["fssai-helper/ctr-bakery-pasta-five-source-review-r59-2026-11-04.json","product_source_records"],
["fssai-helper/ctr-sweeteners-six-source-review-r60-2026-11-05.json","products"],
["fssai-helper/ctr-asafoetida-seasoning-oleoresins-r61-2026-11-05.json","R61_catalogue_records"],
["fssai-helper/ctr-salt-substitute-original-gazette-r62-2026-11-05.json","source_product"],
["fssai-helper/ctr-soy-paste-vegetable-protein-r63-2026-11-05.json","product_source_records"],
["fssai-helper/ctr-vanilla-three-source-review-r64-2026-11-11.json","product_source_records"]
];
const universe=new Set(r50.records.map(x=>x.id)),focus=new Set();
for(const [file,key] of previous){
 const data=rd(file),v=data[key],arr=typeof v==="string"||!Array.isArray(v)?[v]:v;
 for(const x of arr){
  const id=typeof x==="string"?x:(x.catalogue_id||x.id);
  assert.ok(universe.has(id),"Not original 137: "+id);
  focus.add(id);
 }
}
assert.equal(focus.size,50);
for(const p of r.product_source_records){
 assert.equal(focus.has(p.catalogue_id),false,"Duplicate focused R65 ID: "+p.catalogue_id);
 focus.add(p.catalogue_id);
}
assert.equal(focus.size,60);
assert.equal(universe.size-focus.size,77);
const attempts=[
 {legalPASS:true},{releaseBatch:true},{assignCTRAutomatically:true},{autoUseGenericVegetableCTR:true},
 {assumeAllFungiSameFPC:true},{applyDriedMoistureToPowder:true},{skipPowderSieve:true},
 {usePickleVinegarAsMinAcidSafety:true},{useFermentSaltAsMaximumOnly:true},
 {allowFermentationWithoutProcessValidation:true},{treatAirFreezerMinus18AsProductCore:true},
 {treatSterilizedAsCommerciallySterile:true},{assumeOilPackShelfStable:true},
 {substituteFungiExtractForDriedConcentrate:true},{assumeNoneImpuritiesMeansZeroLOD:true},
 {skipScientificNameLabel:true},{declareVeganOrMilkFreeWithoutFormula:true},
 {assume2026GazettesReconciled:true},{skipContaminantAndMicroPanel:true}
];
for(const attempt of attempts){
 const decision=reviewR65FungiSource(r,"04-04-2-pickled-fungi",attempt);
 assert.equal(decision.status,"ACTUAL_SKU_STYLE_PROCESS_FSSAI_CTR_AND_LAB_EVIDENCE_REQUIRED");
 assert.equal(decision.legalProductPASS,false);
}
const mutations=[
 x=>x.R65_cumulative_unique_focused_cases=61,
 x=>x.original_R50_CTR_article_legal_holds=136,
 x=>x.product_master_modified=true,
 x=>x.legal_PRODUCT_PASS_count=1,
 x=>x.product_source_records[0].source_specs.limits.moisture_pct_m_m_max_shiitake=15,
 x=>x.product_source_records[2].source_specs.limits.naturally_occurring_lactic_acid_pct_m_m_min=0,
 x=>x.product_source_records[4].source_specs.limits.powder_sieve_microns=1250,
 x=>x.product_source_records[6].source_specs.limits.vinegar_as_acetic_acid_pct_m_m_max=3,
 x=>x.product_source_records[7].source_specs.limits.thermal_centre_celsius_at_completion_max=-10,
 x=>x.product_source_records[8].source_specs.limits.salt_nacl_pct_m_m_min=0,
 x=>x.product_source_records[9].source_FPC="04.2.2.2",
 x=>x.product_source_records[1].commercial_batch_release_authorized=true,
 x=>x.labelling_specific.common_and_scientific_species_for_dried_salted_quick_frozen_fermented_pickled_canned=false,
 x=>x.official_sources[0].all_applicable_original_notifications_2026_legally_reconciled=true
];
for(const mutation of mutations){
 const x=structuredClone(r);mutation(x);
 assert.equal(reviewR65FungiSource(x,"04-04-2-pickled-fungi").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
}
assert.equal(reviewR65FungiSource(r,"outside-universe").status,"NOT_IN_R65_SCOPE");
console.log(JSON.stringify({result:"PASS",round:"R65",new_distinct_focused:10,total_distinct_selected_focused:60,outside_selected_rounds:77,original_CTR_legal_article_holds:137,legal_product_PASS:0,commercial_releases:0},null,2));
