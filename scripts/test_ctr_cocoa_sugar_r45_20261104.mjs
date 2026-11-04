import assert from "node:assert/strict";
import fs from "node:fs";
import {R45_IDS,R45_COCOA_WRONG_ARTICLE_IDS,R45_SUGAR_IDS,reviewR45CTRSource} from "../fssai-helper/ctr-cocoa-sugar-source-gate-r45-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r29=read("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r45=read("fssai-helper/ctr-cocoa-sugar-article-evidence-r45-2026-11-04.json");
assert.equal(r29.records.length,137);
assert.equal(new Set(r29.records.map(x=>x.catalog_id)).size,137);
const records=r45.reviewed_original_catalogue_entries;
assert.equal(records.length,7);
assert.equal(new Set(records.map(x=>x.catalogue_id)).size,7);
assert.deepEqual(new Set(records.map(x=>x.catalogue_id)),new Set(R45_IDS));
assert.equal(R45_COCOA_WRONG_ARTICLE_IDS.length,2);
assert.equal(R45_SUGAR_IDS.length,5);
for(const rec of records){
 const previous=r29.records.find(x=>x.catalog_id===rec.catalogue_id);
 assert(previous);
 assert.equal(previous.fssr,rec.fssr);
 assert.equal(rec.product_name,previous.product_name);
 assert.equal(rec.prior_screening_route,previous.r29_source_screening_route);
 assert.equal(rec.numeric_source_auto_applied,false);
 assert.equal(rec.legally_approved_product,false);
 assert.equal(rec.commercial_batch_release_authorized,false);
 const initial=reviewR45CTRSource(rec.catalogue_id,{});
 assert.equal(initial.legalProductPass,false);
 assert.equal(initial.batchRelease,false);
 assert.equal(initial.numericLimitAutoApply,false);
}
for(const id of R45_COCOA_WRONG_ARTICLE_IDS){
 assert.equal(reviewR45CTRSource(id,{finishedFoodLegallyRefinedWhiteSugar:true,sulphatedAshPercent:0.01}).status,"WRONG_COCOA_POWDER_ARTICLE_INHERITANCE_BLOCKED");
}
const sourceRows=r45.screened_named_CTR_source_rows;
assert.equal(sourceRows.length,7);
assert.deepEqual(sourceRows.map(x=>[x.metal,x.limit_mgkg,x.pdf_page_one_based]),[
 ["Lead",5,3],["Copper",70,7],["Lead",0.5,2],["Lead",5,2],["Lead",5,5],["Lead",2,4],["Copper",5,7]
]);
assert(sourceRows.every(x=>x.official_pdf_page_visually_checked&&x.actual_SKU_article_matched===false&&x.numerical_limit_live_engine_applied===false));
const ok={actualSKUFinishedProductIdentityVerified:true,correctProductFSSRClauseReviewed:true,
 actualSulphatedAshTestMethodVerified:true,allCurrentOriginalGazettesAndAmendmentsChecked:true,
 actualSampleMatrixAndFullAnalyticalPanelReviewed:true};
for(const id of R45_SUGAR_IDS){
 for(const ash of [0.0,0.03]){
  const r=reviewR45CTRSource(id,{...ok,sulphatedAshPercent:ash,requestedSourceArticle:"REFINED_WHITE_SUGAR",finishedFoodLegallyRefinedWhiteSugar:true});
  assert.equal(r.status,"CONDITIONAL_SOURCE_ROW_READY_NOT_LEGAL_PASS");
  assert.equal(r.legalProductPass,false);
 }
 for(const ash of [0.03001,0.5,1.0]){
  assert.equal(reviewR45CTRSource(id,{...ok,sulphatedAshPercent:ash,requestedSourceArticle:"REFINED_WHITE_SUGAR",finishedFoodLegallyRefinedWhiteSugar:true}).status,"REFINED_WHITE_SUGAR_SOURCE_CONDITION_NOT_PROVEN");
  assert.equal(reviewR45CTRSource(id,{...ok,sulphatedAshPercent:ash,requestedSourceArticle:"HIGH_ASH_NAMED_SUGARS",finishedFoodLegallyInNamedHighAshSugarGroup:true}).status,"HIGH_ASH_SUGAR_SOURCE_CONDITION_NOT_PROVEN");
 }
 const r=reviewR45CTRSource(id,{...ok,sulphatedAshPercent:1.01,requestedSourceArticle:"HIGH_ASH_NAMED_SUGARS",finishedFoodLegallyInNamedHighAshSugarGroup:true});
 assert.equal(r.status,"CONDITIONAL_SOURCE_ROW_READY_NOT_LEGAL_PASS");
 assert.equal(r.legalProductPass,false);
 assert.equal(reviewR45CTRSource(id,{...ok,sulphatedAshPercent:1.01,requestedSourceArticle:"HIGH_ASH_NAMED_SUGARS",finishedFoodLegallyInNamedHighAshSugarGroup:false}).status,"HIGH_ASH_SUGAR_SOURCE_CONDITION_NOT_PROVEN");
 assert.equal(reviewR45CTRSource(id,{...ok,sulphatedAshPercent:1.01,requestedSourceArticle:"RAW_SUGAR"}).status,"OTHER_SOURCE_ARTICLE_NOT_ADJUDICATED");
}
const result=r45.results;
assert.equal(result.new_exact_finished_product_CTR_applicability_decisions_closed,0);
assert.equal(result.remaining_original_product_CTR_article_holds,137);
assert.equal(result.remaining_Ayurveda_ingredient_source_gaps,14);
assert.equal(result.cumulative_Ayurveda_raw_CTR_links,94);
assert.equal(result.full_product_legal_approvals,0);
assert.equal(result.live_PMSV_helper_changed,false);
assert.equal(result.PR_2_remains_draft_unmerged,true);
console.log(JSON.stringify({status:"PASS",screenedSeven:7,originalProductHolds:137,newLegalApprovals:0,
 sourceRows:7,misinheritanceBlocks:2,sugarIdentityGates:5,ashBoundaryCases:["0.03","1.0","1.01"]}));
