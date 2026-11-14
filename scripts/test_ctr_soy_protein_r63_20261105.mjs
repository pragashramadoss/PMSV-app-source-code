import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR63Source} from "../fssai-helper/ctr-soy-protein-source-gate-r63-20261105.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-soy-paste-vegetable-protein-r63-2026-11-05.json");
const a=rd("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const b=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r62=rd("fssai-helper/ctr-salt-substitute-original-gazette-r62-2026-11-05.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(a.records.length,137);assert.equal(b.records.length,137);
assert.equal(r.original_R50_CTR_article_legal_holds,137);
assert.equal(r62.cumulative_selected_focused_IDs,45);
assert.equal(r.previous_R62_cumulative_focused_cases,45);
assert.equal(r.R63_new_unique_focused_cases,2);
assert.equal(r.R63_cumulative_unique_focused_cases,47);
assert.equal(r.original_137_outside_R45_R63_focused_rounds,90);
assert.equal(r.new_exact_finished_product_CTR_article_decisions,0);
assert.equal(r.new_full_product_legal_approvals,0);
assert.equal(r.new_commercial_batch_releases,0);
assert.equal(r.independent_Ayurveda_ingredient_source_gaps,14);
assert.equal(r.original_R29_R50_registers_modified,false);
assert.equal(r.product_master_modified,false);
assert.equal(r.numeric_CTR_rules_modified,false);
assert.equal(r.live_PMSV_Helper_modified,false);
assert.equal(r.PR_2_remains_draft_unmerged,true);
assert.deepEqual(r.official_sources[0].pdf_pages_zero_based_images_checked,[87,88,90]);
assert.equal(r.official_sources[0].official_pdf_visual_inspection,true);
assert.equal(r.official_sources[0].compendium_only_Gazette_prevails,true);
assert.equal(r.official_sources[2].all_original_amendments_legally_reconciled_through_2026,false);
assert.equal(r.product_source_records.length,2);
const expected={
 "06-06-8-fermented-soybean-paste":["12.9.1","2.3.57","FERMENTED_SOYBEAN_PASTE_TWO_STYLES"],
 "12-12-10-vegetable-protein-products":["12.10","2.3.59","VEGETABLE_PROTEIN_PRODUCT"]
};
for(const x of r.product_source_records){
 const original=a.records.find(v=>v.catalog_id===x.catalogue_id);
 const old=b.records.find(v=>v.id===x.catalogue_id);
 assert.ok(original&&old);
 assert.deepEqual([x.source_FPC,x.source_FSSR,x.source_family],expected[x.catalogue_id]);
 assert.equal(original.fcs,x.source_FPC);
 assert.equal(original.fssr,x.source_FSSR);
 assert.equal(old.priority,"P2");
 assert.equal(old.currentLegalArticleAdjudicated,false);
 assert.equal(x.actual_SKU_ingredient_species_starter_cereal_variant_and_processing_verified,false);
 assert.equal(x.actual_CTR_finished_product_food_article_legally_decided,false);
 assert.equal(x.numeric_rules_auto_applied,false);
 assert.equal(x.legal_product_PASS,false);
 assert.equal(x.commercial_batch_release_authorized,false);
 const good=reviewR63Source(r,x.catalogue_id);
 assert.equal(good.status,"OFFICIAL_FSSR_2_3_57_2_3_59_SOURCE__SKU_CTR_HOLD");
 assert.equal(good.legalProductPASS,false);
 const claim=reviewR63Source(r,x.catalogue_id,{
  legalPASS:true,batchRelease:true,autoUseLowerGrainNitrogen:true,
  skipTrypsinInhibitorProof:true,autoInheritDatePasteNoAdditives:true,
  autoUseProteinAsIs40:true,setResidualFatZero:true
 });
 assert.equal(claim.status,"INDEPENDENT_SKU_PROCESS_LAB_AND_CURRENT_LAW_REVIEW_REQUIRED");
 assert.equal(claim.legalProductPASS,false);
}
const soy=r.product_source_records.find(x=>x.source_family==="FERMENTED_SOYBEAN_PASTE_TWO_STYLES");
assert.deepEqual(soy.source_specs.styles.map(x=>[
 x.style,x.moisture_percent_m_m_max,x.total_nitrogen_percent_m_m_min,x.amino_nitrogen_percent_m_m_min
]),[
 ["soybean_only",60,1.6,0.3],
 ["soybean_and_grains",60,0.6,0.12]
]);
assert.equal(soy.source_specs.source_must_have_inactivated_soy_trypsin_inhibitor,true);
assert.equal(soy.source_specs.container_minimum_fill_percent_of_water_capacity,90);
const veg=r.product_source_records.find(x=>x.source_family==="VEGETABLE_PROTEIN_PRODUCT");
assert.equal(veg.source_specs.crude_protein_percent_dry_weight_min,40);
assert.equal(veg.source_specs.crude_protein_analytical_multiplier,"N × 6.25");
assert.equal(veg.source_specs.moisture_percent_m_m_max,10);
assert.equal(veg.source_specs.total_ash_percent_dry_weight_max,10);
assert.equal(veg.source_specs.crude_fibre_percent_dry_weight_max,10);
assert.equal(veg.source_specs.residual_fat_condition,"compatible with GMP");
assert.equal(veg.source_specs.residual_fat_numeric_max_in_table,null);
let bad=structuredClone(r);bad.product_source_records[0].source_specs.styles[1].total_nitrogen_percent_m_m_min=1.6;
assert.equal(reviewR63Source(bad,soy.catalogue_id).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
bad=structuredClone(r);bad.product_source_records[1].source_specs.crude_protein_percent_dry_weight_min=30;
assert.equal(reviewR63Source(bad,veg.catalogue_id).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
bad=structuredClone(r);bad.new_full_product_legal_approvals=1;
assert.equal(reviewR63Source(bad,soy.catalogue_id).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
assert.equal(reviewR63Source(r,"other").status,"NOT_IN_R63_SCOPE");
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
["fssai-helper/ctr-salt-substitute-original-gazette-r62-2026-11-05.json","source_product"]
];
const focus=new Set(),universe=new Set(b.records.map(x=>x.id));
for(const [file,key] of previous){
 const data=rd(file),v=data[key],arr=(typeof v==="string"||!Array.isArray(v))?[v]:v;
 for(const x of arr){
  const id=typeof x==="string"?x:(x.catalogue_id||x.id);
  assert.ok(universe.has(id),"Not in original 137: "+id);
  focus.add(id);
 }
}
assert.equal(focus.size,45);
for(const x of r.product_source_records){assert.equal(focus.has(x.catalogue_id),false);focus.add(x.catalogue_id);}
assert.equal(focus.size,47);
assert.equal(137-focus.size,90);
console.log(JSON.stringify({status:"PASS",new_source_cases:2,unique_selected_focus:47,remaining_outside_focused_rounds:90,original_CTR_article_holds:137,full_product_compliance_passes:0},null,2));
