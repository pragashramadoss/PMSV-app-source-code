/** PMSV R44 SOURCE-ONLY: product listing or approval letters never yield legal PASS. */
export const SOURCE_RECIPES=Object.freeze(["12.1","13.1","14.1","14.3","14.4","14.5","14.6","14.7","15.1"]);
const H=new Set(["14.6","14.7"]);
const outcome=(status,missing=[])=>({status,missing,legalPASS:false,commercialRelease:false,sourceReadinessOnly:true,numericRuleActivation:false});
export function categoryASourceCheck(id,e={}){
 if(!SOURCE_RECIPES.includes(id))return outcome("NOT_ORIGINAL_A_RECIPE");
 if(H.has(id))return outcome("OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");
 const req=["actualManufacturerCentralLicenceVerified","actualSKURecipeMatchesListVerified","fullCurrentFoodSafetyAndLabelReviewed","claimTypeReviewed"];
 const missing=req.filter(k=>e[k]!==true);
 if(e.FoSCoSCategory!=="102.1")missing.push("category102_1");
 if(e.diseaseRiskReductionClaimPresent===true&&e.HQClaimLetterVerified!==true)missing.push("HQClaimLetterVerified");
 return outcome(missing.length?"CATEGORY_A_EVIDENCE_HOLD":"CATEGORY_A_SOURCE_REVIEW_READY",missing);
}
export function otherCategorySourceCheck(fc,e={}){
 if(!["102.2","102.3","102.4"].includes(fc))return outcome("UNSUPPORTED_B_CATEGORY");
 const req=["actualManufacturerCentralLicenceVerified","actualSKUIdentityVerified","HQProductApprovalLetterVerified","fullCurrentFoodSafetyAndLabelReviewed"];
 const missing=req.filter(k=>e[k]!==true);
 if(["102.3","102.4"].includes(fc)&&e.healthOrDiseaseRiskClaimPresent===true&&e.HQClaimLetterVerified!==true)missing.push("HQClaimLetterVerified");
 return outcome(missing.length?"B_CATEGORY_EVIDENCE_HOLD":"B_CATEGORY_SOURCE_REVIEW_READY",missing);
}
