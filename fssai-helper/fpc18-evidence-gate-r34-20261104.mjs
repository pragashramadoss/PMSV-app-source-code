/** R34 FPC18 evidence router, never product compliance / lot release.
 * Official source: Indian Sweets and Snacks Section 16(5) order, 19 July 2021,
 * paragraphs 3, 4(b), 4(f), 4(g), 4(h), 4(i), Annexures I and II.
 * Food Standards CTR Version IX (03.02.2026), current to 4 Nov 2026.
 */
export const EXPECTED_FPC18_ADDITIVE_ROUTES = Object.freeze({
  "18.1.1.1":["1.7"], "18.1.1.2":["1.7"], "18.1.1.3":["1.7"],
  "18.1.1.4":["1.7"], "18.1.2.1":["6.5"], "18.1.2.2":["6.5"],
  "18.1.2.3":["6.5"], "18.1.3":["15.2"], "18.1.4":["5.2.3","15.1"],
  "18.1.5":["4.1.2.9","4.2.2.6"], "18.2.1":["15.1","6.3","6.7"],
  "18.2.2":["15.1"]
});
export const FPC18_FOOD_NOT_SPECIFIED_METALS = Object.freeze({
  Lead:2.5, Copper:30, Arsenic:1.1, Tin:250, Cadmium:1.5, Mercury:1.0
});
export const REQUIRED_EVIDENCE_FIELDS = Object.freeze([
  "skuIdentityVerified",
  "fpc18LicenseCategoryVerified",
  "currentlyOperativeFpc18DirectionConfirmed",
  "recipeAndIngredientSpeciesVerified",
  "actualProcessingAndPackagingVerified",
  "annexureIIAdditiveSpecificPermissionsReviewed",
  "appendixBBaseMicrobiologySelected",
  "ingredientAflatoxinDONAndNOTSReviewed",
  "pesticideSpecificMRLAndResidueDefinitionsReviewed",
  "correctSixMetalSourceAndSamplingBasisVerified",
  "fullApplicableToxinsResiduesAndMetalsPanelSelected",
  "originalGazettesAndAmendmentsReconciled"
]);
const result = (status,why,more={}) => ({
  status, reason:why, routeAssessmentOnly:true, canCompareNumericLimits:false,
  currentLawCompletelyVerified:false, productLegallyApproved:false,
  lotReleaseAuthorized:false, productionRuleChangeAuthorized:false,
  ...more
});
const validDate = s => {
  if(typeof s!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const v=new Date(s+"T00:00:00Z");
  return Number.isFinite(v.getTime())&&v.toISOString().slice(0,10)===s;
};
const sameArray = (a,b) => Array.isArray(a)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
const isObject = v => v!==null&&typeof v==="object"&&!Array.isArray(v);
function trustedRegister(register){
  if(!isObject(register)||register.review!=="PMSV R34 - FPC18 complete directive source routing and evidence gates"||
     register.original_catalogue_size!==533||register.original_r29_article_applicability_gaps!==137||
     register.FPC18_records!==12||register.full_product_approvals!==0||
     register.full_CTR_panels_verified!==0||register.new_product_article_adjudications!==0||
     register.original_product_master_and_live_engine_modified!==false ||
     !Array.isArray(register.products)||register.products.length!==12) return false;
  const rows=register.directed_contaminant_article_rows;
  if(!Array.isArray(rows)||rows.length!==6) return false;
  const known=Object.entries(FPC18_FOOD_NOT_SPECIFIED_METALS);
  const unique=new Set();
  for(const r of rows){
    if(!isObject(r)||!(r.analyte in FPC18_FOOD_NOT_SPECIFIED_METALS)||
       r.source_article!=="Foods not specified"||r.limit!==FPC18_FOOD_NOT_SPECIFIED_METALS[r.analyte]||
       r.auto_apply_to_catalogue!==false||r.full_product_approval!==false)return false;
    unique.add(r.analyte);
  }
  if(unique.size!==known.length)return false;
  const codes=new Set();
  for(const product of register.products){
    if(!isObject(product)||typeof product.catalog_id!=="string"||typeof product.fpc_code!=="string"||
       !Object.hasOwn(EXPECTED_FPC18_ADDITIVE_ROUTES,product.fpc_code)||
       !sameArray(product.additive_mapped_FSSR_categories,EXPECTED_FPC18_ADDITIVE_ROUTES[product.fpc_code])||
       product.additive_mapping_is_not_blanket_additive_permission!==true||
       product.fpc18_eligibility_adjudicated!==false||
       product.full_current_CTR_panel_complete!==false||
       product.product_fully_legally_verified!==false||
       product.auto_apply_numeric_limits!==false||
       product.commercial_lot_release_authorized!==false||
       codes.has(product.fpc_code))return false;
    codes.add(product.fpc_code);
  }
  return codes.size===Object.keys(EXPECTED_FPC18_ADDITIVE_ROUTES).length;
}
/** Inputs use explicit booleans, never application guesses. All outputs are NOT-PASS. */
export function assessFpc18SourceRoute(register, input={}){
  if(!trustedRegister(register))return result("SOURCE_INTEGRITY_HOLD","Official source register or expected FPC18 mappings invalid");
  if(!isObject(input)||!validDate(input.assessmentDate))
    return result("EVIDENCE_HOLD","Valid assessment date required");
  if(input.assessmentDate>="2026-12-01")
    return result("AMENDMENT_REVALIDATION_HOLD","Later-effective CTR amendment requires independently updated current-law source review");
  const match=register.products.find(p=>p.catalog_id===input.catalogId);
  if(!match)return result("UNKNOWN_CATALOG_ID","No matching original FPC18 catalogue ID");
  const route={
    catalogId:match.catalog_id,
    fpcCode:match.fpc_code,
    annexureIIAdditiveReferenceCategories:[...match.additive_mapped_FSSR_categories],
    contaminantRouteSourceArticle:"Foods not specified",
    sourceRowsNotApplied:register.directed_contaminant_article_rows.map(r=>({
      analyte:r.analyte,limit:r.limit,sourceArticle:r.source_article,unit:r.unit
    })),
    ingredientMicrobiologyRoute:"2021 Section 16(5) direction clause 4(g), base product",
    ingredientToxinRoute:"2021 Section 16(5) direction clause 4(h), base product",
    evidenceRequired:[...match.required_individual_evidence],
    sourceDocument:register.original_FPC18_order_url,
    currentCTRDocument:register.ctr_version_ix_url
  };
  if(input.actualFpcCode!==match.fpc_code)
    return result("CATEGORY_MISMATCH_HOLD","Verified actual FoSCoS code must exactly match requested catalogue FPC", {route});
  if(input.standardizedMappedUnderFPC01to14===true)
    return result("FPC18_NOT_APPLICABLE","2021 direction paragraph 3 excludes products already standardized/mapped in categories 01-14; review correct standardized route instead",{route});
  if(input.standardizedMappedUnderFPC01to14!==false)
    return result("EVIDENCE_HOLD","Establish whether standardized category 01-14 governs before using FPC18", {route});
  const missing=REQUIRED_EVIDENCE_FIELDS.filter(k=>input[k]!==true);
  if(missing.length)
    return result("EVIDENCE_HOLD","Actual SKU/direction/ingredients/additives/microbiology/CTR scope evidence incomplete",
      {missingEvidence:missing,route});
  return result("SOURCE_ROUTE_REVIEW_READY","Evidence fields reported complete; independent actual-source and analytical/legal sign-off still required",
    {missingEvidence:[],route});
}
/** Application MUST never call this evidence router a product PASS. */
export function sourceRouteMayApproveProduct(){
  return false;
}
