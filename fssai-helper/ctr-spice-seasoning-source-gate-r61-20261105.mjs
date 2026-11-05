/** R61: static FSSAI source crosswalk only. No actual SKU approval or release. */
const classes=Object.freeze({
"12-12-2-asafoetida-hing-or-hingra":["12.2.1","2.9.29","HING_HINGRA_COMPOUNDED_DISTINCT"],
"12-12-2-seasoning":["12.2.2","2.9.31","SEASONING_DRY_OR_PASTE"],
"12-12-2-spice-oleoresins":["12.2.1","2.9.32","EXTRACTED_SPICE_OLEORESIN"]
});
const safe=(status,reason,clause=null)=>Object.freeze({
status,reason,sourceClause:clause,sourceOnly:true,
actualIngredientSubtypeConfirmed:false,currentOriginalLawReconciled:false,
correctCTRFinishedArticleAdjudicated:false,fullLegalPanelSignedOff:false,
sourceNumericRuleAutoApplied:false,legalProductPASS:false,
commercialBatchReleaseAuthorized:false,liveHelperUpdated:false
});
const expectedProfiles=[
["Hing",15,2.5,12,1],
["Hingra",20,8,50,1],
["Compounded asafoetida / Bandhani Hing",10,1.5,5,null]
];
const solvents=[
["Acetone",30],["Ethyl acetate",50],["n-Hexane",25],["Isopropyl alcohol",30],
["Methyl alcohol",50],["Carbon dioxide","GMP"],["Water","GMP"],["Diethyl ether",2],
["Ethyl alcohol","GMP"],["Butan-1-ol",2],["Butan-2-ol",2],["Propan-1-ol",1],["Methyl tert-butyl ether",2]
];
const ctr=[
["Lead","Dehydrated onions, dried herbs and spices, curry powder and mix masalas, flavourings, ...",10],
["Total Aflatoxins","Spices/Spice Mix",30],
["Aflatoxin B1","Spices/Spice Mix",15],
["Total Aflatoxins","Food product containing any of the above mentioned food articles",20],
["Aflatoxin B1","Food product containing any of the above mentioned food articles",10]
];
export function reviewR61Source(m,id,claims={}){
 if(!m||m.review_id!=="PMSV_R61_2026_11_05"||
 m.catalogue_original_unique_IDs!==533||
 m.original_R50_source_screened_cases!==137||
 m.original_CTR_finished_product_article_applicability_holds_open!==137||
 m.r60_prior_uniquely_focused_cases!==41||
 m.r61_new_unique_focused_cases!==3||
 m.r61_cumulative_unique_focused_cases_selected_rounds!==44||
 m.r61_original_cases_outside_selected_focused_rounds!==93||
 m.r61_exact_product_CTR_article_closures!==0||
 m.r61_full_legal_product_approvals!==0||
 m.r61_commercial_lot_releases!==0||
 m.source_product_master_modified!==false||
 m.original_R29_R50_registers_modified!==false||
 m.operative_numeric_CTR_rules_modified!==false||
 m.live_PMSV_helper_modified!==false||
 m.draft_PR_2_stays_unmerged!==true)
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Counters or no-approval baseline missing");
 if(typeof id!=="string"||!Object.hasOwn(classes,id))
 return safe("NOT_IN_R61_SCOPE","Original ID not among the three spices source cases");
 const rows=m.R61_catalogue_records;
 if(!Array.isArray(rows)||rows.length!==3||
 new Set(rows.map(x=>x?.catalogue_id)).size!==3||
 rows.some(x=>!x||!Object.hasOwn(classes,x.catalogue_id)||
  x.original_FPC!==classes[x.catalogue_id][0]||
  x.original_FSSR!==classes[x.catalogue_id][1]||
  x.standard_family!==classes[x.catalogue_id][2]||
  x.actual_manufacturer_SKU_ingredient_species_and_processing_confirmed!==false||
  x.current_correct_finished_product_CTR_article_adjudicated!==false||
  x.source_values_auto_applied!==false||
  x.finished_product_legal_PASS!==false||
  x.commercial_batch_release_authorized!==false))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Unsafe source identity or added legal pass");
 const hing=rows.find(x=>x.catalogue_id==="12-12-2-asafoetida-hing-or-hingra");
 const seasoning=rows.find(x=>x.catalogue_id==="12-12-2-seasoning");
 const oil=rows.find(x=>x.catalogue_id==="12-12-2-spice-oleoresins");
 const profiles=hing?.source_parameters?.profiles||[];
 if(profiles.length!==3||
 profiles.some((x,i)=>[x.name,x.total_ash_max_pct,x.acid_insoluble_ash_max_pct,x.alcoholic_extract_min_pct,x.starch_max_pct]
 .some((z,j)=>z!==expectedProfiles[i][j])))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Hing subtype tests or non-existent compounded starch limit were changed");
 const sl=seasoning?.source_parameters?.limits||[];
 if(sl.length!==2||sl[0].parameter!=="Moisture"||sl[0].value!==10||
 !String(sl[0].exception).includes("pastes")||
 sl[1].parameter!=="Acid insoluble ash in dilute HCl"||sl[1].value!==2||
 sl[1].exception!==null||sl.some(x=>x.auto_apply!==false))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Seasoning paste exception or ash basis misassigned");
 const ss=oil?.source_parameters?.solvent_residue_limits||[];
 if(ss.length!==13||ss.some((x,i)=>x.solvent!==solvents[i][0]||
 x.printed_residual_limit!==solvents[i][1]||
 x.auto_apply!==false||
 x.actual_used_in_SKU_confirmed!==false))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Spice oleoresin residual solvent table modified");
 const voc=oil?.source_parameters?.botanical_voc_reference_examples||[];
 if(voc.length!==3||voc[0].volatile_oil_content_min_ml_100g!==1.5||
 voc[1].volatile_oil_content_min_ml_100g!==20||
 voc[2].volatile_oil_content_min_ml_100g!==null||
 !String(voc[2].source_printed).includes("dash"))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Spice/botanical VOC identity misapplied");
 const c=m.selected_CTR_source_rows||[];
 if(c.length!==5||c.some((x,i)=>x.analyte!==ctr[i][0]||
 x.printed_food_article!==ctr[i][1]||x.limit!==ctr[i][2]||
 x.actual_R61_SKU_article_matched!==false||x.numeric_rule_auto_applied!==false||
 x.official_pdf_page_image_checked!==true))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","CTR source-row identity or no-auto-limit guard invalid");
 const r=rows.find(x=>x.catalogue_id===id);
 if(!r)return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Source record not found");
 const cl=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(cl.legalProductPASS||cl.batchRelease||cl.autoUseDrySpiceLead||
 cl.autoUseAflatoxin30or20||cl.assignOneGenericHingAsh||
 cl.treatPasteAsAshExempt||cl.treatVOCdashAsZero||
 cl.apply30ppmToAllSolvents||cl.useGMPasZero||
 cl.useSpicePowderMRLforOleoresin||cl.evidenceComplete)
 return safe("INDEPENDENT_SKU_AND_CURRENT_LAW_REVIEW_REQUIRED",
 "FSSR reference, source test or CTR source article cannot authorize an actual manufactured product",
 r.original_FSSR);
 return safe("FSSR_SPICE_SOURCE_REVIEWED__ACTUAL_SKU_CTR_EVIDENCE_HOLD",
 "Subtype, formula, extraction solvents, methods, original Gazettes and full CTR/label/micro panels remain unverified",
 r.original_FSSR);
}
