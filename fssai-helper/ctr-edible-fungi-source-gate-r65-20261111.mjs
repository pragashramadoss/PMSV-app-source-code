/** PMSV R65: FSSR 2.3.62 source-only guard; no legal PASS or commercial release path. */
const EXPECTED=Object.freeze({
"04-04-2-dried-fungi":{fpc:"04.2.2.2",style:"dried_fungi",clause:"3(i)",species:"single",pages:[97,98],limits:{moisture_pct_m_m_max_freeze_dried:6,moisture_pct_m_m_max_other_dried:12,moisture_pct_m_m_max_shiitake:13,mineral_impurities_pct_m_m_max:2,organic_impurities_pct_m_m_max_except_shiitake:0.02,organic_impurities_pct_m_m_max_shiitake:1,maggot_total_damage_pct_m_m_max:1,maggot_serious_damage_pct_m_m_max:0.5,crushed_fungi_pct_m_m_max:6,carbonized_fungi_pct_m_m_max:2,damaged_fungi_pct_m_m_max:20}},
"04-04-2-dried-fungi-concentrate":{fpc:"04.2.2.2",style:"dried_fungi_concentrate",clause:"3(ix)",species:"one_or_more",pages:[102],limits:{moisture_pct_m_m_max:9,salt_nacl_pct_m_m_max:5,mineral_impurities:"none",organic_vegetable_impurities:"none"}},
"04-04-2-fermented-fungi":{fpc:"04.2.2.7",style:"fermented_fungi",clause:"3(iv)",species:"single",pages:[99],limits:{naturally_occurring_lactic_acid_pct_m_m_min:1,salt_nacl_pct_m_m_min:3,salt_nacl_pct_m_m_max:6,mineral_impurities_pct_m_m_max:0.2,organic_vegetable_impurities_pct_m_m_max:0.1,maggot_damaged_pct_m_m_max:4}},
"04-04-2-fungi-extract-and-fungi-concentrate":{fpc:"04.2.2.2",style:"fungi_extract_and_concentrate",clause:"3(viii)",species:"one_or_more",pages:[101,102],limits:{fungi_extract_saltless_extract_pct:7,fungi_concentrate_saltless_extract_pct:24,salt_nacl_pct_m_m_max:20,mineral_impurities:"none",organic_vegetable_impurities:"none"}},
"04-04-2-fungi-grits-and-fungi-powder":{fpc:"04.2.2.2",style:"fungi_grits_and_powder",clause:"3(ii)",species:"single",pages:[98],limits:{grits_moisture_pct_m_m_max:13,powder_moisture_pct_m_m_max:9,powder_sieve_microns:200,mineral_impurities_pct_m_m_max:2}},
"04-04-2-fungi-in-olive-oil-and-other-vegetable-oils":{fpc:"04.2.2.3",style:"fungi_in_vegetable_oils",clause:"3(v)",species:"single",pages:[100],limits:{salt_nacl_pct_m_m_max:1,mineral_impurities_pct_m_m_max:0.1,organic_vegetable_impurities_pct_m_m_max:0.02,maggot_total_damage_pct_m_m_max:1,maggot_serious_damage_pct_m_m_max:0.5}},
"04-04-2-pickled-fungi":{fpc:"04.2.2.7",style:"pickled_fungi",clause:"3(iii)",species:"one_or_more",pages:[98,99],limits:{salt_nacl_pct_m_m_max:2.5,sugars_pct_m_m_max:2.5,vinegar_as_acetic_acid_pct_m_m_max:2,mineral_impurities_pct_m_m_max:0.1,organic_vegetable_impurities_pct_m_m_max:0.02,maggot_total_damage_pct_m_m_max:1,maggot_serious_damage_pct_m_m_max:0.5}},
"04-04-2-quick-frozen-fungi":{fpc:"04.2.2.1",style:"quick_frozen_fungi",clause:"3(vi)",species:"single",pages:[100,101],limits:{thermal_centre_celsius_at_completion_max:-18,mineral_impurities_pct_m_m_max:0.2,organic_vegetable_impurities_pct_m_m_max:0.02,maggot_total_damage_pct_m_m_max:1,maggot_serious_damage_pct_m_m_max:0.5}},
"04-04-2-salted-fungi-semi-processed-products":{fpc:"04.2.2.3",style:"salted_fungi_semi_processed",clause:"3(x)",species:"single",pages:[102],limits:{salt_nacl_pct_m_m_min:15,salt_nacl_pct_m_m_max:18,mineral_impurities_pct_m_m_max:0.3,organic_vegetable_impurities_pct_m_m_max:0.05,maggot_total_damage_pct_m_m_max:1,maggot_serious_damage_pct_m_m_max:0.5}},
"04-04-2-sterilized-fungi":{fpc:"04.2.2.4",style:"sterilized_fungi",clause:"3(vii)",species:"one_or_more",pages:[101],limits:{salt_nacl_pct_m_m_max:2,mineral_impurities_pct_m_m_max:0.2,organic_vegetable_impurities_pct_m_m_max:0.02,maggot_total_damage_pct_m_m_max:1,maggot_serious_damage_pct_m_m_max:0.5}}
});
const hold=(status,reason)=>Object.freeze({
 status,reason,sourceResearchOnly:true,manufacturerSpecificSKULabEvidenceVerified:false,
 allCurrentGazetteAndCTRAssessmentComplete:false,exactFinishedProductCTRArticleDecided:false,
 operativeNumericRuleAssigned:false,legalProductPASS:false,commercialBatchReleaseAuthorized:false
});
export function reviewR65FungiSource(r,id,claims={}){
 if(!r||r.review_id!=="PMSV_R65_2026_11_11"||r.original_catalogue_ids!==533||
   r.original_R50_CTR_article_legal_holds!==137||r.previous_R64_unique_focused_cases!==50||
   r.R65_new_distinct_focused_cases!==10||r.R65_cumulative_unique_focused_cases!==60||
   r.original_cases_outside_R45_R65_focused_rounds!==77||r.source_FSSR!=="2.3.62"||
   r.legal_PRODUCT_PASS_count!==0||r.commercial_release_count!==0||
   r.exact_CTR_article_decisions_closed_this_round!==0||
   r.original_R29_R50_registers_modified!==false||r.product_master_modified!==false||
   r.live_PMSV_Helper_modified!==false||r.operative_numeric_CTR_rules_modified!==false||
   r.independent_Ayurveda_raw_ingredient_source_gaps!==14||
   r.independent_Ayurveda_raw_ingredient_source_reference_links!==94||
   r.PR_2_remains_draft_unmerged!==true)
 return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Historical evidence-only counts or non-release assertions changed");
 if(typeof id!=="string"||!Object.hasOwn(EXPECTED,id))
 return hold("NOT_IN_R65_SCOPE","Original source catalogue item is not one of the 10 R65 edible-fungi records");
 const src=r.official_sources?.[0], fpc=r.official_sources?.[1];
 if(!src||src.url!=="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf"||
  JSON.stringify(src.pdf_pages_zero_based_actually_visually_checked)!==JSON.stringify([96,97,98,99,100,101,102,103])||
  src.all_style_source_tables_visually_crosschecked!==true||
  src.all_applicable_original_notifications_2026_legally_reconciled!==false||
  src.compendium_is_reference_original_Gazette_controls!==true||
  fpc?.actual_manufacturer_licence_verified!==false)
 return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Official source, original-Gazette hold or FPC evidence integrity broken");
 if(!r.labelling_specific||r.labelling_specific.common_and_scientific_species_for_dried_salted_quick_frozen_fermented_pickled_canned!==true||
   r.labelling_specific.mixed_if_multiple_species!==true||
   r.labelling_specific.history_of_fungi_processing_when_starting_material_not_fresh!==true||
   r.labelling_specific.salted_fungi_input_when_used!==true||
   r.labelling_specific.stalks_added_when_added!==true||
   r.labelling_specific.actual_current_labelling_compliance_legally_reviewed!==false)
 return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Specific fungi label provenance safeguards changed");
 const records=r.product_source_records;
 if(!Array.isArray(records)||records.length!==10||
   new Set(records.map(x=>x?.catalogue_id)).size!==10)
 return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Expected exactly ten unique edible-fungi original IDs");
 for(const p of records){
  const e=EXPECTED[p?.catalogue_id],x=p?.source_specs;
  if(!e||p.source_FPC!==e.fpc||p.source_FSSR!=="2.3.62"||
     p.original_R50_priority!=="P2"||p.original_R29_screening_route!=="CONDITIONAL_CTR_SOURCE_CANDIDATE"||
     !x||x.style!==e.style||x.subclause!==e.clause||x.species_policy!==e.species||
     JSON.stringify(x.pages)!==JSON.stringify(e.pages)||
     JSON.stringify(x.limits)!==JSON.stringify(e.limits)||
     typeof x.critical_guard!=="string"||!x.critical_guard.length||
     p.actual_manufacturer_species_style_process_preservation_and_pack_verified!==false||
     p.actual_batch_analyte_sampling_accredited_methods_and_results_verified!==false||
     p.current_original_Gazette_full_FSSR_CTR_micro_additives_label_packaging_reconciled!==false||
     p.exact_finished_product_CTR_article_legally_decided!==false||
     p.numeric_limits_auto_applied!==false||
     p.legal_product_PASS!==false||p.commercial_batch_release_authorized!==false)
   return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Ten-style source specification, identity or independent product hold altered");
 }
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 const forbidden=[
 "legalPASS","releaseBatch","assignCTRAutomatically","autoUseGenericVegetableCTR",
 "assumeAllFungiSameFPC","applyDriedMoistureToPowder","skipPowderSieve",
 "usePickleVinegarAsMinAcidSafety","useFermentSaltAsMaximumOnly",
 "allowFermentationWithoutProcessValidation","treatAirFreezerMinus18AsProductCore",
 "treatSterilizedAsCommerciallySterile","assumeOilPackShelfStable",
 "substituteFungiExtractForDriedConcentrate","assumeNoneImpuritiesMeansZeroLOD",
 "skipScientificNameLabel","declareVeganOrMilkFreeWithoutFormula",
 "assume2026GazettesReconciled","skipContaminantAndMicroPanel"
 ];
 if(forbidden.some(k=>c[k]===true))
 return hold("ACTUAL_SKU_STYLE_PROCESS_FSSAI_CTR_AND_LAB_EVIDENCE_REQUIRED",
 "The official 2.3.62 style-source tables do not prove finished SKU safety, applicable contaminants, current labelling or commercial release");
 return hold("FSSR_2_3_62_TEN_STYLE_SOURCE__PRODUCT_CTR_HOLD",
 "All 10 official style-source records preserved; legal food-article selection and independent verified laboratory results remain outstanding");
}
