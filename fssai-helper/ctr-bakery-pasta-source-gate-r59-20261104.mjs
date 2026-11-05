/** PMSV R59 – FSSR source evidence-only bakery/pasta guard. Never releases a commercial product. */
const EXPECTED=Object.freeze({
 "07-07-2-biscuit":{fpc:"07.2.1",fssr:"2.4.15(1)",kind:"BISCUIT_GENERAL"},
 "07-07-2-wafer-biscuit":{fpc:"07.2.2",fssr:"2.4.15(1)",kind:"WAFER_IS_BISCUIT_SUBTYPE"},
 "07-07-1-bread-and-bread-type-products":{fpc:"07.1.1",fssr:"2.4.15(2)",kind:"BREAD_AND_RUSK"},
 "06-06-4-macaroni-products-pasta-products":{fpc:"06.4.2",fssr:"2.4.10",kind:"PASTA_PRODUCTS"},
 "06-06-4-macaroni-products-instant-noodle":{fpc:"06.4.3",fssr:"2.4.10",kind:"INSTANT_NOODLES"}
});
const hold=(status,reason,sourceFSSR=null)=>Object.freeze({
 status,reason,sourceFSSR,sourceOnly:true,actualSKUIdentityMatched:false,
 productFSSRQualityTestPassed:false,originalLawFullyReconciled:false,
 legalFinishedProductCTRArticleDecided:false,currentCTRFullPanelVerified:false,
 sourceNumericLimitAutoApplied:false,legalProductPASS:false,
 commercialBatchReleaseAuthorized:false,liveEngineChanged:false
});
const key=p=>p.test+":"+p.max_value+":"+p.basis;
const exactParams={
 "07-07-2-biscuit":["Ash insoluble in dilute HCl:0.1:dry mass","Acidity of extracted fat as oleic acid:2:extracted fat"],
 "07-07-2-wafer-biscuit":["Ash insoluble in dilute HCl:0.1:dry mass","Acidity of extracted fat as oleic acid:2:extracted fat"],
 "07-07-1-bread-and-bread-type-products":["Alcoholic acidity with 90% alcohol (for bread):7.5:bread dry substance","Acidity of extracted fat as oleic acid (for rusks):1.5:rusk extracted fat","Ash insoluble in dilute HCl:0.2:dry mass"],
 "06-06-4-macaroni-products-pasta-products":["Moisture:12.5:mass","Ash insoluble in dilute HCl:0.1:dry mass"],
 "06-06-4-macaroni-products-instant-noodle":["Moisture (fried instant noodles):10:mass","Moisture (non-fried instant noodles):13:mass","Ash insoluble in dilute HCl (fried or non-fried):0.3:dry matter","Acid value (fried instant noodles only):2:fried-noodle extracted fat"]
};
const ctrExpected=[
 ["Total Aflatoxins","Cereal and cereal products",15],
 ["Aflatoxin B1","Cereal and cereal products",10],
 ["Total Aflatoxins","Food product containing any of the above mentioned food articles",20],
 ["Aflatoxin B1","Food product containing any of the above mentioned food articles",10]
];
export function reviewBakeryPastaSource(r,id,claims={}){
 if(!r||r.review_id!=="PMSV_R59_2026_11_04"||
  r.catalogue_total_unchanged!==533||
  r.original_CTR_product_article_decisions_open!==137||
  r.original_five_source_screened_cases!==5||
  r.new_unique_focus_reviews_this_round!==5||
  r.now_focus_unique_cases_R45_to_R59!==35||
  r.original_137_cases_not_in_R45_to_R59_focused_batch!==102||
  r.legal_CTR_product_article_decisions_closed_this_round!==0||
  r.full_finished_products_legally_approved!==0||
  r.original_R29_R50_registers_modified!==false||
  r.product_master_changed!==false||r.live_pmsv_helper_changed!==false||
  r.operative_numeric_CTR_rules_modified!==false||
  r.PR_2_draft_unmerged!==true)
  return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Baseline source counts or no-PASS restrictions are invalid");
 if(typeof id!=="string"||!Object.hasOwn(EXPECTED,id))
  return hold("NOT_IN_R59_SCOPE","Not one of the five audited source-catalogue IDs");
 const rows=r.product_source_records;
 if(!Array.isArray(rows)||rows.length!==5||
  new Set(rows.map(x=>x?.catalogue_id)).size!==5||
  rows.some(x=>!x||!Object.hasOwn(EXPECTED,x.catalogue_id)||
   x.source_FPC!==EXPECTED[x.catalogue_id].fpc||
   x.source_FSSR!==EXPECTED[x.catalogue_id].fssr||
   x.FSSR_source_standard_kind!==EXPECTED[x.catalogue_id].kind||
   x.source_specifications_auto_applied_to_real_SKU!==false||
   x.correct_finished_product_CTR_named_article_legally_decided!==false||
   x.complete_current_CTR_full_analyte_panel_confirmed!==false||
   x.finished_product_legal_PASS!==false||x.batch_release_authorized!==false||
   !Array.isArray(x.printed_source_quality_parameters)||
   JSON.stringify(x.printed_source_quality_parameters.map(key))!==JSON.stringify(exactParams[x.catalogue_id])))
   return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Missing, altered or incorrectly inherited FSSR source test");
 const candidate=r.named_cereal_vs_composite_CTR_source_rows;
 if(!Array.isArray(candidate)||candidate.length!==4||
  candidate.some((x,i)=>!x||x.analyte!==ctrExpected[i][0]||
   x.printed_food_article!==ctrExpected[i][1]||
   x.limit_ug_per_kg!==ctrExpected[i][2]||
   x.actual_finished_product_article_assigned!==false||
   x.numeric_CTR_limit_auto_applied!==false||
   x.source_page_image_verified!==true))
   return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Mycotoxin source article or no-auto-apply guard invalid");
 const row=rows.find(x=>x.catalogue_id===id);
 if(!row)return hold("SOURCE_REGISTER_INTEGRITY_HOLD","Reviewed ID missing");
 const c=claims&&typeof claims==="object"&&!Array.isArray(claims)?claims:{};
 if(c.legalProductPASS||c.batchRelease||c.autoApplyCerealAflatoxin||
 c.autoApplyCompositeAflatoxin||c.autoApplyRawWheatOTA||
 c.treatRuskAsBiscuit||c.treatWaferAsSeparateFSSR||
 c.usePre2021BiscuitFatAcidity||c.applyFriedNoodleAcidValueToNonFried||
 c.skipSeasoningRegulations||c.allEvidenceComplete)
 return hold("INDEPENDENT_CURRENT_ACTUAL_SKU_AND_CTR_ARTICLE_ASSESSMENT_REQUIRED",
  "Source identity and example standards cannot legally approve a formula, lot or sample result",
  row.source_FSSR);
 return hold("OFFICIAL_BAKERY_PASTA_FSSR_SOURCE_ONLY__CTR_LEGAL_ARTICLE_HOLD",
  "Named FSSR source found, but actual SKU, processing, original Gazettes, full CTR/micro/additive/label and laboratory evidence remain pending",
  row.source_FSSR);
}
