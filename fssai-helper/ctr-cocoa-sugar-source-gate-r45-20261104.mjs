/** PMSV R45 audit-only. Source screening can NEVER approve, deploy, or release a product. */
export const R45_IDS=Object.freeze(["04-04-2-cocoa-beans","06-06-2-carob-powder","11-11-1-bura-sugar","11-11-1-cube-sugar","11-11-1-icing-sugar","11-11-1-khandsari-sugar","11-11-1-plantation-white-sugar"]);
export const R45_COCOA_WRONG_ARTICLE_IDS=Object.freeze(["04-04-2-cocoa-beans","06-06-2-carob-powder"]);
export const R45_SUGAR_IDS=Object.freeze(["11-11-1-bura-sugar","11-11-1-cube-sugar","11-11-1-icing-sugar","11-11-1-khandsari-sugar","11-11-1-plantation-white-sugar"]);
const R=(status,missing=[],sourceRowCandidate=null)=>({status,missing,sourceRowCandidate,
  sourceReviewOnly:true,legalProductPass:false,batchRelease:false,numericLimitAutoApply:false});
export function reviewR45CTRSource(catalogueId, e={}){
 if(!R45_IDS.includes(catalogueId))return R("NOT_IN_R45_SOURCE_SAMPLE");
 if(R45_COCOA_WRONG_ARTICLE_IDS.includes(catalogueId)){
  return R("WRONG_COCOA_POWDER_ARTICLE_INHERITANCE_BLOCKED",
     ["actualExactSKUIdentity","independentCurrentCorrectCTRSourceArticle","validatedMethodAndFullPanel"]);
 }
 const base=["actualSKUFinishedProductIdentityVerified","correctProductFSSRClauseReviewed",
   "actualSulphatedAshTestMethodVerified","allCurrentOriginalGazettesAndAmendmentsChecked",
   "actualSampleMatrixAndFullAnalyticalPanelReviewed"];
 const missing=base.filter(k=>e[k]!==true);
 if(typeof e.sulphatedAshPercent!=="number"||!Number.isFinite(e.sulphatedAshPercent)||e.sulphatedAshPercent<0)
  missing.push("sulphatedAshPercentMeasured");
 if(missing.length)return R("SUGAR_ARTICLE_EVIDENCE_HOLD",missing);
 if(e.requestedSourceArticle==="REFINED_WHITE_SUGAR"){
  if(e.finishedFoodLegallyRefinedWhiteSugar!==true||e.sulphatedAshPercent>0.03)
    return R("REFINED_WHITE_SUGAR_SOURCE_CONDITION_NOT_PROVEN",["legalRefinedWhiteSugarIdentityAndAshCondition"]);
  return R("CONDITIONAL_SOURCE_ROW_READY_NOT_LEGAL_PASS",[],"R45_CTR_REFINED_WHITE_SUGAR_LEAD");
 }
 if(e.requestedSourceArticle==="HIGH_ASH_NAMED_SUGARS"){
  if(e.finishedFoodLegallyInNamedHighAshSugarGroup!==true||e.sulphatedAshPercent<=1.0)
    return R("HIGH_ASH_SUGAR_SOURCE_CONDITION_NOT_PROVEN",["legalNamedSugarArticleAndAshCondition"]);
  return R("CONDITIONAL_SOURCE_ROW_READY_NOT_LEGAL_PASS",[],"R45_CTR_HIGH_ASH_SUGAR_LEAD");
 }
 return R("OTHER_SOURCE_ARTICLE_NOT_ADJUDICATED",["currentNamedCTRArticleAndSpecialEndUse"]);
}
