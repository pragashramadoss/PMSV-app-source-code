/** PMSV R64 — source-spec integrity only. This function can NEVER approve a product or release a lot. */
const EXPECTED=Object.freeze({
 "04-04-1-vanilla-pods":["04.1.1.1","2.3.50","whole_pods_may_be_split",30,null],
 "04-04-1-cut-vanilla":["04.1.1.1","2.3.50","deliberately_cut_or_broken_pods",30,null],
 "04-04-1-vanilla-powder":["04.1.2.2","2.3.50(1)(c)","ground_compliant_pods_or_cut_vanilla",20,1.25]
});
const hold=(status,reason)=>Object.freeze({
 status,reason,sourceEvidenceOnly:true,
 actualManufacturerProductVerified:false,independentCurrentLegalReviewComplete:false,
 validatedActualLotLabResultsVerified:false,exactFinishedCTRArticleLegallyDecided:false,
 operativeNumericRuleAssigned:false,legalProductPASS:false,commercialBatchReleaseAuthorized:false
});
export function reviewR64VanillaSource(register,id,claims={}){
 if(!register||register.review_id!=="PMSV_R64_2026_11_11"||
   register.original_catalogue_ids!==533||register.original_R50_CTR_article_legal_holds!==137||
   register.previous_R63_unique_focused_cases!==47||register.R64_new_distinct_focused_cases!==3||
   register.R64_cumulative_unique_focused_cases!==50||
   register.original_cases_outside_R45_R64_focused_rounds!==87||
   register.new_exact_finished_product_CTR_article_decisions!==0||
   register.new_full_product_legal_approvals!==0||register.new_commercial_batch_releases!==0||
   register.independent_Ayurveda_raw_ingredient_source_gaps!==14||
   register.original_R29_R50_registers_modified!==false||
   register.product_master_modified!==false||
   register.live_PMSV_Helper_modified!==false||
   register.operative_numeric_CTR_rules_modified!==false||
   register.PR_2_remains_draft_unmerged!==true)
  return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Audit counts or frozen non-release invariants are inconsistent");
 if(typeof id!=="string"||!Object.hasOwn(EXPECTED,id))
  return hold("NOT_IN_R64_SCOPE","Product is not among the three original vanilla cases");
 const source=register.official_sources?.[0];
 if(!source||source.url!=="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf"||
   JSON.stringify(source.pdf_pages_zero_based_visually_checked)!==JSON.stringify([74,75,76])||
   source.pdf_page_images_actually_inspected!==true||
   source.original_Gazette_and_all_current_amendments_legally_reconciled!==false)
  return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Primary FSSAI provenance or pending legal review changed");
 const common=register.source_spec_common;
 if(!common||common.added_colour_prohibited!==true||
   common.CTR_2011_and_applicable_amendments_separately_required!==true||
   common.Appendix_B_microbiological_requirement_separately_required!==true||
   common.food_additives_only_if_permitted_by_applicable_appendix_A!==true)
  return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Common product safety source requirements lost");
 const rows=register.product_source_records;
 if(!Array.isArray(rows)||rows.length!==3||new Set(rows.map(x=>x?.catalogue_id)).size!==3)
  return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Expected exactly three distinct original source identities");
 for(const row of rows){
  const e=EXPECTED[row?.catalogue_id];
  if(!e||row.source_FPC!==e[0]||row.source_FSSR!==e[1]||
    row.style!==e[2]||row.moisture_percent_max!==e[3]||
    row.powder_sieve_aperture_mm!==e[4]||
    row.vanillin_percent_wet_basis_min!==2||
    row.total_ash_percent_dry_basis_max!==5||
    row.acid_insoluble_ash_percent_dry_basis_max!==1||
    row.natural_constituents_may_not_be_artificially_changed!==true||
    row.actual_manufacturer_SKU_species_authenticity_processing_and_form_verified!==false||
    row.actual_method_wet_dry_basis_sampling_laboratory_results_verified!==false||
    row.whole_product_current_Gazette_CTR_additives_microbial_label_review_complete!==false||
    row.finished_product_CTR_article_legally_decided!==false||
    row.numerical_rules_auto_applied!==false||row.legal_product_PASS!==false||
    row.commercial_release_authorized!==false)
   return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Source identity, analytical reporting basis or non-approval status changed");
 }
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.legalPASS||c.releaseLot||c.autoSelectCTRArticle||c.treatFlavouredPowderAsVanilla||
    c.use30MoistureForPowder||c.useDryBasisForVanillin||c.useWetBasisForAsh||
    c.skipPowderSieve||c.autoTreatAsDriedSpice||c.useHistoricalPrefixAsFPC||
    c.assume2026LegalReviewComplete||c.assumeNoMicrobiologyNeeded)
  return hold("PRODUCT_SPECIES_FORM_METHOD_CTR_AND_ACTUAL_LAB_REVIEW_REQUIRED",
  "A FSSR source definition cannot substitute for SKU identity, legal source article, analytical evidence or independent product assessment");
 return hold("FSSR_VANILLA_2_3_50_SOURCE__SKU_CTR_HOLD",
  "Official source clauses verified; actual full effective-law, contaminant and laboratory assessment still required");
}
