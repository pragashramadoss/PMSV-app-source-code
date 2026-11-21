/** R35 evidence-only router for original official Ayurveda Category A recipe source tables.
 * NO entire product PASS or commercial lot release. Assumptions of authoritativeness
 * must not override the 14.6/14.7 source-text alignment hold.
 */
export const SOURCE_RECIPE_ROWS=Object.freeze({
 "12.1":6,"13.1":8,"14.1":1,"14.3":2,"14.4":3,
 "14.5":5,"14.6":13,"14.7":4,"15.1":4
});
const sourceHold=new Set(["14.6","14.7"]);
const gates=Object.freeze([
 "actualSKUAndProductIdentityEstablished",
 "actualFormulaIngredientsAndRatiosCollected",
 "botanicalSpeciesAndPartsVerified",
 "recipeVariantAndAllowedSubstitutionsReviewed",
 "manufacturingProcessAndConcentrationFactorReviewed",
 "applicableCurrentOriginalLegalSourcesChecked",
 "commoditySpecificToxinsAndPesticideMRLsReviewed",
 "metalsAndVeterinaryResidueScopeReviewed",
 "microbiologicalRequirementsAndSamplingVerified",
 "methodAndAnalyticalMatrixConfirmed",
 "laboratoryEvidenceReviewed",
 "officialRecipePageImageIndependentlyConfirmed"
]);
const safe=(status,reason,extra={})=>({
 status,reason,sourceRecipeReviewOnly:true,
 independentLegalProductSignoffRequired:true,fullCurrentLawComplete:false,
 exactCTRFinishedProductArticleAdjudicated:false,
 productLegallyApproved:false,commercialLotReleaseAuthorized:false,
 numericLimitAutoApplied:false,liveEngineChanged:false,...extra
});
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const validDate=s=>{
 if(typeof s!=="string"|| !/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+"T00:00:00Z");
 return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;
};
const validSource=m=>{
 if(!isObject(m)||m.review_id!=="PMSV-R35-AYURVEDA-AHARA-2026-11-04" ||
 m.global_catalogue_total!==533||m.original_exact_CTR_article_gaps!==137||
 m.official_recipe_entries_crosslinked!==9||m.official_printed_ingredient_rows!==46 ||
 m.recipes_with_source_title_method_alignment_hold!==2 ||
 m.legal_product_CTR_article_decisions_closed!==0 ||
 m.full_product_approvals!==0||m.current_CTR_panels_verified!==0||
 m.commercial_release_authorisations!==0 ||m.deployment_changed!==false||
 !Array.isArray(m.records)||m.records.length!==9)return false;
 const keys=Object.keys(SOURCE_RECIPE_ROWS),got=new Set();
 for(const r of m.records){
  if(!isObject(r)||typeof r.catalogue_id!=="string"||
    !Object.hasOwn(SOURCE_RECIPE_ROWS,r.recipe_number)||
    r.ingredient_table_row_count!==SOURCE_RECIPE_ROWS[r.recipe_number]||
    !Array.isArray(r.ingredients) ||r.ingredients.length!==SOURCE_RECIPE_ROWS[r.recipe_number]||
    r.exact_source_recipe_composition_approved!==false||
    r.ctr_finished_food_article_applicability_adjudicated!==false||
    r.full_current_CTR_panel_verified!==false||
    r.full_product_regulatory_compliance_approved!==false||
    r.commercial_lot_release_authorized!==false||
    r.source_rows_not_auto_applied!==true||got.has(r.recipe_number))
     return false;
  if(r.ingredients.some((v,i)=>!isObject(v)||v.serial!==i+1||
    typeof v.source_name!=="string"||!v.source_name.trim()||
    typeof v.source_identity!=="string"||!v.source_identity.trim()||
    typeof v.source_ratio!=="string"||!v.source_ratio.trim()))return false;
  const isConflict=sourceHold.has(r.recipe_number);
  if(isConflict!==r.source_reconciliation_flags.includes("SOURCE_TITLE_METHOD_ALIGNMENT_REVIEW_REQUIRED")||
     (isConflict && r.route_status!=="SOURCE_RECIPE_ALIGNMENT_HOLD") ||
     (!isConflict && r.route_status!=="OFFICIAL_INGREDIENT_TABLE_RECORDED_EVIDENCE_HOLD"))return false;
  got.add(r.recipe_number);
 }
 return keys.every(k=>got.has(k));
};
export function reviewAyurvedaSourceRecipe(manifest,ctx={}){
 if(!validSource(manifest))
   return safe("SOURCE_REGISTER_INTEGRITY_HOLD","Pinned 9-recipe source register does not match expected source-safe structure");
 if(!isObject(ctx)||!validDate(ctx.assessmentDate))
   return safe("EVIDENCE_HOLD","Valid assessment date required");
 if(ctx.assessmentDate>="2026-12-01")
   return safe("POST_AMENDMENT_REVALIDATION_HOLD","New CTR effective date requires fresh source consolidation");
 const r=manifest.records.find(x=>x.catalogue_id===ctx.catalogueId);
 if(!r)return safe("CATALOGUE_ROUTE_UNKNOWN","The exact Ayurveda catalogue identity is not in the source register");
 const record={
  recipeNumber:r.recipe_number,sourceTitle:r.official_recipe_title,
  officialIngredientRows:r.ingredients.map(x=>({...x})),
  sourceUrl:r.official_document,
  sourcePrintedPages:[...r.official_printed_pages],
  sourceFlags:[...r.source_reconciliation_flags],
  evidenceRequirements:[...r.ingredient_scope_requirements]
 };
 if(ctx.confirmedRecipeNumber!==r.recipe_number)
   return safe("RECIPE_ID_MISMATCH","SKU's official recipe identifier does not exactly match catalogue", {record});
 if(sourceHold.has(r.recipe_number))
   return safe("OFFICIAL_SOURCE_TEXT_ALIGNMENT_HOLD",
   "Published 14.6/14.7 recipe title, ingredients and methods need independent source-text/corrigendum adjudication before mapping", {record});
 const missing=gates.filter(g=>ctx[g]!==true);
 if(r.recipe_number==="15.1" && !["barley","green_gram","black_gram"].includes(ctx.actualKulmashaBase)){
   missing.push("actualKulmashaBase");
 }
 if(missing.length)
   return safe("RECIPE_AND_LEGAL_EVIDENCE_HOLD","Required source, actual SKU, method and applicable analyte evidence incomplete",{record,missingEvidence:missing});
 return safe("SOURCE_INGREDIENT_REVIEW_READY_NOT_APPROVED",
   "All source-identity input flags are reported true; independent legal review remains mandatory. Never a product PASS.",{record,missingEvidence:[]});
}
export function sourceRecipeMayApproveProduct(){return false;}
