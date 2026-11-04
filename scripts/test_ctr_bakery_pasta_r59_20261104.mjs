import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewBakeryPastaSource} from "../fssai-helper/ctr-bakery-pasta-source-gate-r59-20261104.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-bakery-pasta-five-source-review-r59-2026-11-04.json");
const p29=rd("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const p50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(p29.records.length,137);assert.equal(p50.records.length,137);
assert.equal(r.catalogue_total_unchanged,533);
assert.equal(r.original_CTR_product_article_decisions_open,137);
assert.equal(r.original_five_P2_cases,5);
assert.equal(r.new_unique_focus_reviews_this_round,5);
assert.equal(r.now_focus_unique_cases_R45_to_R59,35);
assert.equal(r.original_137_cases_not_in_R45_to_R59_focused_batch,102);
assert.equal(r.legal_CTR_product_article_decisions_closed_this_round,0);
assert.equal(r.full_finished_products_legally_approved,0);
assert.equal(r.commercial_batch_releases_authorized,0);
assert.equal(r.original_R29_R50_registers_modified,false);
assert.equal(r.live_pmsv_helper_changed,false);
assert.equal(r.product_master_changed,false);
assert.equal(r.operative_numeric_CTR_rules_modified,false);
assert.equal(r.PR_2_draft_unmerged,true);
assert.equal(r.product_source_records.length,5);
assert.equal(new Set(r.product_source_records.map(x=>x.catalogue_id)).size,5);
const expected=new Map([
["07-07-2-biscuit",["07.2.1","2.4.15(1)","BISCUIT_GENERAL",[0.1,2.0]]],
["07-07-2-wafer-biscuit",["07.2.2","2.4.15(1)","WAFER_IS_BISCUIT_SUBTYPE",[0.1,2.0]]],
["07-07-1-bread-and-bread-type-products",["07.1.1","2.4.15(2)","BREAD_AND_RUSK",[7.5,1.5,0.2]]],
["06-06-4-macaroni-products-pasta-products",["06.4.2","2.4.10","PASTA_PRODUCTS",[12.5,0.1]]],
["06-06-4-macaroni-products-instant-noodle",["06.4.3","2.4.10","INSTANT_NOODLES",[10,13,0.3,2]]]
]);
for(const row of r.product_source_records){
 assert.ok(expected.has(row.catalogue_id));
 const [fpc,fssr,kind,limits]=expected.get(row.catalogue_id);
 const old=p29.records.find(x=>x.catalog_id===row.catalogue_id);
 const old50=p50.records.find(x=>x.id===row.catalogue_id);
 assert.ok(old&&old50);
 assert.equal(row.source_FPC,old.fcs);
 assert.equal(row.source_FSSR,old.fssr);
 assert.equal(fpc,old.fcs);assert.equal(fssr,old.fssr);
 assert.equal(row.FSSR_source_standard_kind,kind);
 assert.equal(old50.priority,"P2");
 assert.equal(old50.currentLegalArticleAdjudicated,false);
 assert.deepEqual(row.printed_source_quality_parameters.map(x=>x.max_value),limits);
 assert.ok(row.printed_source_quality_parameters.every(x=>x.basis&&x.unit));
 assert.equal(row.actual_manufacturer_product_type_matched,false);
 assert.equal(row.correct_finished_product_CTR_named_article_legally_decided,false);
 assert.equal(row.finished_product_legal_PASS,false);
 assert.equal(row.batch_release_authorized,false);
 assert.equal(row.source_specifications_auto_applied_to_real_SKU,false);
 const result=reviewBakeryPastaSource(r,row.catalogue_id);
 assert.equal(result.status,"OFFICIAL_BAKERY_PASTA_FSSR_SOURCE_ONLY__CTR_LEGAL_ARTICLE_HOLD");
 assert.equal(result.legalProductPASS,false);
 assert.equal(result.commercialBatchReleaseAuthorized,false);
 const fake=reviewBakeryPastaSource(r,row.catalogue_id,{
  legalProductPASS:true,autoApplyCerealAflatoxin:true,autoApplyCompositeAflatoxin:true,batchRelease:true,
  treatRuskAsBiscuit:true,usePre2021BiscuitFatAcidity:true,skipSeasoningRegulations:true
 });
 assert.equal(fake.status,"INDEPENDENT_CURRENT_ACTUAL_SKU_AND_CTR_ARTICLE_ASSESSMENT_REQUIRED");
 assert.equal(fake.legalProductPASS,false);
}
const source=r.official_evidence;
assert.equal(source.length,3);
const fssr=source.find(x=>x.source_kind.includes("Chapter 2.4"));
assert.ok(fssr);
assert.deepEqual(fssr.pdf_pages_one_based_visually_checked,[33,34,35,56,57,58]);
assert.equal(fssr.complete_2026_original_Gazette_amendment_reconciliation,false);
const gazette=source.find(x=>x.source_kind.includes("Original Gazette"));
assert.ok(gazette);
assert.deepEqual(gazette.pdf_zero_based_pages_image_checked,[33,34]);
const ctr=source.find(x=>x.source_kind.includes("CTR Version IX"));
assert.ok(ctr);assert.equal(ctr.page_image_verified,true);
const contaminants=r.named_cereal_vs_composite_CTR_source_rows;
assert.equal(contaminants.length,4);
assert.deepEqual(contaminants.map(x=>x.limit_ug_per_kg),[15,10,20,10]);
assert.ok(contaminants.every(x=>x.actual_finished_product_article_assigned===false&&
 x.numeric_CTR_limit_auto_applied===false&&x.source_page_image_verified===true));
assert.equal(reviewBakeryPastaSource(r,"not-an-id").status,"NOT_IN_R59_SCOPE");
let tampered=structuredClone(r);
tampered.product_source_records[1].printed_source_quality_parameters[1].max_value=1.5;
assert.equal(reviewBakeryPastaSource(tampered,tampered.product_source_records[1].catalogue_id).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
tampered=structuredClone(r);
tampered.product_source_records[2].source_FSSR="2.4.15(1)";
assert.equal(reviewBakeryPastaSource(tampered,tampered.product_source_records[2].catalogue_id).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
tampered=structuredClone(r);
tampered.named_cereal_vs_composite_CTR_source_rows[2].limit_ug_per_kg=15;
assert.equal(reviewBakeryPastaSource(tampered,"07-07-2-biscuit").status,"SOURCE_REGISTER_INTEGRITY_HOLD");
// Ensure 35 unique IDs: prior focused audit scopes + the five R59 IDs.
const groups=[
["fssai-helper/ctr-cocoa-sugar-article-evidence-r45-2026-11-04.json","reviewed_original_catalogue_entries"],
["fssai-helper/ctr-fruit-cheese-murabba-frozen-vegetables-r46-2026-11-04.json","actual_catalogue_records"],
["fssai-helper/ctr-coconut-milk-cream-powder-r47-2026-11-04.json","products"],
["fssai-helper/ctr-frozen-fruit-tamarind-potato-r48-2026-11-04.json","product_cases"],
["fssai-helper/ctr-category-99-seven-blank-fssr-r54-2026-11-04.json","seven_records"],
["fssai-helper/ctr-mouth-freshener-2021-direction-r55-2026-11-04.json","records"],
["fssai-helper/ctr-edible-seeds-2024-direction-r56-2026-11-04.json","records"],
["fssai-helper/ctr-child-supplement-fssr-standard-r57-2026-11-04.json","catalogue_id"],
["fssai-helper/ctr-pan-masala-product-label-packaging-r58-2026-11-04.json","source_reviewed_catalogue_ids"]
];
const prior=new Set();
const universe=new Set(p50.records.map(x=>x.id));
for(const [path,key] of groups){
 const g=rd(path);
 const records=typeof g[key]==="string"?[g[key]]:g[key];
 for(const z of records){const id=typeof z==="string"?z:z.catalogue_id;assert.ok(universe.has(id),id);prior.add(id);}
}
assert.equal(prior.size,30);
const focused=new Set([...prior,...r.product_source_records.map(x=>x.catalogue_id)]);
assert.equal(focused.size,35);
assert.equal(137-focused.size,102);
console.log(JSON.stringify({result:"PASS",official_FSSR_verified_sources:5,focus_unique_total:35,remaining_unfocused_in_these_rounds:102,original_product_CTR_legal_holds:137,legally_approved_products:0},null,2));
