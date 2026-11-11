import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR64VanillaSource} from "../fssai-helper/ctr-vanilla-source-gate-r64-20261111.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-vanilla-three-source-review-r64-2026-11-11.json");
const r29=rd("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r63=rd("fssai-helper/ctr-soy-paste-vegetable-protein-r63-2026-11-05.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(r29.records.length,137);
assert.equal(r50.records.length,137);
assert.equal(r63.R63_cumulative_unique_focused_cases,47);
assert.equal(r.original_catalogue_ids,533);
assert.equal(r.original_R50_CTR_article_legal_holds,137);
assert.equal(r.previous_R63_unique_focused_cases,47);
assert.equal(r.R64_new_distinct_focused_cases,3);
assert.equal(r.R64_cumulative_unique_focused_cases,50);
assert.equal(r.original_cases_outside_R45_R64_focused_rounds,87);
assert.equal(r.new_exact_finished_product_CTR_article_decisions,0);
assert.equal(r.new_full_product_legal_approvals,0);
assert.equal(r.new_commercial_batch_releases,0);
assert.equal(r.original_R29_R50_registers_modified,false);
assert.equal(r.product_master_modified,false);
assert.equal(r.live_PMSV_Helper_modified,false);
assert.equal(r.operative_numeric_CTR_rules_modified,false);
assert.equal(r.PR_2_remains_draft_unmerged,true);
assert.equal(r.independent_Ayurveda_raw_ingredient_source_gaps,14);
assert.equal(r.independent_Ayurveda_raw_ingredient_source_reference_links,94);
assert.equal(r.official_sources[0].pdf_page_images_actually_inspected,true);
assert.deepEqual(r.official_sources[0].pdf_pages_zero_based_visually_checked,[74,75,76]);
assert.equal(r.official_sources[0].original_Gazette_and_all_current_amendments_legally_reconciled,false);
assert.equal(r.official_sources[3].final_finished_vanilla_article_and_full_2026_effective_matrix_reconciled,false);
assert.equal(r.product_source_records.length,3);
const expected={
 "04-04-1-vanilla-pods":["04.1.1.1","2.3.50",30,null],
 "04-04-1-cut-vanilla":["04.1.1.1","2.3.50",30,null],
 "04-04-1-vanilla-powder":["04.1.2.2","2.3.50(1)(c)",20,1.25]
};
for(const rec of r.product_source_records){
 const orig=r29.records.find(x=>x.catalog_id===rec.catalogue_id);
 const ready=r50.records.find(x=>x.id===rec.catalogue_id);
 assert.ok(orig&&ready, "Must use existing R29/R50 ID");
 assert.equal(orig.fcs,rec.source_FPC);
 assert.equal(orig.fssr,rec.source_FSSR);
 assert.equal(ready.priority,"P2");
 assert.equal(ready.currentLegalArticleAdjudicated,false);
 assert.deepEqual([rec.source_FPC,rec.source_FSSR,rec.moisture_percent_max,rec.powder_sieve_aperture_mm],expected[rec.catalogue_id]);
 assert.equal(rec.vanillin_percent_wet_basis_min,2);
 assert.equal(rec.total_ash_percent_dry_basis_max,5);
 assert.equal(rec.acid_insoluble_ash_percent_dry_basis_max,1);
 assert.equal(rec.numerical_rules_auto_applied,false);
 assert.equal(rec.legal_product_PASS,false);
 assert.equal(rec.commercial_release_authorized,false);
 const z=reviewR64VanillaSource(r,rec.catalogue_id);
 assert.equal(z.status,"FSSR_VANILLA_2_3_50_SOURCE__SKU_CTR_HOLD");
 assert.equal(z.legalProductPASS,false);
 assert.equal(z.commercialBatchReleaseAuthorized,false);
}
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
["fssai-helper/ctr-soy-paste-vegetable-protein-r63-2026-11-05.json","product_source_records"]
];
const universe=new Set(r50.records.map(x=>x.id)),focus=new Set();
for(const [file,key] of previous){
 const data=rd(file),v=data[key],arr=typeof v==="string"||!Array.isArray(v)?[v]:v;
 for(const x of arr){
  const id=typeof x==="string"?x:(x.catalogue_id||x.id);
  assert.ok(universe.has(id),"Prior focused ID not in original 137: "+id);
  focus.add(id);
 }
}
assert.equal(focus.size,47,"R45–R63 focus must remain exactly 47 distinct original IDs");
for(const x of r.product_source_records){
 assert.equal(focus.has(x.catalogue_id),false,"R64 item was already focused in earlier rounds");
 focus.add(x.catalogue_id);
}
assert.equal(focus.size,50);
assert.equal(universe.size-focus.size,87);
for(const claim of [
 {legalPASS:true},{releaseLot:true},{autoSelectCTRArticle:true},
 {treatFlavouredPowderAsVanilla:true},{use30MoistureForPowder:true},
 {useDryBasisForVanillin:true},{useWetBasisForAsh:true},
 {skipPowderSieve:true},{autoTreatAsDriedSpice:true},
 {useHistoricalPrefixAsFPC:true},{assume2026LegalReviewComplete:true},
 {assumeNoMicrobiologyNeeded:true}
]){
 const z=reviewR64VanillaSource(r,"04-04-1-vanilla-powder",claim);
 assert.equal(z.status,"PRODUCT_SPECIES_FORM_METHOD_CTR_AND_ACTUAL_LAB_REVIEW_REQUIRED");
 assert.equal(z.legalProductPASS,false);
}
for(const change of [
 x=>x.product_source_records[2].moisture_percent_max=30,
 x=>x.product_source_records[0].vanillin_percent_wet_basis_min=1,
 x=>x.product_source_records[1].total_ash_percent_dry_basis_max=6,
 x=>x.product_source_records[2].powder_sieve_aperture_mm=null,
 x=>x.product_source_records[2].source_FPC="04.1.1.1",
 x=>x.product_source_records[1].commercial_release_authorized=true,
 x=>x.official_sources[0].original_Gazette_and_all_current_amendments_legally_reconciled=true,
 x=>x.new_full_product_legal_approvals=1,
 x=>x.R64_cumulative_unique_focused_cases=51
]){
 const x=structuredClone(r);change(x);
 assert.equal(reviewR64VanillaSource(x,"04-04-1-vanilla-powder").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
}
assert.equal(reviewR64VanillaSource(r,"unrelated").status,"NOT_IN_R64_SCOPE");
console.log(JSON.stringify({result:"PASS",review:"R64",new_focused_cases:3,cumulative_unique_focused_cases:50,original_cases_outside_focus:87,open_CTR_legal_article_decisions:137,full_legal_product_approvals:0,batch_releases:0},null,2));
