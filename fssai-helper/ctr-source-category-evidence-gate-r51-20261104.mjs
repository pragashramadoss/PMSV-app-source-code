/** PMSV R51 — data provenance only; never classify real finished SKU or approve/release. */
export const ROUTES=Object.freeze(["AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS","FPC18_SPECIAL_2021_DIRECTION","INTERIM_EDIBLE_SEED_FOSCOS_ROUTE","MOUTH_FRESHENER_FOSCOS_ONLY","FOOD_INGREDIENT_OR_ADDITIVE_CATEGORY_99","FORMULATED_SUPPLEMENT_CATEGORY_13_2"]);
const result=(status,missing=[],extra={})=>({status,missing,
  sourceLevelOnly:true,exactFinishedProductFSSRLegallyAdjudicated:false,
  actualManufacturerFoSCoSClassConfirmed:false,finalCTRArticleLegallyAdjudicated:false,
  legalProductPASS:false,commercialRelease:false,autoApplyNumericCTR:false,...extra});
export function reviewSourceClassificationR51(row,e={}){
 if(!row||typeof row.catalogue_id!=="string"||!ROUTES.includes(row.source_route)||
   (!row.missing_FSSR_field&&!row.missing_FCS_field))return result("NOT_IN_R51_SOURCE_GAP");
 if(e.treatBlankSourceFieldAsNoLegalRequirement===true)return result("BLANK_FIELD_IS_NOT_A_LEGAL_EXEMPTION",["actualApplicableLawAndProductIdentity"]);
 if(row.source_dairy_cheese_2_1_17_reference_component_only_possible){
  if(e.assign2_1_17AsFinishedAyurvedaDumplingStandard===true)return result("COMPONENT_CHEESE_STANDARD_WRONGLY_ASSIGNED_TO_FINISHED_DUMPLING",["separateActualAyurvedaRecipeFinishedLegalRoute"]);
  if(e.officialLegalReviewOfFinished14_5RouteCompleted!==true)return result("AYURVEDA_14_5_COMPONENT_STANDARD_RECONCILIATION_HOLD",["officialLegalReviewOfFinished14_5RouteCompleted"]);
 }
 const missing=["actualSKUAndManufacturerVerified","realManufacturingLicenceAndRegisteredProductCategoryVerified",
 "currentOriginalGazetteAndEffectiveAmendmentsChecked",
 "actualFormulaAndIntendedUseVerified","exactLegalFinishedFoodAndCTRArticleReviewed",
 "fullRelevantAnalyticalLabEvidenceReviewed"].filter(k=>e[k]!==true);
 if(row.source_route==="AYURVEDA_CATEGORY_A_SEPARATE_REGULATIONS"){
  if(row.official_source_anchor_FCS!=="102.1")return result("AYURVEDA_SOURCE_CATEGORY_WRONG");
  if(e.actualAyurvedaCategoryARecipeMatchVerified!==true)missing.push("actualAyurvedaCategoryARecipeMatchVerified");
 }
 if(row.source_route==="FPC18_SPECIAL_2021_DIRECTION"){
  if(e.useAnnexureIIAdditiveMapAsFinishedProductFSSR===true)return result("ADDITIVE_MAPPING_IS_NOT_FINISHED_PRODUCT_STANDARD",["independentActualFSSRArticle"]);
  for(const k of ["actualFPC18EligibilityNotMapped01To14Confirmed","FPC18AnnexureIIAdditivesAndBaseIngredientPanelReviewed"]){
   if(e[k]!==true)missing.push(k);
  }
 }
 if(row.source_route==="INTERIM_EDIBLE_SEED_FOSCOS_ROUTE"&&e.currentInterimDirectiveAndSpeciesReviewed!==true)missing.push("currentInterimDirectiveAndSpeciesReviewed");
 if(row.source_route==="FOOD_INGREDIENT_OR_ADDITIVE_CATEGORY_99"&&e.actualPermittedSubstanceAndSpecificationReviewed!==true)missing.push("actualPermittedSubstanceAndSpecificationReviewed");
 if(row.source_route==="FORMULATED_SUPPLEMENT_CATEGORY_13_2"&&e.childAgeAndApplicableSupplementRegulationsReviewed!==true)missing.push("childAgeAndApplicableSupplementRegulationsReviewed");
 if(row.source_route==="MOUTH_FRESHENER_FOSCOS_ONLY"&&e.actualMouthFreshenerFormulaAndClassReviewed!==true)missing.push("actualMouthFreshenerFormulaAndClassReviewed");
 return result(missing.length?"SOURCE_CATEGORY_EVIDENCE_HOLD":"SOURCE_CATEGORY_REVIEW_READY_NOT_LEGAL_PASS",missing);
}
