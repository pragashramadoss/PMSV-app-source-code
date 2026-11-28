/** PMSV R48 audit-only guards: source requirements never equal legal finished-product compliance. */
export const IDS=Object.freeze({fruits:"04-04-1-frozen-fruits-fruit-products",tamarind:"04-04-1-seedless-tamarind",potatoes:"04-04-2-quick-frozen-fried-potatoes"});
const base=["actualSKUAndFSSRIdentityConfirmed","currentOriginalGazetteAmendmentsReviewed","fullRelevantCTRArticlePanelAndAnalyticalMethodsReviewed","AppendixBAdditivesAndLabellingReviewed"];
const safe=(status,missing=[])=>({status,missing,sourceIdentityReadinessOnly:true,fullProductLegalPASS:false,commercialRelease:false,exactCTRArticleAdjudicated:false,autoApplyNumericCTR:false});
const num=x=>typeof x==="number"&&Number.isFinite(x);
const limit=(missing,e,field,max,why)=>{if(!num(e[field])||e[field]<0||e[field]>max)missing.push(why)};
export function reviewR48(id,e={}){
 if(!Object.values(IDS).includes(id))return safe("OUT_OF_SCOPE");
 const m=base.filter(k=>e[k]!==true);
 if(id===IDS.fruits){
  if(!e.actualFruitSpeciesConfirmed||e.washedCleanSoundFruitConfirmed!==true)m.push("actualFruitSpeciesAndSoundWashedProduct");
  if(!["BLOCK","IQF"].includes(e.freezingStyle))m.push("actualFrozenFruitStyle");
  if(e.blanchingRequired!==true&&e.blanchingRequired!==false)m.push("documentBlanchingIfRequired");
  if(e.blanchingRequired===true&&e.blanchingDone!==true)m.push("blanchingActualExecution");
  if(e.thermalCentreMeasuredAfterStabilisation!==true||!num(e.thermalCentreC)||e.thermalCentreC> -18)m.push("stabilizedCoreMinus18OrColder");
  if(e.milkSolidsPresent!==true&&e.milkSolidsPresent!==false)m.push("milkSolidsPresenceConfirmed");
  if(e.milkSolidsPresent===true&&e.milkAllergenDeclarationVerified!==true)m.push("milkAllergenDeclaration");
  return safe(m.length?"FROZEN_FRUIT_SOURCE_EVIDENCE_HOLD":"FROZEN_FRUIT_SOURCE_REVIEW_READY",m);
 }
 if(id===IDS.tamarind){
  if(e.TamarindusIndicaAndOuterSeedRemovalVerified!==true)m.push("correctTamarindusIndicaDeSeededIdentity");
  if(e.freeOfInfestationMouldAndProhibitedForeignMatter!==true)m.push("foreignMatterMouldAndHygiene");
  if(e.totalAshAIAAndFibreDryBasisMethodVerified!==true)m.push("dryBasisAnalyticalMethod");
  limit(m,e,"moisturePct",20,"moistureAtMost20");
  limit(m,e,"organicExtraneousPct",5,"organicExtraneousAtMost5");
  limit(m,e,"totalAshDryBasisPct",6,"totalAshDryBasisAtMost6");
  limit(m,e,"acidInsolubleAshDryBasisPct",1,"acidInsolubleAshDryBasisAtMost1");
  limit(m,e,"crudeFibreDryBasisPct",9,"crudeFibreDryBasisAtMost9");
  limit(m,e,"tamarindSeedsPct",0.5,"residualSeedsAtMost0_5");
  if(e.borrowTamarindPureeConcentrateStandard===true)m.push("doNotBorrowPulpConcentrateStandard");
  return safe(m.length?"TAMARIND_SOURCE_EVIDENCE_HOLD":"TAMARIND_SOURCE_REVIEW_READY",m);
 }
 const allowed=["Solanum tuberosum","Solanum andigena","Ipomoea batatas"];
 if(!allowed.includes(e.species))m.push("actualPotatoOrSweetPotatoSpecies");
 if(!["FRIED_IN_PERMITTED_OIL","PRECOOKED_IN_PERMITTED_OIL","WATER_BLANCHED"].includes(e.process))m.push("actualPermittedPreFreezeProcess");
 if(e.process!=="WATER_BLANCHED"&&e.permittedFatOrOilVerified!==true)m.push("edibleOilFatLegalSource");
 if(e.thermalCentreMeasuredAfterStabilisation!==true||!num(e.thermalCentreC)||e.thermalCentreC> -18)m.push("stabilizedCoreMinus18OrColder");
 limit(m,e,"moisturePct",78,"moistureAtMost78");
 limit(m,e,"extractedOilFFAasOleicPct",1.5,"extractedOilFFAasOleicAtMost1_5");
 limit(m,e,"burntPiecesMassPct",0.5,"burntPiecesAtMost0_5");
 if(!["STRAIGHT","CRINKLE","OTHER"].includes(e.stripStyle))m.push("stripStyleIdentified");
 if(e.stripStyle==="OTHER"&&e.otherStyleLabelVerified!==true)m.push("distinctOtherStyleLabel");
 if(e.cutOnFourSides===true&&(!num(e.frozenCrossSectionMm)||e.frozenCrossSectionMm<4))m.push("crossSectionAtLeast4mmWhenCutFourSides");
 if(e.cutOnFourSides!==true&&e.cutOnFourSides!==false)m.push("fourSideCutStatusConfirmed");
 if(e.borrowRawPotatoOrCannedVegetableCTRArticle===true)m.push("wrongRawOrCannedCTRArticleInheritance");
 return safe(m.length?"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD":"FROZEN_POTATO_SOURCE_REVIEW_READY",m);
}
