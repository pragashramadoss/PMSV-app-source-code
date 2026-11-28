/** PMSV R41: Schedule D source completeness gate, audit use only. Never legal PASS/release. */
export const AYURVEDA_RECIPE_IDS=Object.freeze(["12.1","13.1","14.1","14.3","14.4","14.5","14.6","14.7","15.1"]);
export const RECIPE_ALIGNMENT_HOLDS=Object.freeze(["14.6","14.7"]);
export const EVIDENCE_FIELDS=Object.freeze([
 "actualSKUAndAyurvedaCategoryConfirmed",
 "actualRecipeIngredientsAndRatiosVerified",
 "actualIntendedUseAndProcessCategoryConfirmed",
 "applicableCurrentGazetteAndAmendmentsChecked",
 "scheduleDMicroFoodSafetySamplingAndMethodChecked",
 "scheduleDProcessHygienePanelReviewed",
 "scheduleDContaminantAndAflatoxinFootnoteScopeReviewed",
 "actualLaboratoryResultsReviewed",
 "sourcePDFPagesVisuallyChecked"
]);
export function reviewAyurvedaScheduleD(recipeId,evidence={}){
 if(!AYURVEDA_RECIPE_IDS.includes(recipeId))return {
  status:"NOT_A_SOURCE_RECIPE",legalPASS:false,batchRelease:false,numericLimitsAutoApply:false,
  reason:"No authoritative R35 recipe-source identity"};
 if(RECIPE_ALIGNMENT_HOLDS.includes(recipeId))return {
  status:"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD",legalPASS:false,batchRelease:false,numericLimitsAutoApply:false,
  reason:"Published 2025 recipe table/title/method needs independent official clarification"};
 const missing=EVIDENCE_FIELDS.filter(field=>evidence[field]!==true);
 return {
  status:missing.length?"SCHEDULE_D_EVIDENCE_HOLD":"SCHEDULE_D_SOURCE_REVIEW_READY",
  missingEvidence:missing,
  legalPASS:false,batchRelease:false,numericLimitsAutoApply:false,
  reason:missing.length?"Schedule D source and SKU evidence incomplete":"Source review readiness only; separate legal review required"
 };
}
