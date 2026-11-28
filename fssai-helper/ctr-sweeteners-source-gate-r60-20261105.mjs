/** R60: Only FSSR text source candidates. Never a SKU legal approval or CTR source auto-limit. */
export const R60_CATEGORY_INDEX=Object.freeze({
 "11-11-1-cane-jaggery-or-cane-gur":["11.1.6.1","2.8.4(2)","CANE_JAGGERY"],
 "11-11-1-gur-or-jaggery":["11.1.6","2.8.4(1)","PALM_GUR_JAGGERY"],
 "11-11-1-misri":["11.1.5","2.8.2","MISRI"],
 "11-11-3-golden-syrup":["11.3","2.8.6","GOLDEN_SYRUP"],
 "11-11-1-dried-glucose-syrup":["11.1.3.1","2.8.7","DRIED_GLUCOSE_SYRUP"],
 "11-11-1-edible-lactose":["11.1.4","2.1.20","EDIBLE_LACTOSE_FROM_WHEY"]
});
const safe=(status,reason,sourceClause=null)=>Object.freeze({
 status,reason,sourceClause,sourceOnly:true,
 actualSKUIdentityVerified:false,completeCurrentGazetteReconciled:false,
 legalCTRProductArticleAssigned:false,correctAshMethodAndQualifierVerified:false,
 fullCurrentCTRPanelVerified:false,numericCTRLimitAutoApplied:false,
 wholeProductLegalPASS:false,commercialBatchReleaseAuthorized:false,
 productionEngineModified:false
});
const exact=(row,name,comp,number)=>row.selected_standard_parameters.some(x=>
 x.test===name&&x.comparison===comp&&x.source_number===number&&
 x.regulatory_limit_auto_applied===false);
export function reviewR60SweetenerSource(register,id,claims={}){
 if(!register||register.review_id!=="PMSV_R60_2026_11_05"||
  register.original_catalogue_id_count!==533||
  register.original_exact_CTR_product_article_decisions_open!==137||
  register.reviewed_original_catalogue_count!==6||
  register.prior_unique_focused_cases_R45_to_R59!==35||
  register.unique_focused_cases_R45_to_R60!==41||
  register.original_cases_outside_R45_to_R60_focus!==96||
  register.finished_product_CTR_legally_decided_this_round!==0||
  register.legally_approved_whole_products!==0||
  register.commercial_releases!==0||
  register.original_R29_R50_audit_files_modified!==false||
  register.product_master_modified!==false||
  register.numerical_live_rules_modified!==false||
  register.deployed_PMSV_helper_modified!==false||
  register.draft_PR_2_unmerged!==true)
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","R60 source or legal-approval counts incorrect");
 if(typeof id!=="string"||!Object.hasOwn(R60_CATEGORY_INDEX,id))
 return safe("NOT_IN_R60_SCOPE","Not among six reviewed sources");
 const rows=register.products;
 if(!Array.isArray(rows)||rows.length!==6||
  new Set(rows.map(x=>x?.catalogue_id)).size!==6||
  rows.some(x=>!x||!Object.hasOwn(R60_CATEGORY_INDEX,x.catalogue_id)||
   x.original_fpc!==R60_CATEGORY_INDEX[x.catalogue_id][0]||
   x.original_fssr!==R60_CATEGORY_INDEX[x.catalogue_id][1]||
   x.standard_kind!==R60_CATEGORY_INDEX[x.catalogue_id][2]||
   x.precise_legally_applicable_finished_CTR_article_decided!==false||
   x.legal_finished_food_PASS!==false||x.batch_release_authorized!==false||
   x.numeric_rule_auto_assignment!==false||
   !Array.isArray(x.selected_standard_parameters)||
   x.selected_standard_parameters.some(y=>y.regulatory_limit_auto_applied!==false)))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Modified or unsafe source-identity or numeric field");
 const lead=register.source_CTR_lead_article_examples;
 if(!Array.isArray(lead)||lead.length!==3||
  lead.some(x=>x.auto_apply!==false)||
  JSON.stringify(lead.map(x=>x.limit_mgkg))!==JSON.stringify([5,.5,5])||
  lead[0].qualifier!=="sulphated ash >1.0%"||
  lead[2].qualifier!=="sulphated ash >1.0%")
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","CTR lead source qualifier or no-auto-assign guard missing");
 const j=rows.find(x=>x.catalogue_id==="11-11-1-cane-jaggery-or-cane-gur");
 const palm=rows.find(x=>x.catalogue_id==="11-11-1-gur-or-jaggery");
 const golden=rows.find(x=>x.catalogue_id==="11-11-3-golden-syrup");
 const dried=rows.find(x=>x.catalogue_id==="11-11-1-dried-glucose-syrup");
 const lactose=rows.find(x=>x.catalogue_id==="11-11-1-edible-lactose");
 if(!exact(j,"Reducing sugars",">=",5.5)||
  !exact(j,"Reducing sugars","<=",20)||
  !exact(j,"Sulphate ash","<=",4)||
  !exact(palm,"Total ash","<=",6)||
  exact(palm,"Reducing sugars",">=",5.5)||
  !exact(golden,"Total ash","<=",2.5)||
  !exact(golden,"Total sugar as invert sugar",">=",72)||
  exact(golden,"Glucose",">=",99)||
  !exact(dried,"Sulphated ash","<=",1)||
  !exact(dried,"Total solids",">=",93)||
  !exact(lactose,"Lactose",">=",99)||
  !exact(lactose,"pH in 10 percent solution",">=",4.5)||
  !exact(lactose,"pH in 10 percent solution","<=",7))
 return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Critical jaggery/ash/dehydrated syrup/dairy source scope wrong");
 const row=rows.find(x=>x.catalogue_id===id);
 if(!row)return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Catalogue row not unique");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.legalPASS||c.batchRelease||c.autoUseAshLead5||
    c.autoUseRefinedLead05||c.autoTransferPalmJaggeryLimits||
    c.autoUseCaneOnlyMaxReducingSugar||c.autoUseDextroseTestsForGoldenSyrup||
    c.autoTreatLactoseAsRefinedSugar||c.completeLabEvidence)
 return safe("INDEPENDENT_ACTUAL_SKU_LEGAL_ASSESSMENT_REQUIRED",
 "Named source standard and example CTR articles do not determine actual SKU or applicable legal limit",
 row.original_fssr);
 return safe("OFFICIAL_SWEETENER_FSSR_SOURCE__ACTUAL_SKU_AND_CTR_ARTICLE_HOLD",
 "Six source clauses recorded; current Gazette, actual commodity, ash methods, full panels and labs pending",
 row.original_fssr);
}
