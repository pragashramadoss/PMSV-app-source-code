/** PMSV R50 AUDIT-ONLY evidence intake. Never outputs compliance PASS or batch release. */
export const R50_TYPES=Object.freeze([
 "CONDITIONAL_CTR_SOURCE_CANDIDATE",
 "SOURCE_IDENTITY_STANDARD_NOT_CTR_DECISION",
 "FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION",
 "INTERIM_LICENSING_ROUTE_NOT_CTR_DECISION",
 "WRONG_ARTICLE_INHERITANCE_BLOCKED",
 "AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED",
 "CONDITIONAL_FPC18_DIRECTION"
]);
export const REQUIRED_EVIDENCE=Object.freeze([
 "actualSKUIdentityAndManufacturerVerified",
 "actualRecipeProcessingPackAndIntendedUseVerified",
 "exactFSSRAndFoSCoSCategoryConfirmed",
 "originalCurrentGazetteAndEffectiveAmendmentsReviewed",
 "allCompetingLegalCTRArticleScopesAdjudicated",
 "fullCurrentContaminantsMicroAndResiduePanelReviewed",
 "analyticalMethodsAndActualLotReportsReviewed",
 "independentQARegulatoryReviewRecorded"
]);
const verdict=(status,missing=[],nextAction=null)=>({
 status,missing,nextAction,sourceEvidenceOnly:true,
 legalProductPASS:false,exactFinishedCTRArticleLegallyAdjudicated:false,
 batchReleaseAuthorized:false,liveNumericSourceAutoApply:false
});
export function reviewR50Evidence(record,evidence={}){
 evidence=evidence&&typeof evidence==="object"&&!Array.isArray(evidence)?evidence:{};
 if(!record || typeof record.id!=="string" || !R50_TYPES.includes(record.route) ||
    record.currentExactArticleDecision!=="EVIDENCE_HOLD")return verdict("UNKNOWN_OR_NON_HOLD_RECORD");
 // The underlying source screening is a reference, not product-level approval.
 if(record.blocker==="WRONG_COCOA_POWDER_ARTICLE" && evidence.ctrArticleName==="Cocoa powder"){
  return verdict("WRONG_COMMODITY_ARTICLE_BLOCK",["actualDifferentArticleAndLegalBasis"],"Do not inherit cocoa powder limits");
 }
 if(record.blocker==="OFFICIAL_AYURVEDA_RECIPE_14_6_14_7_METHOD_ALIGNMENT" &&
    evidence.officialSourceRecipeConflictIndependentlyResolved!==true){
  return verdict("OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD",["officialSourceRecipeConflictIndependentlyResolved"],"Reconcile published recipe source before source article mapping");
 }
 const missing=REQUIRED_EVIDENCE.filter(k=>evidence[k]!==true);
 if(record.route==="CONDITIONAL_FPC18_DIRECTION"){
  for(const k of ["actualFPC18DirectionEligibilityVerified","specificAnnexureAndBaseIngredientEvidenceReviewed"]){
   if(evidence[k]!==true)missing.push(k);
  }
 }
 if(record.route==="AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED"){
  for(const k of ["actualAyurvedaRecipeAndLicensingVerified","currentScheduleDAndIngredientPurityReviewed"]){
   if(evidence[k]!==true)missing.push(k);
  }
 }
 if(record.route==="INTERIM_LICENSING_ROUTE_NOT_CTR_DECISION"&&evidence.currentInterimLicenceStatusReviewed!==true){
  missing.push("currentInterimLicenceStatusReviewed");
 }
 if(record.route==="WRONG_ARTICLE_INHERITANCE_BLOCKED"&&evidence.independentCorrectNonCocoaSourceArticleVerified!==true){
  missing.push("independentCorrectNonCocoaSourceArticleVerified");
 }
 if(record.route==="FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION"&&evidence.actualFoodProductStandardOrProprietaryRouteReviewed!==true){
  missing.push("actualFoodProductStandardOrProprietaryRouteReviewed");
 }
 return verdict(missing.length?"R50_EVIDENCE_HOLD":"R50_EVIDENCE_REVIEW_READY_NOT_LEGAL_PASS",missing);
}
