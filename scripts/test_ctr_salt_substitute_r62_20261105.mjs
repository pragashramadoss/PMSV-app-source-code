import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR62SaltSubstitute} from "../fssai-helper/ctr-salt-substitute-source-gate-r62-20261105.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=read("fssai-helper/ctr-salt-substitute-original-gazette-r62-2026-11-05.json");
const old=read("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const queue=read("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const prior=read("fssai-helper/ctr-asafoetida-seasoning-oleoresins-r61-2026-11-05.json");
const master=read("fssai-product-helper-preview-01/data/product-master-v1.json");
const ID="12-12-1-salt-substitutes";
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(old.records.length,137);
assert.equal(queue.records.length,137);
assert.equal(prior.r61_cumulative_unique_focused_cases_selected_rounds,44);
assert.equal(prior.r61_original_cases_outside_selected_focused_rounds,93);
const a=old.records.find(x=>x.catalog_id===ID);
const b=queue.records.find(x=>x.id===ID);
assert.ok(a&&b);
assert.equal(a.fssr,"2.9.30(6)");
assert.equal(a.fcs,"12.1.2");
assert.equal(b.priority,"P3");
assert.equal(b.currentLegalArticleAdjudicated,false);
assert.equal(b.fullLegalProductPASS,false);
assert.equal(r.source_product.id,ID);
assert.equal(r.source_product.FSSR,a.fssr);
assert.equal(r.source_product.FPC,a.fcs);
assert.equal(r.previous_selected_focused_IDs,44);
assert.equal(r.new_focused_catalogue_IDs,1);
assert.equal(r.cumulative_selected_focused_IDs,45);
assert.equal(r.outside_selected_focused_IDs,92);
assert.equal(r.original_product_CTR_article_holds,137);
const gaz=r.sources.find(x=>x.kind.startsWith("original notified"));
assert.ok(gaz);
assert.equal(gaz.date,undefined);
assert.equal(gaz.pdf_page_zero_based,5);
assert.equal(gaz.visually_checked,true);
assert.equal(gaz.not_a_draft,true);
const comp=r.sources.find(x=>x.kind.startsWith("FSSR Chapter"));
assert.deepEqual(comp.pdf_pages_zero_based,[36,37,38]);
assert.equal(comp.visually_checked,true);
assert.equal(comp.compendium_reference_only,true);
const cs=r.specified_chemical_source_groups;
assert.equal(cs.length,4);
assert.deepEqual(cs.map(x=>x.source_clause),[
 "2.9.30(6)(1)(a)","2.9.30(6)(1)(b)",
 "2.9.30(6)(1)(c)","2.9.30(6)(1)(d)"
]);
assert.equal(cs[0].phosphorus_percent_m_m_max,4);
assert.equal(cs[0].ammonium_ion_percent_m_m_max,3);
assert.equal(cs[1].magnesium_percent_of_K_Ca_NH4_cation_sum_max,20);
assert.equal(cs[1].not_twenty_percent_of_whole_mixture,true);
assert.equal(cs[1].phosphorus_percent_m_m_max,4);
assert.equal(cs[2].choline_percent_m_m_max,3);
assert.equal(cs[3].use_condition,"GMP");
assert.equal(cs[3].GMP_is_not_zero_or_unrestricted_permission,true);
assert.ok(cs.every(x=>x.actual_substances_verified===false));
const v=r.other_source_conditions;
assert.equal(v.sodium_mg_per_100g_salt_substitute_mixture_max,120);
assert.equal(v.combined_colloidal_silica_or_calcium_silicate_percent_m_m_max,1);
assert.deepEqual(v.declared_cations_per_100g_mixture,[
 "sodium","potassium","calcium","magnesium","ammonium","choline"
]);
assert.deepEqual(v.salt_substitute_label_terms,[
 "low sodium salt substitute","low sodium dietetic salt"
]);
assert.equal(v.actual_formula_label_analytical_report_received,false);
const f=r.separate_low_sodium_food_source_limits;
assert.equal(f.low_sodium_final_food_mg_per_100g_as_consumed_max,120);
assert.equal(f.very_low_sodium_final_food_mg_per_100g_as_consumed_max,40);
assert.equal(f.also_requires_not_more_than_half_comparable_normal_product,true);
assert.equal(f.NOT_salt_substitute_mixture_limit,true);
assert.equal(r.original_R29_R50_unchanged,true);
assert.equal(r.product_master_unchanged,true);
assert.equal(r.operative_numeric_CTR_rules_unchanged,true);
assert.equal(r.live_PMSV_Helper_unchanged,true);
assert.equal(r.PR_2_stays_draft_unmerged,true);
assert.equal(r.new_exact_CTR_product_article_decisions_closed,0);
assert.equal(r.full_product_legal_PASS,false);
assert.equal(r.commercial_release_authorized,false);
assert.equal(r.Ayurveda_raw_ingredient_source_gaps_unchanged,14);
const good=reviewR62SaltSubstitute(r,ID);
assert.equal(good.status,"ORIGINAL_GAZETTE_SALT_SUBSTITUTE_SOURCE__SKU_EVIDENCE_HOLD");
assert.equal(good.legalProductPASS,false);
const abuse=reviewR62SaltSubstitute(r,ID,{
 legalProductPASS:true,batchRelease:true,genericMg20ProductMass:true,
 autoApplyIonLimitsWithoutComposition:true,applySaltMixtureLimitToMeal:true,
 treatGMPasZero:true,autoApproveLowSodiumClaims:true
});
assert.equal(abuse.status,"ACTUAL_COMPOSITION_CURRENT_LAW_AND_LOT_REVIEW_REQUIRED");
assert.equal(abuse.legalProductPASS,false);
assert.equal(reviewR62SaltSubstitute(r,"wrong").status,"NOT_IN_R62_SCOPE");
const altered=structuredClone(r);
altered.specified_chemical_source_groups[1].not_twenty_percent_of_whole_mixture=false;
assert.equal(reviewR62SaltSubstitute(altered,ID).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const altered2=structuredClone(r);
altered2.separate_low_sodium_food_source_limits.very_low_sodium_final_food_mg_per_100g_as_consumed_max=120;
assert.equal(reviewR62SaltSubstitute(altered2,ID).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const altered3=structuredClone(r);
altered3.full_product_legal_PASS=true;
assert.equal(reviewR62SaltSubstitute(altered3,ID).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
console.log(JSON.stringify({
 status:"PASS",new_focused:1,cumulative_unique_focused:45,
 original_CTR_legal_holds:137,actual_product_approvals:0
},null,2));
