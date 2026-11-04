/** R57: named source standard is not a legal SKU pass or CTR article decision. */
const ID="formulated-supplements-children";
const hold=(status,reason)=>Object.freeze({
 status,reason,sourceFSSRClause:"2.4.11(4)",
 sourceClauseIdentifiedOnly:true,
 actualSkuClassificationConfirmed:false,
 currentProteinQualityAdjudicated:false,
 currentNutrientToleranceAdjudicated:false,
 currentCTRFinishedProductArticleAdjudicated:false,
 legalProductPASS:false,batchReleaseAuthorized:false,
 numericStandardAutoApplied:false,liveHelperUpdated:false
});
export function reviewChildSupplementSource(r,catalogueID,claims={}){
 if(!r||r.review_id!=="PMSV_R57_2026_11_04"||
  r.catalogue_ids_preserved!==533||
  r.original_R29_R50_product_CTR_article_holds!==137||
  r.original_R51_FSSR_blank_rows!==33||
  r.new_identifiable_FSSR_clause_source_count!==1||
  r.original_R51_source_unchanged!==true||
  r.named_source_fssr_clause!=="2.4.11(4)"||
  r.whole_product_legal_PASS!==false||
  r.operative_numeric_rules_modified!==false||
  r.live_PMSV_helper_modified!==false)
   return hold("SOURCE_REGISTER_INTEGRITY_HOLD","R57 evidence and preservation invariants not met");
 if(catalogueID!==ID)return hold("NOT_IN_R57_SCOPE","This case was not reviewed in R57");
 if(r.source_fpc!=="13.2"||r.historical_fssr_blank!==""||
  r.source_age_scope_months?.greater_than!==24||
  r.source_age_scope_months?.less_than_or_equal_to!==36||
  r.actual_SKU_matches_standard_verified!==false||
  r.not_proprietary_license_route_in_official_FoSCoS_FAQ_Q82!==true||
  r.product_FSSR_legally_adjudicated!==false||
  r.current_complete_CTR_panel_verified!==false||
  r.protein_condition?.amended_2023_PDCAAS_min!==90||
  r.protein_condition?.legacy_70_percent_and_PER_test_must_not_auto_apply!==true||
  r.protein_condition?.operative_protein_gate_enabled!==false||
  r.nutrient_variation?.legacy_2018_symmetric_plus_minus_10_percent_superseded!==true||
  r.nutrient_variation?.automatic_pass_for_nutrient_results!==false||
  r.evidence_sources?.length<5||
  r.selected_2024_source_parameter_examples?.some(x=>x.comparison_authorized!==false)||
  r.numeric_limits_auto_applied!==false||r.batch_release_authorized!==false)
  return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Modified or unqualified product evidence source");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.release||c.productPASS||c.legalFSSR||c.legalCTR||c.autoUse2018Protein||
   c.autoUseSymmetric10Percent||c.autoApplyNutrients||c.proprietaryClass||
   c.infantFoodSixToTwentyFour||c.allEvidencePresent)
  return hold("INDEPENDENT_CURRENT_SKU_REGULATORY_ASSESSMENT_REQUIRED",
  "The named clause cannot certify a marketed formulation or revive superseded criteria");
 return hold("NAMED_FSSR_SOURCE_ANCHORED__ACTUAL_SKU_EVIDENCE_HOLD",
  "2.4.11(4) identified for catalogue name; current full law, exact SKU and laboratory evidence absent");
}
