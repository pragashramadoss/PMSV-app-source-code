/** PMSV R47 source-only style, caseinate and misleading claim guard. No batch release permitted. */
export const COCONUT_SOURCE_STYLES=Object.freeze({
  "04-04-1-coconut-milk-non-dairy": [
    {
      "style": "LIGHT_COCONUT_MILK",
      "moisture_max_pct": 93.4,
      "total_solids_min_pct": 6.6,
      "total_solids_max_pct": 12.6,
      "solids_nonfat_min_pct": 1.6,
      "fat_min_pct": 5,
      "pH_min": 5.9
    },
    {
      "style": "COCONUT_MILK",
      "moisture_max_pct": 87.3,
      "total_solids_min_pct": 12.7,
      "total_solids_max_pct": 25.3,
      "solids_nonfat_min_pct": 2.7,
      "fat_min_pct": 10,
      "pH_min": 5.9
    }
  ],
  "04-04-1-coconut-cream-non-dairy": [
    {
      "style": "COCONUT_CREAM",
      "moisture_max_pct": 74.6,
      "total_solids_min_pct": 25.4,
      "total_solids_max_pct": 37.3,
      "solids_nonfat_min_pct": 5.4,
      "fat_min_pct": 20,
      "pH_min": 5.9
    },
    {
      "style": "COCONUT_CREAM_CONCENTRATE",
      "moisture_max_pct": 62.6,
      "total_solids_min_pct": 37.4,
      "total_solids_max_pct": null,
      "solids_nonfat_min_pct": 8.4,
      "fat_min_pct": 29,
      "pH_min": 5.9
    }
  ],
  "04-04-1-coconut-milk-powder": [
    {
      "style": "COCONUT_MILK_POWDER",
      "moisture_max_pct": 2.5,
      "fat_dry_min_pct": 60,
      "FFA_extracted_fat_as_lauric_acid_max_pct": 0.2,
      "bulk_density_min_g_ml": 0.3,
      "bulk_density_max_g_ml": 0.45,
      "no_added_colours_or_flavouring": true
    }
  ]
});
export const ORIGINAL_COCONUT_IDS=Object.freeze(["04-04-1-coconut-milk-non-dairy","04-04-1-coconut-cream-non-dairy","04-04-1-coconut-milk-powder"]);
const all=(status,missing=[],extra={})=>({status,missing,sourceStyleReviewOnly:true,exactCTRArticleLegallyAdjudicated:false,fullProductLegalPass:false,commercialBatchRelease:false,numericLimitsAutoApplied:false,...extra});
const valid=x=>typeof x==="number"&&Number.isFinite(x);
export function reviewCoconutSourceStyle(catalogueId,e={}){
 const styles=COCONUT_SOURCE_STYLES[catalogueId];
 if(!styles)return all("OUTSIDE_R47_SCOPE");
 const missing=["actualSKUFormulaAndIngredientSupplierDocumentsVerified","currentFSSRAndOriginalGazetteReviewed",
 "analyticalMethodAndFullLabEvidenceReviewed","currentLegalCTRProductArticleAndPanelReviewed",
 "fullActualArtworkClaimsAndAllergenLabellingReviewed"].filter(k=>e[k]!==true);
 if(e.sodiumCaseinatePresent!==true&&e.sodiumCaseinatePresent!==false)missing.push("actualSodiumCaseinatePresenceEstablished");
 if(e.sodiumCaseinatePresent===true){
  if(e.milkAllergenLabelVerified!==true)missing.push("milkAllergenContainsMilkDeclarationVerified");
  if(e.claimsMilkFree===true||e.claimsVegan===true)return all("MILK_DERIVED_CASEINATE_CLAIM_CONTRADICTION",["cannotClaimMilkFreeOrVeganWithMilkCaseinate"]);
 }
 if(e.claimsVegan===true&&(e.veganLogoEndorsementVerified!==true||e.animalOriginFreeIncludingProcessingAidsVerified!==true))
  missing.push("veganClaimEndorsementAndAnimalOriginEvidence");
 const s=styles.find(x=>x.style===e.actualStyle);
 if(!s)return all("ACTUAL_PRODUCT_STYLE_UNCONFIRMED",[...missing,"exactCoconutProductStyle"]);
 if(s.style==="COCONUT_MILK_POWDER"){
  if(!valid(e.moisturePercent)||e.moisturePercent>s.moisture_max_pct||e.moisturePercent<0)missing.push("powderMoistureAtMost2_5");
  if(!valid(e.fatDryBasisPercent)||e.fatDryBasisPercent<s.fat_dry_min_pct)missing.push("powderDryBasisFatAtLeast60");
  if(!valid(e.FFAExtractedFatLauricAcidPercent)||e.FFAExtractedFatLauricAcidPercent>s.FFA_extracted_fat_as_lauric_acid_max_pct)missing.push("powderFFALauricAcidAtMost0_2");
  if(!valid(e.bulkDensityGml)||e.bulkDensityGml<s.bulk_density_min_g_ml||e.bulkDensityGml>s.bulk_density_max_g_ml)missing.push("powderBulkDensity0_30To0_45");
  if(e.noAddedColourOrFlavourVerified!==true)missing.push("powderNoColourOrFlavourAdded");
 }else{
  if(!valid(e.moisturePercent)||e.moisturePercent>s.moisture_max_pct||e.moisturePercent<0)missing.push("liquidMoistureSourceLimit");
  if(!valid(e.totalSolidsPercent)||e.totalSolidsPercent<s.total_solids_min_pct||
     (s.total_solids_max_pct!==null&&e.totalSolidsPercent>s.total_solids_max_pct))missing.push("liquidTotalSolidsStyleRange");
  if(!valid(e.solidsNotFatPercent)||e.solidsNotFatPercent<s.solids_nonfat_min_pct)missing.push("liquidSolidsNotFatMinimum");
  if(!valid(e.fatWeightPercent)||e.fatWeightPercent<s.fat_min_pct)missing.push("liquidFatAsSoldMinimum");
  if(!valid(e.pH)||e.pH<s.pH_min)missing.push("liquidPHAtLeast5_9");
  if(e.hermeticallySealed===true&&(!valid(e.hermeticFillPercent)||e.hermeticFillPercent<90))missing.push("hermeticContainerFillAtLeast90");
 }
 return all(missing.length?"COCONUT_SOURCE_STYLE_EVIDENCE_HOLD":"COCONUT_SOURCE_STYLE_REVIEW_READY",missing,
 {allowedStyle:s.style,legalProductApprovalNeverImplied:true});
}
