/** PMSV R46 — Audit-only food-standard identity checks. NEVER a finished-product legal approval. */
export const IDS=Object.freeze({"Fruit Cheese":"04-04-1-fruit-cheese","Murabba":"04-04-1-murabba","Frozen Vegetables":"04-04-2-frozen-vegetables"});
export const R46_EXISTING_CTR_CANDIDATE_COUNTS=Object.freeze({fruitCheese:3,murabba:2,frozenVegetables:8});
const result=(status,missing=[])=>({status,missing,identitySourceOnly:true,
 exactCTRArticleAdjudicated:false,fullProductLegalPASS:false,commercialBatchRelease:false,numericCTRSourceAutoApply:false});
const real=(v)=>typeof v==="number"&&Number.isFinite(v);
const common=e=>["actualSKUFormulaAndFSSRRouteVerified","currentOriginalGazetteAndAmendmentsReviewed",
 "AppendixBMicroEvidenceReviewed","labMethodsAndFullApplicableCTREvidenceReviewed"].filter(k=>e[k]!==true);
export function reviewR46Source(id,e={}){
 if(!Object.values(IDS).includes(id))return result("OUTSIDE_R46_CASES");
 const missing=common(e);
 if(id===IDS["Fruit Cheese"]){
  if(!e.preparedFruitSpeciesAndPercentBasisVerified)missing.push("preparedFruitSpeciesAndPercentBasisVerified");
  const permittedException=(e.preparedFruitSpecies==="strawberry"||e.preparedFruitSpecies==="raspberry")&&e.singleFruitSpeciesVerified===true;
  const min=permittedException?25:45;
  if(!real(e.preparedFruitPercent)||e.preparedFruitPercent<min)missing.push("preparedFruitMinimumForActualSpecies");
  if(!real(e.totalSolubleSolidsPercent)||e.totalSolubleSolidsPercent<65)missing.push("fruitCheeseTSSAtLeast65");
  if(e.cookedToSetAndProductTextureVerified!==true)missing.push("cookingSetAndTextureVerified");
  return result(missing.length?"FRUIT_CHEESE_IDENTITY_EVIDENCE_HOLD":"FRUIT_CHEESE_SOURCE_IDENTITY_REVIEW_READY",missing);
 }
 if(id===IDS["Murabba"]){
  if(!["fruit","vegetable","rhizome"].includes(e.primaryMaterialClass))missing.push("actualFruitVegetableRhizomeIdentity");
  if(e.primaryMaterialClass!=="fruit")missing.push("printed55PercentFruitConditionForNonFruitRequiresLegalAdjudication");
  if(e.fruitContentBasisVerified!==true||!real(e.fruitContentPercent)||e.fruitContentPercent<55)missing.push("printedFruitContentAtLeast55AndMethod");
  if(!real(e.totalSolubleSolidsPercent)||e.totalSolubleSolidsPercent<65)missing.push("murabbaTSSAtLeast65");
  if(e.sweetenerImpregnationVerified!==true)missing.push("sweetenerImpregnationAndPreservation");
  if(e.packedInRigidContainer===true&&(!real(e.containerFillWaterCapacityPercent)||e.containerFillWaterCapacityPercent<90))missing.push("rigidContainerFillAtLeast90");
  return result(missing.length?"MURABBA_IDENTITY_EVIDENCE_HOLD":"MURABBA_SOURCE_IDENTITY_REVIEW_READY",missing);
 }
 if(e.actualVegetableSpeciesAndSubclauseReviewed!==true)missing.push("actualVegetableSpeciesAndSpecificStandard");
 if(e.washingAndBlanchingConfirmed!==true)missing.push("washingAndBlanching");
 if(e.thermalCentreMeasuredAfterStabilisation!==true||!real(e.thermalCentreCelsius)||e.thermalCentreCelsius> -18)missing.push("frozenCoreTemperatureAtMostMinus18");
 if(e.peroxidaseTestNegative!==true)missing.push("negativePeroxidaseTest");
 if(e.cannedArticleImported===true||e.OtherVegetablesResidualArticleAutoSelected===true)missing.push("noCannedOrResidualArticleInheritance");
 return result(missing.length?"FROZEN_VEGETABLE_IDENTITY_EVIDENCE_HOLD":"FROZEN_VEGETABLE_SOURCE_IDENTITY_REVIEW_READY",missing);
}
