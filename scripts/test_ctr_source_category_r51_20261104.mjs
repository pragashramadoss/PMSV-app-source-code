import fs from "node:fs";
import assert from "node:assert/strict";
import {reviewSourceClassificationR51,ROUTES} from "../fssai-helper/ctr-source-category-evidence-gate-r51-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const old=read("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r50=read("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r34=read("fssai-helper/ctr-fpc18-full-route-evidence-r34-2026-11-04.json");
const r44=read("fssai-helper/ayurveda-kob-licence-claims-r44-2026-11-04.json");
const r51=read("fssai-helper/ctr-missing-fssr-fcs-source-reconciliation-r51-2026-11-04.json");
assert.equal(old.catalogue,533);
assert.equal(old.records.length,137);
assert.equal(r50.counts.open_exact_article_decisions,137);
const blanksFSSR=old.records.filter(x=>!x.fssr);
const blanksFCS=old.records.filter(x=>!x.fcs);
const overlapping=blanksFSSR.filter(x=>!x.fcs);
const union=new Set([...blanksFSSR,...blanksFCS].map(x=>x.catalog_id));
assert.equal(blanksFSSR.length,33);
assert.equal(blanksFCS.length,9);
assert.equal(overlapping.length,8);
assert.equal(union.size,34);
assert.equal(r51.records.length,34);
assert.deepEqual(new Set(r51.records.map(x=>x.catalogue_id)),union);
assert.equal(new Set(r51.records.map(x=>x.catalogue_id)).size,34);
assert.deepEqual(r51.counts.route_distribution,{
 INTERIM_EDIBLE_SEED_FOSCOS_ROUTE:2,
 MOUTH_FRESHENER_FOSCOS_ONLY:3,
 AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS:9,
 FPC18_SPECIAL_2021_DIRECTION:12,
 FOOD_INGREDIENT_OR_ADDITIVE_CATEGORY_99:7,
 FORMULATED_SUPPLEMENT_CATEGORY_13_2:1
});
assert.deepEqual(new Set(ROUTES),new Set(Object.keys(r51.counts.route_distribution)));
assert.equal(r51.counts.source_R29_blank_FSSR_fields,33);
assert.equal(r51.counts.source_R29_blank_FCS_fields,9);
assert.equal(r51.counts.source_R29_both_blank_fields,8);
assert.equal(r51.counts.union_of_records_with_either_field_blank,34);
assert.equal(r51.counts.source_level_Ayurveda_Category_A_102_1_anchors,9);
assert.equal(r51.counts.source_level_FPC18_direction_anchors,12);
assert.equal(r51.counts.original_2_1_17_component_to_Ayurveda_14_5_misinterpretation_flagged,1);
const oldById=new Map(old.records.map(x=>[x.catalog_id,x]));
const ayu=new Map(r44.source_recipe_routes.map(x=>[x.id,x]));
const fp=new Map(r34.products.map(x=>[x.catalog_id,x]));
const flags={AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS:0,FPC18_SPECIAL_2021_DIRECTION:0,extraCheese:0};
const allEvidence={
 actualSKUAndManufacturerVerified:true,realManufacturingLicenceAndRegisteredProductCategoryVerified:true,
 currentOriginalGazetteAndEffectiveAmendmentsChecked:true,
 actualFormulaAndIntendedUseVerified:true,exactLegalFinishedFoodAndCTRArticleReviewed:true,
 fullRelevantAnalyticalLabEvidenceReviewed:true,actualAyurvedaCategoryARecipeMatchVerified:true,
 actualFPC18EligibilityNotMapped01To14Confirmed:true,FPC18AnnexureIIAdditivesAndBaseIngredientPanelReviewed:true,
 currentInterimDirectiveAndSpeciesReviewed:true,actualPermittedSubstanceAndSpecificationReviewed:true,
 childAgeAndApplicableSupplementRegulationsReviewed:true,actualMouthFreshenerFormulaAndClassReviewed:true,
 officialLegalReviewOfFinished14_5RouteCompleted:true
};
for(const row of r51.records){
 const src=oldById.get(row.catalogue_id);
 assert(src,"Unexpected R51 ID");
 assert.equal(row.source_product_name,src.product_name);
 assert.equal(row.R29_FSSR_field,src.fssr||null);
 assert.equal(row.R29_FCS_field,src.fcs||null);
 assert.equal(row.missing_FSSR_field,!src.fssr);
 assert.equal(row.missing_FCS_field,!src.fcs);
 assert.equal(row.actual_manufactured_SKU_legal_category_verified,false);
 assert.equal(row.current_finished_product_FSSR_clause_legally_adjudicated,false);
 assert.equal(row.exact_CTR_finished_product_article_legally_adjudicated,false);
 assert.equal(row.legal_product_PASS,false);
 assert.equal(row.commercial_batch_release,false);
 assert.equal(row.false_regulatory_exemption_from_blank_source_field_blocked,true);
 const empty=reviewSourceClassificationR51(row,{});
 assert.equal(empty.legalProductPASS,false);
 assert.equal(empty.commercialRelease,false);
 assert.notEqual(empty.status,"SOURCE_CATEGORY_REVIEW_READY_NOT_LEGAL_PASS");
 const noLaw=reviewSourceClassificationR51(row,{treatBlankSourceFieldAsNoLegalRequirement:true});
 assert.equal(noLaw.status,"BLANK_FIELD_IS_NOT_A_LEGAL_EXEMPTION");
 const complete=reviewSourceClassificationR51(row,allEvidence);
 assert.equal(complete.status,"SOURCE_CATEGORY_REVIEW_READY_NOT_LEGAL_PASS");
 assert.equal(complete.legalProductPASS,false);
 assert.equal(complete.finalCTRArticleLegallyAdjudicated,false);
 if(row.source_route==="AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS"){
  flags.AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS++;
  assert.equal(row.official_source_anchor_FCS,"102.1");
  assert.equal(row.source_anchor_kind,"AYURVEDA_CATEGORY_A_FROM_2025_ORDER");
  assert(ayu.has(row.catalogue_id));
  assert.equal(ayu.get(row.catalogue_id).FC,"102.1");
  assert.equal(row.missing_FCS_field,true);
 } else if(row.source_route==="FPC18_SPECIAL_2021_DIRECTION"){
  flags.FPC18_SPECIAL_2021_DIRECTION++;
  const p=fp.get(row.catalogue_id);
  assert(p,"FPC18 missing from R34");
  assert.equal(row.official_source_anchor_FCS,p.fpc_code);
  assert.deepEqual(row.FPC18_only_additive_mapped_FSSR_categories,p.additive_mapped_FSSR_categories);
  assert.equal(row.source_2021_FPC18_Annexure_II_table,p.additive_mapping_annexure_II_table);
  assert.equal(reviewSourceClassificationR51(row,{...allEvidence,useAnnexureIIAdditiveMapAsFinishedProductFSSR:true}).status,
   "ADDITIVE_MAPPING_IS_NOT_FINISHED_PRODUCT_STANDARD");
 }
 if(row.source_dairy_cheese_2_1_17_reference_component_only_possible){
  flags.extraCheese++;
  assert.equal(row.catalogue_id,"102-102-1-14-5-dugdha-kupika-stuffed-fried-cottage-cheese-dumplings");
  assert.equal(row.R29_FSSR_field,"2.1.17");
  assert.equal(row.r29_source_FSSR_2_1_17_valid_as_finished_product_standard,false);
  assert.equal(reviewSourceClassificationR51(row,{...allEvidence,assign2_1_17AsFinishedAyurvedaDumplingStandard:true}).status,
   "COMPONENT_CHEESE_STANDARD_WRONGLY_ASSIGNED_TO_FINISHED_DUMPLING");
  assert.equal(reviewSourceClassificationR51(row,{...allEvidence,officialLegalReviewOfFinished14_5RouteCompleted:false}).status,
   "AYURVEDA_14_5_COMPONENT_STANDARD_RECONCILIATION_HOLD");
 }
}
assert.deepEqual(flags,{AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS:9,FPC18_SPECIAL_2021_DIRECTION:12,extraCheese:1});
assert.equal(r51.verification_provenance.FSSR_2_1_17_explicitly_cheese_and_cheese_products,true);
assert.equal(r51.counts.remaining_product_CTR_article_holds,137);
assert.equal(r51.counts.new_exact_CTR_product_article_decisions_closed,0);
assert.equal(r51.counts.new_current_finished_product_FSSR_clauses_adjudicated,0);
assert.equal(r51.counts.full_product_legal_APPROVALS,0);
assert.equal(r51.counts.commercial_batch_releases,0);
assert.equal(r51.counts.separate_Ayurveda_raw_CTR_source_links,94);
assert.equal(r51.counts.separate_Ayurveda_raw_CTR_source_gaps,14);
assert.equal(r51.live_PMSV_helper_modified,false);
assert.equal(r51.original_product_master_modified,false);
assert.equal(r51.PR_2_must_remain_draft_unmerged,true);
console.log(JSON.stringify({status:"PASS",uniqueClassificationCases:34,blankFSSR:33,blankFCS:9,
 overlap:8,Ayurveda102_1Anchors:9,FPC18DirectedCases:12,cheeseMappingIssues:1,
 originalCTRholds:137,fullyApprovedProducts:0}));
