/** PMSV R55: source-only mouth-freshener categorization; never an automatic legal product PASS. */
const EXPECTED=Object.freeze({
 "05-05-2-dried-fruits-vegetables-nut-based-mouth-fresheners":"05.2.4.1",
 "05-05-2-spice-based-mouth-fresheners":"05.2.4.2",
 "05-05-2-other-traditional-mouth-fresheners-not-covered-under-5-2-4-1-and-5-2-4-2":"05.2.4.3"
});
function fail(status,reason,sourceCategory=null){
 return Object.freeze({
  status,reason,sourceCategory,sourceClassificationOnly:true,
  largestMajorIngredientLegallyEstablished:false,
  actualManufacturerLicenceVerified:false,
  fpc52AdditivesLegallyVerifiedForSKU:false,
  finishedProductCTRArticleLegallyDecided:false,
  panMasalaIdentityAutomaticallyAssigned:false,
  rawIngredientMRLTransferredToMixture:false,
  legalProductPASS:false,commercialBatchReleaseAuthorized:false
 });
}
export function reviewMouthFreshenerSource(register,catalogueID,claims={}){
 if(!register||!Array.isArray(register.records)||
  register.review_id!=="PMSV_R55_2026_11_04"||
  register.catalogue_total_unchanged!==533||
  register.original_exact_CTR_finished_product_article_holds_open!==137||
  register.original_mouth_freshener_source_rows!==3||
  register.source_classification_checks_completed!==3||
  register.new_exact_CTR_product_article_decisions_closed!==0||
  register.legal_approved_product_count!==0||
  register.numeric_CTR_rules_changed!==false||
  register.deployed_PMSV_helper_changed!==false||
  register.original_R29_R50_R51_registers_unmodified!==true
 )return fail("SOURCE_REGISTER_INTEGRITY_HOLD","R55 evidence-register totals or non-approval safeguards are invalid");
 if(typeof catalogueID!=="string"||!Object.hasOwn(EXPECTED,catalogueID))
  return fail("NOT_IN_R55_SCOPE","No original 5.2.4.x catalogue identity matched");
 if(register.records.length!==3||
 new Set(register.records.map(x=>x?.catalogue_id)).size!==3 ||
 register.records.some(x=>!x||!Object.hasOwn(EXPECTED,x.catalogue_id)||
   x.historical_R29_fcs!==EXPECTED[x.catalogue_id]||
   x.historical_R29_fssr!==""||
   x.compliance_pass!==false||
   x.commercial_release_authorized!==false||
   x.auto_assign_raw_ingredient_MRL_to_mixed_finished_food!==false||
   x.auto_assign_FPC_5_2_additive_permission!==false||
   x.actual_largest_major_ingredient_identified!==false||
   x.current_effective_amendment_and_original_Gazette_review_complete!==false||
   x.exact_finished_product_CTR_article_and_applicable_panel_legally_decided!==false||
   x.exact_finished_product_FSSR_identity_standard_legally_decided!==false||
   !Array.isArray(x.mandatory_evidence_for_largest_major_ingredient)||
   x.mandatory_evidence_for_largest_major_ingredient.length<3))
   return fail("SOURCE_REGISTER_INTEGRITY_HOLD","Missing, duplicate, modified or unsafe R55 source entry");
 const row=register.records.find(x=>x.catalogue_id===catalogueID);
 if(!row)return fail("SOURCE_REGISTER_INTEGRITY_HOLD","Expected catalogue row missing");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.legalProductPASS||c.batchRelease||c.panMasalaAutoAssign||
    c.autoApplyMajorIngredientMRL||c.autoApplyFPC52Additives||
    c.largestIngredientConfirmed||c.allEvidenceSubmitted)
  return fail("INDEPENDENT_ACTUAL_SKU_REGULATORY_ASSESSMENT_REQUIRED",
  "Source categories and 2021 horizontal parameters are not a legal whole-product signoff",
  row.historical_R29_fcs);
 return fail("SIGNED_2021_DIRECTION_SOURCE_ONLY__SKU_EVIDENCE_HOLD",
  "Category 5.2.4.x source is anchored; full recipe, major ingredient, additives, current law and lab data are pending",
  row.historical_R29_fcs);
}
