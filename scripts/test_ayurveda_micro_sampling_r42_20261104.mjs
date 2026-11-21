import fs from "node:fs";
import assert from "node:assert/strict";
import {reviewAyurvedaMicroSampling,RECIPE_IDS,RECIPE_SOURCE_HOLDS,REGULATOR_SOURCE_PLAN} from "../fssai-helper/ayurveda-micro-sampling-source-gate-r42-20261104.mjs";
const get=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r41=get("fssai-helper/ayurveda-schedule-d-finished-product-source-r41-2026-11-04.json");
const r42=get("fssai-helper/ayurveda-microbiological-sampling-r42-2026-11-04.json");
assert.equal(r41.original_product_CTR_article_decisions_held,137);
assert.equal(r42.preserved_original_catalogue_count,533);
assert.equal(r42.preserved_original_ayurveda_recipe_count,9);
assert.equal(r42.preserved_raw_CTR_ingredient_source_links,94);
assert.equal(r42.preserved_ingredient_raw_CTR_source_candidate_gaps,14);
assert.equal(r42.preserved_exact_product_CTR_applicability_holds,137);
assert.equal(r42.legal_product_approvals,0);
assert.equal(r42.source_official_sampling_guide.pdf_page_image_visually_verified,true);
assert.equal(r42.source_official_gazette.pdf_page_image_verified,false);
assert.equal(r42.sample_scheme_by_actual_product_class.length,3);
assert.deepEqual(new Set(r42.nine_source_recipe_coverage.map(x=>x.recipe_number)),new Set(r41.source_linked_recipes.map(x=>x.recipe_number)));
assert.deepEqual(new Set(RECIPE_IDS),new Set(r41.source_linked_recipes.map(x=>x.recipe_number)));
assert.equal(r42.nine_source_recipe_coverage.every(x=>!x.product_compliance_PASS&&!x.batch_release_authorized),true);
assert.equal(r42.under_100_g_or_over_1_kg_exception_guard.prior_FSSAI_approval_required,true);
for(const c of r42.sample_scheme_by_actual_product_class){
 assert.equal(c.bulk.batch_lot_sample_unit_count,5);
 assert.equal(c.bulk.sample_unit_weight_g_min,500);
 assert.equal(c.bulk.sample_unit_weight_g_max,600);
 assert.equal(c.packaged.batch_lot_sample_unit_count,15);
 assert.equal(c.packaged.sample_unit_weight_g_min,150);
 assert.equal(c.packaged.sample_unit_weight_g_max,200);
 assert.equal(c.bulk.laboratory_count,3);
 assert.equal(c.packaged.laboratory_count,3);
 assert.equal(c.pdf_page_image_visually_verified??c.screenshot_page_1_visually_verified,true);
}
const passBase={actualSKUAndRecipeValidated:true,actualProductClassVerified:true,productClass:"DIRECT_CONSUMPTION",purpose:"REGULATOR",currentGazetteAndAmendmentsReviewed:true,actualLotIdentityAndTraceabilityVerified:true,approvedReferenceMethodAndSampleHandlingVerified:true,allThreeAccreditedLaboratoriesVerified:true,allThreeLabFoodSafetyResultsReviewed:true,allApplicableMicroCriteriaSatisfied:true,processHygieneEvidenceReviewed:true,claimedMicroorganismLabelRequirementReviewed:true,
labSets:[{labId:"LabA",accredited:true,sampleUnitCount:5,allApplicableCriteriaMet:true},{labId:"LabB",accredited:true,sampleUnitCount:5,allApplicableCriteriaMet:true},{labId:"LabC",accredited:true,sampleUnitCount:5,allApplicableCriteriaMet:true}]};
assert.equal(REGULATOR_SOURCE_PLAN.bulk.sampleUnits,5);
assert.equal(REGULATOR_SOURCE_PLAN.packaged.sampleUnits,15);
for(const id of RECIPE_SOURCE_HOLDS){
 assert.equal(reviewAyurvedaMicroSampling(id,{...passBase,presentation:"packaged",sampleUnitWeightsG:Array(15).fill(175)}).status,"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");
}
for(const id of RECIPE_IDS.filter(x=>!RECIPE_SOURCE_HOLDS.includes(x))){
 const pack={...passBase,presentation:"packaged",sampleUnitWeightsG:Array(15).fill(175)};
 const bp={...passBase,presentation:"bulk",sampleUnitWeightsG:Array(5).fill(550),aliquotsPerLabG:Array.from({length:3},()=>Array(5).fill(175))};
 for(const x of [pack,bp]){
  const out=reviewAyurvedaMicroSampling(id,x);
  assert.equal(out.status,"REGULATOR_SAMPLING_SOURCE_REVIEW_READY");
  assert.equal(out.legalPASS,false);
  assert.equal(out.commercialRelease,false);
 }
 // Test class-specific scope: don't demand pathogens where Gazette says NA.
 const unprocessed={...pack,productClass:"UNPROCESSED_NOT_DIRECT_CONSUMPTION"};
 delete unprocessed.allThreeLabFoodSafetyResultsReviewed;
 assert.equal(reviewAyurvedaMicroSampling(id,unprocessed).status,"REGULATOR_SAMPLING_SOURCE_REVIEW_READY");
 assert.equal(reviewAyurvedaMicroSampling(id,{...unprocessed,processHygieneEvidenceReviewed:false}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 // Fermented class has no standard APC/YM/Enterobacteriaceae process-hygiene row,
 // but requires fermented microbe label/identity evidence in addition to food-safety criteria.
 const fermented={...pack,productClass:"FERMENTED"};
 delete fermented.processHygieneEvidenceReviewed;
 assert.equal(reviewAyurvedaMicroSampling(id,fermented).status,"REGULATOR_SAMPLING_SOURCE_REVIEW_READY");
 assert.equal(reviewAyurvedaMicroSampling(id,{...fermented,claimedMicroorganismLabelRequirementReviewed:false}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...fermented,allThreeLabFoodSafetyResultsReviewed:false}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...pack,allThreeLabFoodSafetyResultsReviewed:false}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...pack,sampleUnitWeightsG:Array(5).fill(175)}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...pack,labSets:pack.labSets.slice(0,1)}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...pack,labSets:[pack.labSets[0],pack.labSets[0],pack.labSets[2]]}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...bp,aliquotsPerLabG:[[175,175,175,175,175],[175,175,175,175,175],[90,175,175,175,175]]}).status,"REGULATOR_SAMPLING_EVIDENCE_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...pack,exceptionProposed:true}).status,"CASE_SPECIFIC_EXCEPTION_INDEPENDENT_REVIEW_HOLD");
 assert.equal(reviewAyurvedaMicroSampling(id,{...pack,exceptionProposed:true,priorFSSAISpecificExceptionApprovalVerified:true}).legalPASS,false);
 const fbo=reviewAyurvedaMicroSampling(id,{actualSKUAndRecipeValidated:true,actualProductClassVerified:true,productClass:"DIRECT_CONSUMPTION",purpose:"FBO_INTERNAL",inHouseTestingFrequencyAndLicensingMinimumReviewed:true,internalAnalyticalMethodSuitable:true,internalSamplingAndResultsRecorded:true});
 assert.equal(fbo.status,"FBO_INTERNAL_SOURCE_PLAN_REVIEW_READY");
 assert.equal(fbo.threeAccreditedLabsMandatoryForEveryInternalTest,false);
 assert.equal(fbo.legalPASS,false);
}
assert.equal(r42.numeric_CTR_rule_changes,0);
assert.equal(r42.live_product_master_modified,false);
assert.equal(r42.live_PMSV_application_modified,false);
assert.equal(r42.PR_2_remains_draft_unmerged,true);
console.log(JSON.stringify({status:"PASS",source_recipe_ids:9,source_sampling_classes:3,regulatory_lab_sets:3,packaged_units:15,bulk_units:5,raw_CTR_gaps:14,product_CTR_holds:137,legal_approvals:0}));
