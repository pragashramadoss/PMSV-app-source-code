/** R63: source-only FDA/FSSAI food identity evidence; no commercial or product legal PASS. */
const FPC=Object.freeze({
 "06-06-8-fermented-soybean-paste":["12.9.1","2.3.57","FERMENTED_SOYBEAN_PASTE_TWO_STYLES"],
 "12-12-10-vegetable-protein-products":["12.10","2.3.59","VEGETABLE_PROTEIN_PRODUCT"]
});
const deny=(status,reason)=>Object.freeze({
 status,reason,sourceResearchOnly:true,actualSKUFormulaVerified:false,
 currentFullGazetteReconciled:false,analyticalMatrixVerified:false,
 finalCTRProductArticleLegallyDecided:false,numericLimitAutoAssigned:false,
 legalProductPASS:false,commercialReleaseAuthorized:false
});
export function reviewR63Source(r,id,claims={}){
 if(!r||r.review_id!=="PMSV_R63_2026_11_05"||
   r.original_catalogue_IDs!==533||r.original_R50_CTR_article_legal_holds!==137||
   r.previous_R62_cumulative_focused_cases!==45||
   r.R63_new_unique_focused_cases!==2||r.R63_cumulative_unique_focused_cases!==47||
   r.original_137_outside_R45_R63_focused_rounds!==90||
   r.new_exact_finished_product_CTR_article_decisions!==0||
   r.new_full_product_legal_approvals!==0||
   r.new_commercial_batch_releases!==0||
   r.original_R29_R50_registers_modified!==false||
   r.product_master_modified!==false||r.numeric_CTR_rules_modified!==false||
   r.live_PMSV_Helper_modified!==false||
   r.PR_2_remains_draft_unmerged!==true)
 return deny("SOURCE_REGISTER_INTEGRITY_HOLD","Original source register or no-PASS controls changed");
 if(typeof id!=="string"||!Object.hasOwn(FPC,id))
 return deny("NOT_IN_R63_SCOPE","Original source catalogue ID not in R63");
 const records=r.product_source_records;
 if(!Array.isArray(records)||records.length!==2||
 new Set(records.map(x=>x?.catalogue_id)).size!==2||
 records.some(x=>!x||!Object.hasOwn(FPC,x.catalogue_id)||
 x.source_FPC!==FPC[x.catalogue_id][0]||
 x.source_FSSR!==FPC[x.catalogue_id][1]||
 x.source_family!==FPC[x.catalogue_id][2]||
 x.numeric_rules_auto_applied!==false||
 x.legal_product_PASS!==false||x.commercial_batch_release_authorized!==false||
 x.actual_CTR_finished_product_food_article_legally_decided!==false))
 return deny("SOURCE_REGISTER_INTEGRITY_HOLD","Product source or legal status invalid");
 const soy=records.find(x=>x.source_family==="FERMENTED_SOYBEAN_PASTE_TWO_STYLES")?.source_specs;
 const veg=records.find(x=>x.source_family==="VEGETABLE_PROTEIN_PRODUCT")?.source_specs;
 const styles=soy?.styles;
 if(!soy||!veg||soy.source_must_have_inactivated_soy_trypsin_inhibitor!==true||
 !Array.isArray(styles)||styles.length!==2||
 JSON.stringify(styles)!==JSON.stringify([
 {style:"soybean_only",moisture_percent_m_m_max:60,total_nitrogen_percent_m_m_min:1.6,amino_nitrogen_percent_m_m_min:0.3},
 {style:"soybean_and_grains",moisture_percent_m_m_max:60,total_nitrogen_percent_m_m_min:0.6,amino_nitrogen_percent_m_m_min:0.12}
 ])||
 soy.container_minimum_fill_percent_of_water_capacity!==90||
 veg.moisture_percent_m_m_max!==10||
 veg.crude_protein_percent_dry_weight_min!==40||
 veg.crude_protein_analytical_multiplier!=="N × 6.25"||
 veg.total_ash_percent_dry_weight_max!==10||
 veg.crude_fibre_percent_dry_weight_max!==10||
 veg.residual_fat_condition!=="compatible with GMP"||
 veg.residual_fat_numeric_max_in_table!==null||
 veg.plant_derived_vegetable_material_not_single_cell_protein!==true)
 return deny("SOURCE_REGISTER_INTEGRITY_HOLD","Two soy-type nitrogen or dry-basis vegetable protein standards altered");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.batchRelease||c.legalPASS||c.autoUseLowerGrainNitrogen||
 c.skipTrypsinInhibitorProof||c.treatAnyBacillusAsSafe||
 c.autoInheritDatePasteNoAdditives||c.autoUseProteinAsIs40||
 c.setResidualFatZero||c.inheritSoyCurdCTR||c.claimAllEvidenceComplete)
 return deny("INDEPENDENT_SKU_PROCESS_LAB_AND_CURRENT_LAW_REVIEW_REQUIRED",
 "Source identity and chemical standards alone never prove actual finished food safety or legal compliance");
 return deny("OFFICIAL_FSSR_2_3_57_2_3_59_SOURCE__SKU_CTR_HOLD",
 "Exact actual formula, process, methods, current Gazette/CTR and independent legal assessment absent");
}
