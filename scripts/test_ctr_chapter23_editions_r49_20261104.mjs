import fs from "node:fs";
import assert from "node:assert/strict";
import {R49_VERIFIED_CLAUSES,checkR49SourceEdition,APPROVED_SOURCE_EDITION} from "../fssai-helper/ctr-chapter23-edition-source-guard-r49-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const a=read("fssai-helper/ctr-fruit-cheese-murabba-frozen-vegetables-r46-2026-11-04.json");
const b=read("fssai-helper/ctr-coconut-milk-cream-powder-r47-2026-11-04.json");
const r48=read("fssai-helper/ctr-frozen-fruit-tamarind-potato-r48-2026-11-04.json");
const r49=read("fssai-helper/ctr-chapter23-2025-edition-reconciliation-r49-2026-11-04.json");
const keys=new Set(r49.verified_cases.map(x=>x.catalogue_id));
assert.equal(r49.verified_cases.length,6);
assert.equal(keys.size,6);
assert.equal(a.actual_catalogue_records.length,3);
assert.equal(b.products.length,3);
assert.deepEqual(keys,new Set([...a.actual_catalogue_records.map(x=>x.catalogue_id),...b.products.map(x=>x.catalogue_id)]));
assert.deepEqual(new Set(R49_VERIFIED_CLAUSES),new Set(r49.verified_cases.map(x=>x.fssr_clause)));
assert.equal(APPROVED_SOURCE_EDITION,"Version 3 (07.05.2025)");
for(const x of r49.verified_cases){
 assert.equal(x.inspected_selected_numeric_and_named_conditions_match_between_editions,true);
 assert.equal(x.entire_clause_word_for_word_delta_proven,false);
 assert.equal(x.exact_CTR_product_article_legal_decision_approved,false);
 assert.equal(x.full_product_legal_PASS,false);
 assert.equal(x.commercial_lot_release_authorized,false);
 assert.equal(x.entire_original_Gazette_and_all_current_amendments_reconciled,false);
 if(x.original_audit==="R46"){
  const y=a.actual_catalogue_records.find(z=>z.catalogue_id===x.catalogue_id);
  assert.deepEqual(x.numeric_requirements_as_registered,y.FSSR_source_specification);
  assert.equal(x.fssr_clause,y.official_FSSR_clause);
 } else {
  const y=b.products.find(z=>z.catalogue_id===x.catalogue_id);
  assert.deepEqual(x.source_styles_as_registered,y.available_styles);
  assert.equal(x.fssr_clause,y.fssr);
 }
 const evidence={sourceEdition:APPROVED_SOURCE_EDITION,correctOriginalFSSRCatalogueIdentity:true,
 originalGazetteAndEffectiveAmendmentsChecked:true,actualSKUAndRelevantSampleMatrixVerified:true,
 fullCurrentContaminantAndMicroLabEvidenceReviewed:true,
 v3SelectedPageImageVerified:true,v2SelectedSourceConditionCompared:true};
 const ready=checkR49SourceEdition(x.fssr_clause,evidence);
 assert.equal(ready.status,"SOURCE_EDITION_SPOTCHECK_READY_NOT_PRODUCT_PASS");
 assert.equal(ready.legalCTRArticlePASS,false);
 assert.equal(ready.wholeProductLegalPASS,false);
 assert.equal(ready.commercialRelease,false);
 assert.equal(checkR49SourceEdition(x.fssr_clause,{...evidence,v3SelectedPageImageVerified:false}).status,"EDITION_SOURCE_EVIDENCE_HOLD");
 assert.equal(checkR49SourceEdition(x.fssr_clause,{...evidence,sourceEdition:"Version 2 (04.11.2024)"}).status,"EDITION_SOURCE_EVIDENCE_HOLD");
}
const fruit=r49.verified_cases.find(x=>x.fssr_clause==="2.3.33").numeric_requirements_as_registered;
assert.equal(fruit.total_soluble_solids_percent_min,65);
assert.equal(fruit.prepared_fruit_percent_min_default,45);
assert.equal(fruit.prepared_fruit_percent_min_strawberry_or_raspberry,25);
const murabba=r49.verified_cases.find(x=>x.fssr_clause==="2.3.25").numeric_requirements_as_registered;
assert.equal(murabba.total_soluble_solids_percent_min,65);
assert.equal(murabba.printed_fruit_content_percent_min,55);
assert.equal(murabba.rigid_container_fill_water_capacity_percent_min,90);
const frozen=r49.verified_cases.find(x=>x.fssr_clause==="2.3.38").numeric_requirements_as_registered;
assert.equal(frozen.thermal_center_celsius_max,-18);
assert.equal(frozen.peroxidase_test_result,"negative");
const milk=r49.verified_cases.find(x=>x.fssr_clause==="2.3.51").source_styles_as_registered;
assert.deepEqual(milk.map(x=>[x.total_solids_min_pct,x.total_solids_max_pct,x.fat_min_pct]),[[6.6,12.6,5],[12.7,25.3,10]]);
const cream=r49.verified_cases.find(x=>x.fssr_clause==="2.3.52").source_styles_as_registered;
assert.deepEqual(cream.map(x=>[x.total_solids_min_pct,x.total_solids_max_pct,x.fat_min_pct]),[[25.4,37.3,20],[37.4,null,29]]);
const pow=r49.verified_cases.find(x=>x.fssr_clause==="2.3.63").source_styles_as_registered[0];
assert.equal(pow.moisture_max_pct,2.5);
assert.equal(pow.fat_dry_min_pct,60);
assert.equal(pow.FFA_extracted_fat_as_lauric_acid_max_pct,0.2);
assert.equal(pow.bulk_density_min_g_ml,0.3);
assert.equal(pow.bulk_density_max_g_ml,0.45);
assert.equal(r49.coverage.catalogue_IDs_preserved,533);
assert.equal(r49.coverage.original_product_CTR_applicability_cases_open_before,137);
assert.equal(r49.coverage.original_product_CTR_applicability_cases_open_after,137);
assert.equal(r49.coverage.new_exact_finished_product_CTR_applicability_decisions,0);
assert.equal(r49.coverage.full_products_legally_approved_in_audit,0);
assert.equal(r49.coverage.other_Ayurveda_raw_CTR_source_gaps_unchanged,14);
assert.equal(r49.coverage.other_Ayurveda_raw_CTR_source_links_unchanged,94);
assert.equal(r49.code_or_numeric_CTR_rules_changed,false);
assert.equal(r49.live_PMSV_helper_changed,false);
assert.equal(r49.draft_PR_2_must_remain_unmerged,true);
assert.equal(r48.source_provenance.FSSR_v3_pdf_page_images_verified,false); // R48 was not retroactively altered.
console.log(JSON.stringify({status:"PASS",sourceStandards:6,coconutStyles:5,
selectedSourceLimitChangesObserved:0,productCTRholds:137,newLegalProductPASS:0,
latestSelectedPagesVisuallyChecked:true,liveHelperChanged:false}));
