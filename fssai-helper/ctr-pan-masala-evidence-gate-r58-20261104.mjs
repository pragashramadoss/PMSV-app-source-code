/** PMSV R58: Pan Masala actual-SKU evidence guard. No numeric release or auto-legal-pass. */
export const EXPECTED_R58_ID="100-100-pan-masala";
const result=(status,reason)=>Object.freeze({
 status,reason,sourceResearchOnly:true,
 actualSKUIdentityVerified:false,currentOriginalLawReconciled:false,
 actualPackMaterialLegallyCleared:false,fullCurrentCTRPanelVerified:false,
 numericCTRAutoApplied:false,legallyAdjudicatedFinishedProductCTRArticle:false,
 future2027AdvertisementAmendmentAppliedEarly:false,
 legalProductPASS:false,commercialBatchReleaseAuthorized:false
});
const requiredSourceRows=[
 ["Total Aflatoxins","Arecanut or Betelnut",15],
 ["Aflatoxin B1","Arecanut or Betelnut",10],
 ["Total Aflatoxins","Food product containing any of the above mentioned food articles",20],
 ["Aflatoxin B1","Food product containing any of the above mentioned food articles",10]
];
export function reviewPanMasalaEvidence(r,id,claim={}){
 if(!r||r.review_id!=="PMSV_R58_2026_11_04"||
 r.catalogue_identity_count!==533||
 r.original_finished_food_CTR_article_holds!==137||
 r.source_reviewed_catalogue_ids?.length!==1||
 r.source_reviewed_catalogue_ids[0]!==EXPECTED_R58_ID||
 r.original_r29_FSSR!=="2.11.5"||
 r.original_r29_FPC!=="100"||
 r.new_legally_adjudicated_product_CTR_articles!==0||
 r.new_fully_approved_products!==0||
 r.original_R29_R50_R55_registers_modified!==false||
 r.product_master_modified!==false||
 r.operative_numeric_rules_modified!==false||
 r.live_helper_modified!==false||
 r.PR_2_draft_unmerged!==true)
 return result("SOURCE_REGISTER_INTEGRITY_HOLD","R58 source scope, preservation or no-PASS counters invalid");
 if(id!==EXPECTED_R58_ID)return result("NOT_IN_R58_SCOPE","Catalogue ID is not reviewed Pan Masala");
 const p=r.product_identity_source||{};
 if(p.clause!=="2.11.5"||p.total_ash_max_percent_dry_basis!==8||
 p.acid_insoluble_ash_max_percent_dry_basis!==0.5||
 p.actual_manufacturer_formula_verified!==false||
 p.product_sample_ash_results_verified!==false||
 p.not_generic_FPC_5_2_4_mouth_freshener_standard!==true)
 return result("SOURCE_REGISTER_INTEGRITY_HOLD","FSSR identity/ash article or no-data guard invalid");
 const limits=r.raw_and_composite_aflatoxin_source_rows;
 if(!Array.isArray(limits)||limits.length!==4||
 limits.some((x,i)=>!x||x.analyte!==requiredSourceRows[i][0]||
 x.printed_article!==requiredSourceRows[i][1]||
 x.source_limit_ugkg!==requiredSourceRows[i][2]||
 x.source_pdf_page_image_verified!==true||
 x.actual_finished_food_product_MRL_legally_adjudicated!==false||x.auto_apply!==false)||
 r.which_specific_CTR_article_applies_to_finished_SKU_legally_decided!==false||
 r.current_full_CTR_panel_and_original_Gazette_reconciled!==false)
 return result("SOURCE_REGISTER_INTEGRITY_HOLD","Raw/betelnut or composite food source row was misapplied");
 const warning=r.current_front_pack_warning_source||{};
 const packaging=r.published_packaging_2026_source||{};
 const future=r.future_label_regulatory_gate||{};
 if(warning.front_of_pack_warning_area_percent!==50||
 warning.actual_pack_artwork_reviewed!==false||
 packaging.official_final_gazette_PDF_primary_page_image_verification_pending!==true||
 packaging.no_packaging_approval_without_original_Gazette_and_actual_pack_review!==true||
 packaging.separate_mandatory_PWM_prohibitions_not_equated_to_suggestive_list!==true||
 future.effective_date!=="2027-07-01"||
 future.future_2027_requirement_active_as_of_2026_11_04!==false)
 return result("SOURCE_REGISTER_INTEGRITY_HOLD","Warning, 2026 pack-source or future advertising date safeguards failed");
 const c=claim&&typeof claim==="object"&&!Array.isArray(claim)?claim:{};
 if(c.legalProductPASS||c.batchRelease||c.autoApplyBetelnutMRL||
 c.autoApplyCompositeMRL||c.autoUse2027Amendment||
 c.autoApprovePaperOrGlassPack||c.treat2023ExtensionAsWaiver||
 c.autoAssignToAllMouthFresheners||c.allEvidenceComplete)
 return result("INDEPENDENT_ACTUAL_SKU_AND_EFFECTIVE_LAW_ASSESSMENT_REQUIRED",
 "Source references do not prove ingredient, mixed-food article, warning, packaging, full current law or lot release");
 return result("PAN_MASALA_OFFICIAL_SOURCE_REVIEWED__FINISHED_PRODUCT_EVIDENCE_HOLD",
 "Actual formula, laboratory evidence, warning layout, 2026 pack material and current legal product assessment remain pending");
}
