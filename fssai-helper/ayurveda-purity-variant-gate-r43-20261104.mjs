/** PMSV R43 source-only criteria. This is NOT a commercial product or legal release decision. */
export const ORIGINAL_14=Object.freeze([
  Object.freeze({id:"12.1:1",family:"water",route:"PROCESS_INGREDIENT_WATER_QUALITY"}),
  Object.freeze({id:"12.1:3",family:"juniper_fruit",route:"BOTANICAL_IDENTITY_FOOD_USE"}),
  Object.freeze({id:"12.1:4",family:"sandalwood_heartwood",route:"BOTANICAL_IDENTITY_FOOD_USE"}),
  Object.freeze({id:"12.1:5",family:"vetiver_root",route:"BOTANICAL_IDENTITY_FOOD_USE"}),
  Object.freeze({id:"13.1:1",family:"water",route:"PROCESS_INGREDIENT_WATER_QUALITY"}),
  Object.freeze({id:"13.1:5",family:"asafoetida_oleoresin",route:"BOTANICAL_RESIN_IDENTITY"}),
  Object.freeze({id:"14.5:5",family:"camphor_extract",route:"CAMphOR_EDIBLE_GRADE_AND_SAFETY"}),
  Object.freeze({id:"14.6:2",family:"screw_pine_flower",route:"FLOWER_PROCESS_STAGE"}),
  Object.freeze({id:"14.6:9",family:"jasmine_flower",route:"FLOWER_PROCESS_STAGE"}),
  Object.freeze({id:"14.6:10",family:"pomegranate_flower",route:"FLOWER_PROCESS_STAGE"}),
  Object.freeze({id:"14.6:11",family:"ball_tree_flower",route:"FLOWER_PROCESS_STAGE"}),
  Object.freeze({id:"14.7:2",family:"unidentified_aromatic_flowers",route:"FLOWER_PROCESS_STAGE"}),
  Object.freeze({id:"14.7:3",family:"water",route:"PROCESS_INGREDIENT_WATER_QUALITY"}),
  Object.freeze({id:"15.1:2",family:"water",route:"PROCESS_INGREDIENT_WATER_QUALITY"}),
]);
export const SOURCE_RECIPE_HOLDS=Object.freeze(["14.6","14.7"]);
const common=Object.freeze([
 "adoptedPurityStandardAndEditionDocumented",
 "adoptedCriteriaLicensingDisclosureReviewed",
 "actualSupplierLotAndSpecificationReviewed",
 "actualGradeAndRawMaterialFormVerified",
 "currentLegalArticleAndProcessingBasisReviewed",
 "actualLaboratoryEvidenceReviewed",
 "sourcePageAndCurrentAmendmentsVerified"
]);
export function reviewIngredientPuritySource(key,evidence={}){
 const r=ORIGINAL_14.find(x=>x.id===key);
 if(!r)return {status:"NOT_IN_ORIGINAL_14",legalPASS:false,commercialRelease:false,numericCTRAutoApplied:false};
 if(SOURCE_RECIPE_HOLDS.includes(key.split(":")[0]))return {
  status:"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD",legalPASS:false,commercialRelease:false,numericCTRAutoApplied:false,
  reason:"Published 14.6 / 14.7 title-method evidence needs authoritative clarification"
 };
 const needs=[...common];
 if(r.family==="water")needs.push("waterPotabilityAndPointOfUseEvidenceReviewed");
 else needs.push("botanicalSpeciesPartAndAllowedFoodUseReviewed");
 if(r.route==="FLOWER_PROCESS_STAGE")needs.push("flowerRemovalAndTransferEvidenceReviewed");
 if(r.family==="camphor_extract")needs.push("edibleCamphorCompositionAndToxicologyReviewed");
 const missing=needs.filter(k=>evidence[k]!==true);
 return {status:missing.length?"PURITY_EVIDENCE_HOLD":"PURITY_SOURCE_REVIEW_READY",missing,
  legalPASS:false,commercialRelease:false,numericCTRAutoApplied:false,
  reason:"Purity-source readiness does not establish current raw CTR numerical applicability, finished product safety or commercial release"};
}
export function reviewRecipeVariant(recipeNumber,evidence={}){
 if(!SOURCE_RECIPE_HOLDS.includes(recipeNumber))return {status:"NOT_A_SOURCE_VARIANT_HOLD",legalPASS:false,commercialRelease:false};
 return {status:"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD",legalPASS:false,commercialRelease:false,numericCTRAutoApplied:false,
  missing:["officialCorrigendumOrIndependentLegalResolution","actualRecipeVariantAndFormulationConfirmed","flowerProcessExposureTransferStudyReviewed","finishedFoodSafetyMethodAndLabResultsReviewed"].filter(k=>evidence[k]!==true)};
}
