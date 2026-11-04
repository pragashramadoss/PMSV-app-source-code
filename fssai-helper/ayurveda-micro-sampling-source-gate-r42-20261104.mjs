/** R42: separate regulator and in-house microbiological sampling. NEVER a legal compliance or lot-release decision. */
export const RECIPE_IDS=Object.freeze(["12.1","13.1","14.1","14.3","14.4","14.5","14.6","14.7","15.1"]);
export const RECIPE_SOURCE_HOLDS=Object.freeze(["14.6","14.7"]);
export const ACTUAL_CLASSES=Object.freeze(["UNPROCESSED_NOT_DIRECT_CONSUMPTION","DIRECT_CONSUMPTION","FERMENTED"]);
export const REGULATOR_SOURCE_PLAN=Object.freeze({
 bulk:Object.freeze({sampleUnits:5,minUnitWeightG:500,maxUnitWeightG:600,labs:3,unitsPerLab:5,minAliquotG:150,maxAliquotG:200}),
 packaged:Object.freeze({sampleUnits:15,minUnitWeightG:150,maxUnitWeightG:200,labs:3,unitsPerLab:5})
});
const result=(status,reason,extra={})=>({
 status,reason,sourceReviewOnly:true,legalPASS:false,commercialRelease:false,
 regulatoryDecisionFinal:false,numericRulesActivated:false,...extra
});
export function reviewAyurvedaMicroSampling(recipeNumber,evidence={}){
 if(!RECIPE_IDS.includes(recipeNumber))return result("UNKNOWN_SOURCE_RECIPE","No original R35 Category A recipe ID");
 if(RECIPE_SOURCE_HOLDS.includes(recipeNumber))return result("OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD","Published source recipe table and method conflict is unresolved");
 if(!evidence.actualSKUAndRecipeValidated||!evidence.actualProductClassVerified||!ACTUAL_CLASSES.includes(evidence.productClass)){
  return result("PRODUCT_IDENTITY_CLASS_HOLD","Actual SKU recipe and applicable consumption/process category are unverified");
 }
 if(evidence.purpose==="FBO_INTERNAL"){
  const missing=["inHouseTestingFrequencyAndLicensingMinimumReviewed","internalAnalyticalMethodSuitable","internalSamplingAndResultsRecorded"].filter(k=>evidence[k]!==true);
  return result(missing.length?"FBO_INTERNAL_EVIDENCE_HOLD":"FBO_INTERNAL_SOURCE_PLAN_REVIEW_READY",
    "Internal testing may use suitable non-reference methods; this never independently certifies regulatory compliance",
    {missingEvidence:missing,threeAccreditedLabsMandatoryForEveryInternalTest:false});
 }
 if(evidence.purpose!=="REGULATOR")return result("PURPOSE_HOLD","Regulator versus FBO in-house purpose not specified");
 const missing=["currentGazetteAndAmendmentsReviewed","actualLotIdentityAndTraceabilityVerified",
 "approvedReferenceMethodAndSampleHandlingVerified","allThreeAccreditedLaboratoriesVerified",
 "allThreeLabFoodSafetyResultsReviewed","allApplicableMicroCriteriaSatisfied"].filter(k=>evidence[k]!==true);
 if(evidence.exceptionProposed===true){
   if(evidence.priorFSSAISpecificExceptionApprovalVerified!==true)missing.push("priorFSSAISpecificExceptionApprovalVerified");
   return result("CASE_SPECIFIC_EXCEPTION_INDEPENDENT_REVIEW_HOLD",
      "FSSAI prior approval and precise alternative protocol require independent review; not automatically authorized",
      {missingEvidence:missing});
 }
 const spec=REGULATOR_SOURCE_PLAN[evidence.presentation];
 if(!spec)return result("PRESENTATION_HOLD","Bulk or packaged presentation must be verified");
 const units=evidence.sampleUnitWeightsG;
 if(!Array.isArray(units)||units.length!==spec.sampleUnits||
   units.some(v=>typeof v!=="number"||v<spec.minUnitWeightG||v>spec.maxUnitWeightG)){
   missing.push("sampleUnitCountAndWeightsFromSameLot");
 }
 const labs=evidence.labSets;
 if(!Array.isArray(labs)||labs.length!==3||new Set(labs.map(x=>x?.labId)).size!==3||
  labs.some(l=>typeof l?.labId!=="string"||!l.labId.trim()||l.accredited!==true||l.sampleUnitCount!==5||l.allApplicableCriteriaMet!==true)){
   missing.push("threeDistinctAccreditedLabsEachFiveUnitsAndPassingResults");
 }
 if(evidence.presentation==="bulk"){
  const qs=evidence.aliquotsPerLabG;
  if(!Array.isArray(qs)||qs.length!==3||qs.some(a=>!Array.isArray(a)||a.length!==5||
     a.some(v=>typeof v!=="number"||v<spec.minAliquotG||v>spec.maxAliquotG))){
   missing.push("fiveBulkAliquots150to200gToEachOfThreeLabs");
  }
 }
 return result(missing.length?"REGULATOR_SAMPLING_EVIDENCE_HOLD":"REGULATOR_SAMPLING_SOURCE_REVIEW_READY",
  "Three-lab sampling evidence may be complete but legal compliance and product release require independent signoff",
  {missingEvidence:missing});
}
