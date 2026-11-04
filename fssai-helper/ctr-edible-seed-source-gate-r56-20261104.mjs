/** R56: licensing-only edible dried seed categories. Fail closed until real SKU evidence. */
const allowed=Object.freeze({
 "04-04-1-edible-dried-seeds-obtained-from-fruits":"04.1.2.2",
 "04-04-2-edible-dried-seeds-obtained-from-vegetables":"04.2.2.2"
});
const block=(status,reason,code=null)=>Object.freeze({
 status,reason,sourceFoSCoSCategory:code,sourceOnly:true,
 actualEdibleSeedSpeciesAndGradeVerified:false,
 currentFSSRStandardLegallyAdjudicated:false,
 currentFinishedProductCTRArticleLegallyAdjudicated:false,
 rawFruitOrVegetableMRLTransferredToSeed:false,
 numericCTRLimitAutoApplied:false,
 legalProductPASS:false,batchReleaseAuthorized:false
});
export function reviewDriedSeedSource(register,id,claims={}){
 if(!register||register.review_id!=="PMSV_R56_2026_11_04"||
 !Array.isArray(register.records)||register.records.length!==2||
 register.previous_R51_seed_cases!==2||
 register.source_anchored_seed_cases!==2||
 register.catalogue_identifiers_retained!==533||
 register.original_CTR_product_article_legal_holds_open!==137||
 register.new_legally_compliant_products!==0||
 register.newly_legally_adjudicated_CTR_product_articles!==0||
 register.numeric_CTR_rules_modified!==false||
 register.live_PMSV_helper_modified!==false||
 register.original_R29_R50_R51_preserved!==true)
 return block("SOURCE_REGISTER_INTEGRITY_HOLD","Source register or 137-case non-PASS baseline invalid");
 if(typeof id!=="string"||!Object.hasOwn(allowed,id))
 return block("NOT_IN_R56_SCOPE","Not an original R56 dried-seed category case");
 if(new Set(register.records.map(x=>x?.catalogue_id)).size!==2||
  register.records.some(x=>!x||!Object.hasOwn(allowed,x.catalogue_id)||
   x.foSCoS_source_category!==allowed[x.catalogue_id]||
   x.original_r29_FSSR_field!==""||
   x.specific_FSSR_standard_in_2024_order!==false||
   x.species_specific_actual_legal_standard_as_of_2026_verified!==false||
   x.current_applicable_metals_mycotoxin_pesticide_micro_panel_completed!==false||
   x.CTR_article_legal_decision!=="ACTUAL_SKU_SPECIES_AND_CURRENT_LEGAL_ARTICLE_HOLD"||
   x.product_legally_compliant!==false||
   x.batch_release_authorized!==false||
   x.auto_assign_numeric_CTR_rule!==false))
 return block("SOURCE_REGISTER_INTEGRITY_HOLD","Missing, duplicative or unsafe seed evidence record");
 const row=register.records.find(x=>x.catalogue_id===id);
 if(!row)return block("SOURCE_REGISTER_INTEGRITY_HOLD","Expected category row unavailable");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.autoAssignFruitMRL||c.autoAssignVegetableMRL||c.autoAssignNutMRL||
 c.autoAssignSeedOilMRL||c.autoApplyCTRLimit||c.exemptContaminants||
 c.legalProductPASS||c.batchRelease||c.actualSKUComplete)
 return block("SKU_SPECIES_AND_CURRENT_LEGAL_ARTICLE_ASSESSMENT_REQUIRED",
  "2024 seed classification is not evidence of the source article, method, product compliance or commercial release",
 row.foSCoS_source_category);
 return block("OFFICIAL_2024_INTERIM_FOSCOS_SOURCE_ONLY__SEED_ARTICLE_HOLD",
 "Exact seed species, form, notified current standards, CTR matrix and lot method/results not proven",
 row.foSCoS_source_category);
}
