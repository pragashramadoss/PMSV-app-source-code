const expected={
"04-04-1-thermally-processed-fruits":["2.3.1","04.1.2.4","fruits"],
"04-04-1-thermally-processed-fruit-salad-cocktail-mix":["2.3.2","04.1.2.4","fruit_salad"],
"04-04-2-thermally-processed-vegetables":["2.3.3","04.2.2.4","vegetables"]};
const hold=(status)=>({status,sourceOnly:true,legalProductPASS:false,batchRelease:false,numericAutoApply:false});
export function checkR66(r,id,claim={}){
if(!r||r.review_id!=="PMSV_R66_2026_11_11"||r.original_catalogue_count!==533||
r.original_CTR_article_holds!==137||r.prior_R65_focused_count!==60||
r.new_focused_count!==3||r.cumulative_focused_count!==63||r.outside_selected_focused_rounds!==74||
r.legal_product_PASS_count!==0||r.batch_releases!==0||r.CTR_article_decisions_closed!==0||
r.original_R29_R50_modified!==false||r.master_modified!==false||
r.live_helper_modified!==false||r.numeric_engine_modified!==false||r.PR_2_draft_unmerged!==true||
r.official_source?.source_page_images_checked!==false||
r.official_source?.original_Gazette_currentness_reconciled!==false)
return hold("INTEGRITY_HOLD");
if(!Object.hasOwn(expected,id))return hold("OUT_OF_SCOPE");
const p=r.product_records;
if(!Array.isArray(p)||p.length!==3||new Set(p.map(x=>x.id)).size!==3)return hold("INTEGRITY_HOLD");
for(const x of p){
const e=expected[x.id],s=x.source_requirements;
if(!e||x.fssr!==e[0]||x.fpc!==e[1]||x.style!==e[2]||!s||
x.actual_SKU_commodity_recipe_pack_and_process_verified!==false||
x.actual_test_results_and_methods_verified!==false||
x.current_Gazette_and_all_amendments_legally_reconciled!==false||
x.exact_finished_CTR_article_legally_decided!==false||
x.legal_product_PASS!==false||x.batch_release_authorized!==false||
x.numeric_rule_auto_applied!==false||s.rigid_container_fill_min_pct_of_water_capacity!==90)
return hold("INTEGRITY_HOLD");
if(x.style==="fruits"&&(s.liquid_pack_drained_weight_min_pct_of_net_contents!==50||
s.solid_pack_drained_weight_min_pct_of_net_contents!==70))return hold("INTEGRITY_HOLD");
if(x.style==="fruit_salad"&&(s.drained_weight_min_pct_of_distilled_water_capacity!==50||
JSON.stringify(s.sugared_juice_or_syrup_brix_classifications)!==JSON.stringify([
{name:"extra_light",min:10,max:13.9},{name:"light",min:14,max:17.9},
{name:"heavy",min:18,max:21.9},{name:"extra_heavy",min:22,max:null}])||
s.blemished_pieces_max_per_100g_drained_fruit!==2||
s.peel_area_cm2_max_per_500g_total_contents!==6.5||
s.seed_extraneous_g_max_per_500g_total_contents!==2))return hold("INTEGRITY_HOLD");
if(x.style==="vegetables"&&(s.liquid_pack_edible_fungi_vegetables_including_baked_beans_in_sauce_min_pct_net_contents!==25||
s.liquid_pack_other_vegetables_min_pct_net_contents!==50||
s.solid_pack_drained_weight_min_pct_net_contents!==70||
s.vegetable_names_and_percentage_ranges_on_label!==true))return hold("INTEGRITY_HOLD");
}
if(["legalPASS","release","applyCTR","borrowCocktailDenominator","applySauce25ToAllVegetables",
"applyBrixToUnsweetenedWater","assumeCommercialSterility","assumeAllGazettesVerified"].some(k=>claim?.[k]===true))
return hold("INDEPENDENT_SKU_LAW_LAB_REVIEW_REQUIRED");
return hold("OFFICIAL_SOURCE_VERIFIED__PRODUCT_CTR_HOLD");
}
