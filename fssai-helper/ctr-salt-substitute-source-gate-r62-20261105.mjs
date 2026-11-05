/** R62: Salt-substitute source-law guard. Always fails closed for real SKU compliance. */
const ID="12-12-1-salt-substitutes";
const blocked=(status,reason)=>Object.freeze({
 status,reason,sourceOnly:true,
 productLicensedAndFormulaVerified:false,
 actualAnalyticalSodiumAndCationsVerified:false,
 applicableCurrentLawFullyReconciled:false,
 exactFinishedProductCTRArticleApproved:false,
 numericSourceLimitsAutoApplied:false,
 legalProductPASS:false,batchReleaseAuthorized:false,
 liveEngineModified:false
});
export function reviewR62SaltSubstitute(s,id,claims={}){
 if(!s||s.review_id!=="PMSV_R62_2026_11_05"||
    s.original_catalogue_id_count!==533||
    s.original_product_CTR_article_holds!==137||
    s.previous_selected_focused_IDs!==44||
    s.new_focused_catalogue_IDs!==1||
    s.cumulative_selected_focused_IDs!==45||
    s.outside_selected_focused_IDs!==92||
    s.new_exact_CTR_product_article_decisions_closed!==0||
    s.full_product_legal_PASS!==false||
    s.commercial_release_authorized!==false||
    s.original_R29_R50_unchanged!==true||
    s.product_master_unchanged!==true||
    s.operative_numeric_CTR_rules_unchanged!==true||
    s.live_PMSV_Helper_unchanged!==true||
    s.PR_2_stays_draft_unmerged!==true)
  return blocked("SOURCE_REGISTER_INTEGRITY_HOLD","R62 baseline/source integrity or no-PASS invariant failed");
 if(id!==ID)return blocked("NOT_IN_R62_SCOPE","Catalogue ID not reviewed");
 const p=s.source_product||{};
 const cs=s.specified_chemical_source_groups||[];
 const mix=s.other_source_conditions||{};
 const food=s.separate_low_sodium_food_source_limits||{};
 if(p.id!==ID||p.FPC!=="12.1.2"||p.FSSR!=="2.9.30(6)"||
    p.R50_priority!=="P3"||
    cs.length!==4||
    cs[0].source_clause!=="2.9.30(6)(1)(a)"||
    cs[0].phosphorus_percent_m_m_max!==4||
    cs[0].ammonium_ion_percent_m_m_max!==3||
    cs[1].source_clause!=="2.9.30(6)(1)(b)"||
    cs[1].magnesium_percent_of_K_Ca_NH4_cation_sum_max!==20||
    cs[1].not_twenty_percent_of_whole_mixture!==true||
    cs[1].phosphorus_percent_m_m_max!==4||
    cs[2].source_clause!=="2.9.30(6)(1)(c)"||
    cs[2].choline_percent_m_m_max!==3||
    cs[3].source_clause!=="2.9.30(6)(1)(d)"||
    cs[3].use_condition!=="GMP"||
    cs.some(x=>x.actual_substances_verified!==false)||
    mix.sodium_mg_per_100g_salt_substitute_mixture_max!==120||
    mix.combined_colloidal_silica_or_calcium_silicate_percent_m_m_max!==1||
    JSON.stringify(mix.declared_cations_per_100g_mixture)!==JSON.stringify(["sodium","potassium","calcium","magnesium","ammonium","choline"])||
    food.low_sodium_final_food_mg_per_100g_as_consumed_max!==120||
    food.very_low_sodium_final_food_mg_per_100g_as_consumed_max!==40||
    food.NOT_salt_substitute_mixture_limit!==true||
    s.exact_finished_CTR_legal_article_adjudicated!==false)
 return blocked("SOURCE_REGISTER_INTEGRITY_HOLD","Source ion/denominator or distinct dietary-food provision invalid");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.legalProductPASS||c.batchRelease||c.genericMg20ProductMass||
    c.autoApplyIonLimitsWithoutComposition||c.useCommonSaltNaClStandard||
    c.treatGMPasZero||c.treatGMPasUnrestricted||
    c.applySaltMixtureLimitToMeal||c.autoApproveLowSodiumClaims||
    c.hasFullSKUAndLabEvidence)
 return blocked("ACTUAL_COMPOSITION_CURRENT_LAW_AND_LOT_REVIEW_REQUIRED",
 "Official standard is identified; actual formula, ion calculations, other law and evidence remain unverified");
 return blocked("ORIGINAL_GAZETTE_SALT_SUBSTITUTE_SOURCE__SKU_EVIDENCE_HOLD",
 "Original Gazette source verified; no actual product analytical or legal compliance decision made");
}
