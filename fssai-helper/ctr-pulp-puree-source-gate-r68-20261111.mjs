const spec=Object.freeze({
"concentrated-vegetable-pulp-puree":["2.3.13","14.1.2.4",2,false,true],
"04-04-2-vegetable-pulp-puree-with-preservatives-for-industrial-use-only":["2.3.16","04.2.2.6",null,true,false],
"04-04-2-concentrated-vegetable-pulp-puree-with-preservatives-for-industrial-use-only":["2.3.17","04.2.2.6",2,true,false]
});
const deny=status=>Object.freeze({status,sourceOnly:true,legalProductPASS:false,commercialRelease:false,autoCTR:false});
export function checkR68(r,id,claim={}){
if(!r||r.review_id!=="PMSV_R68_2026_11_11"||r.original_catalogue!==533||
r.original_CTR_legal_article_holds!==137||r.previous_focused_cases!==64||
r.new_focused_cases!==3||r.cumulative_focused_cases!==67||r.outside_selected_focused_rounds!==70||
r.new_CTR_article_decisions!==0||r.new_legal_product_approvals!==0||r.new_batch_releases!==0||
r.original_R29_R50_modified!==false||r.product_master_modified!==false||
r.live_helper_modified!==false||r.numeric_engine_modified!==false||
r.PR_2_draft_unmerged!==true||r.Ayurveda_raw_source_gaps!==14||
r.source?.original_Gazette_amendments_fully_reconciled!==false||
JSON.stringify(r.source?.pdf_pages_zero_based_visually_checked)!=="[23,24,25,26]")
return deny("SOURCE_INTEGRITY_HOLD");
if(typeof id!=="string"||!Object.hasOwn(spec,id))return deny("OUT_OF_SCOPE");
if(!Array.isArray(r.products)||r.products.length!==3||
new Set(r.products.map(x=>x.id)).size!==3)return deny("SOURCE_INTEGRITY_HOLD");
for(const p of r.products){
const e=spec[p.id];
if(!e||p.fssr!==e[0]||p.fpc!==e[1]||p.concentration_factor_min!==e[2]||
p.industrial_only!==e[3]||p.heat_preservation_required!==e[4]||
p.rigid_fill_percent_water_capacity_min!==90||p.water_capacity_temp_c!==20||
p.actual_SKU_commodity_processing_and_pack_verified!==false||
p.current_original_Gazette_CTR_and_full_product_law_reconciled!==false||
p.validated_lot_results_available!==false||p.legal_product_PASS!==false||
p.commercial_batch_release!==false||p.numeric_CTR_auto_applied!==false)
return deny("SOURCE_INTEGRITY_HOLD");
}
const c=claim&&typeof claim==="object"&&!Array.isArray(claim)?claim:{};
if(["apply2xToUnconcentrated","assumeIndustrialUseExempt","borrowSoupTSS",
"assumeAllProductsHeatSterile","assignGenericCTR","assumeUniversal2Brix",
"legalPASS","releaseBatch","assumeCurrentGazetteReconciled"].some(k=>c[k]===true))
return deny("ACTUAL_SKU_EFFECTIVE_LAW_AND_LAB_REVIEW_REQUIRED");
return deny("FSSR_2_3_13_16_17_SOURCE__PRODUCT_CTR_HOLD");
}
