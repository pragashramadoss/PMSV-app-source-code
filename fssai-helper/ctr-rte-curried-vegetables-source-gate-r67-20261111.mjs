const hold=(status)=>Object.freeze({status,sourceOnly:true,legalProductPASS:false,commercialBatchRelease:false,numericLimitAutoApplied:false});
export function checkR67(r,claims={}){
 const p=r?.record;
 if(!r||r.review_id!=="PMSV_R67_2026_11_11"||
 r.original_catalogue_count!==533||r.original_R50_CTR_article_holds!==137||
 r.previous_R66_unique_focused_cases!==63||r.new_unique_focused_cases!==1||
 r.cumulative_unique_focused_cases!==64||r.outside_selected_focused_rounds!==73||
 r.new_CTR_article_decisions_closed!==0||r.new_legal_product_approvals!==0||
 r.new_commercial_releases!==0||r.original_R29_R50_registers_modified!==false||
 r.product_master_modified!==false||r.live_PMSV_Helper_modified!==false||
 r.operative_numeric_CTR_rules_modified!==false||r.PR_2_remains_draft_unmerged!==true||
 JSON.stringify(r.source_pdf_pages_zero_based_visually_checked)!=="[9,10]"||
 !p||p.catalogue_id!=="04-04-2-thermally-processed-curried-vegetables-ready-to-eat-vegetables"||
 p.source_FPC!=="04.2.2.8"||p.source_FSSR!=="2.3.4"||
 p.original_R50_priority!=="P2"||
 p.source_rigid_container_fill_min_percent_of_water_capacity!==90||
 p.source_rigid_container_water_capacity_measurement_temp_c!==20||
 p.source_specific_TSS_minimum_printed_in_2_3_4!==null||
 p.source_specific_drained_weight_minimum_printed_in_2_3_4!==null||
 p.source_specific_pH_threshold_printed_in_2_3_4!==null||
 p.applicable_appendix_B_microbiology_required!==true||
 !Array.isArray(p.source_optional_ingredients)||!p.source_optional_ingredients.includes("milk fat")||
 p.permitted_additives_must_be_checked_under_regulations_and_appendices!==true||
 p.actual_SKU_recipe_thermal_validation_pack_and_lab_reports_received!==false||
 p.effective_Gazette_and_current_CTR_article_legally_reconciled!==false||
 p.complete_additives_micro_contaminants_allergens_labelling_packaging_reviewed!==false||
 p.numeric_limits_auto_applied!==false||p.legal_product_PASS!==false||
 p.commercial_release_authorized!==false)return hold("SOURCE_INTEGRITY_HOLD");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims?claims:{} )?claims:{};
 if(["borrowSoupTSS5","borrowTomatoSoupTSS7","borrowVegetableDrainedWeight",
 "assumeCommercialSterility","assumeMilkFree","autoSelectRawVegetableCTR",
 "assumeAllCurrentGazettesReviewed","legalPASS","releaseLot","applyNumericCTR"].some(k=>c[k]===true))
 return hold("INDEPENDENT_ACTUAL_SKU_LEGAL_LAB_REVIEW_REQUIRED");
 return hold("OFFICIAL_FSSR_2_3_4_SOURCE__CTR_PRODUCT_HOLD");
}
