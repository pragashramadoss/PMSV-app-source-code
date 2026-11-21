/** R54: a source classification is not a finished-product FSSR, CTR or batch release approval. */
const ALLOWED_IDS=Object.freeze({
 "99-99-1-acidity-regulators-l-tartaric-acid":"99.1",
 "99-99-1-additives-va-vf-of-nutraceutical-regulations-excluding-those-already-standardised":"99.1",
 "99-99-1-sajji-khar":"99.1",
 "99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc":"99.2",
 "99-99-3-mixture-preparations-premix-of-flavouring-substances":"99.3",
 "99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica":"99.7",
 "99-99-7-mixtures-preparations-premix-of-functional-ingredients":"99.7"
});
const block=(status,reason,source=null)=>Object.freeze({
  status,reason,sourceCategory:source,licensingCategoryOnly:true,
  actualSKUIdentityVerified:false,
  actualManufacturerLicenceConfirmed:false,
  exactFinishedProductFSSRClauseDecided:false,
  exactFinishedProductCTRArticleDecided:false,
  fullLegalProductComplianceApproved:false,
  numericCTRLimitAutoApplied:false,
  commercialBatchReleaseAuthorized:false
});
export function reviewCategory99Source(register,catalogueID,options={}){
 if(!register||!Array.isArray(register.seven_records)||
 register.review_id!=="PMSV_R54_2026_11_04"||
 register.category_99_blank_FSSR_source_records!==7||
 register.exact_CTR_product_article_applicability_holds_still_open!==137||
 register.original_catalogue_product_records!==533||
 register.verified_whole_product_compliance_PASS_count!==0||
 register.category_99_source_only_route_checks_completed!==7)
 return block("SOURCE_REGISTER_INTEGRITY_HOLD","R54 source register integrity is not verified");
 if(typeof catalogueID!=="string"||!Object.hasOwn(ALLOWED_IDS,catalogueID))
 return block("NOT_IN_R54_SCOPE","Catalogue ID is not one of the seven reviewed FSSR-field gaps");
 const matches=register.seven_records.filter(x=>x?.catalogue_id===catalogueID);
 if(matches.length!==1) return block("SOURCE_REGISTER_INTEGRITY_HOLD","Missing or duplicate source identity");
 const e=matches[0];
 if(e.original_fcs!==ALLOWED_IDS[catalogueID]||
 e.original_r29_fssr_field!==""||
 e.source_FSSR_blank_remains!==true||
 e.source_foscos_category_confirmed!==true||
 e.official_category_99_name_aligned!==true||
 e.finished_product_FSSR_clause_legally_decided!==false||
 e.current_CTR_finished_article_legally_decided!==false||
 e.compliance_PASS!==false||
 e.commercial_batch_release_authorized!==false||
 e.auto_assign_numeric_CTR_limit!==false)
 return block("SOURCE_REGISTER_INTEGRITY_HOLD","Missing legal-scope guard or invalid source field");
 const requested=options&&typeof options==="object"?options:{};
 if(requested.fullProductPASS||requested.commercialRelease||requested.autoApplyCTRLimit||
 requested.assignAnyFSSRClause||requested.actualSKUComplete)
  return block("LEGAL_ADJUDICATION_REQUIRED","A FoSCoS licensing umbrella never authorizes finished-product legal PASS or automatic limits",e.original_fcs);
 return block("OFFICIAL_FOSCOS_SOURCE_ONLY__SKU_LEGAL_EVIDENCE_HOLD",
  "Source category confirmed only; exact substance, permissions, current law and actual SKU evidence pending",
  e.original_fcs);
}
