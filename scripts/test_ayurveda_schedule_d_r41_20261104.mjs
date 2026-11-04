import fs from "node:fs";
import assert from "node:assert/strict";
import {reviewAyurvedaScheduleD, AYURVEDA_RECIPE_IDS, EVIDENCE_FIELDS, RECIPE_ALIGNMENT_HOLDS} from "../fssai-helper/ayurveda-schedule-d-evidence-gate-r41-20261104.mjs";
const read=(p)=>JSON.parse(fs.readFileSync(new URL("../"+p, import.meta.url),"utf8"));
const a=read("fssai-helper/ayurveda-schedule-d-finished-product-source-r41-2026-11-04.json");
const old=read("fssai-helper/ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json");
const r35=read("fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json");
assert.equal(a.original_catalogue_unique_products,533);
assert.equal(a.original_product_CTR_article_decisions_held,137);
assert.equal(old.R40_remaining_without_raw_CTR_reference,14);
assert.equal(a.R41_original_ingredient_rows_without_CTR_source_candidates,14);
assert.equal(a.R41_additional_raw_CTR_ingredient_source_links,0);
assert.equal(a.R40_cumulative_raw_CTR_ingredient_source_links,94);
assert.equal(a.source_linked_recipes.length,9);
assert.equal(r35.records.length,9);
assert.deepEqual(new Set(a.source_linked_recipes.map(r=>r.recipe_number)),new Set(r35.records.map(r=>r.recipe_number)));
assert.deepEqual(new Set(AYURVEDA_RECIPE_IDS),new Set(r35.records.map(r=>r.recipe_number)));
assert.equal(a.schedule_D_contaminant_source_rows.length,10);
assert.equal(a.microbiology_food_safety_table.length,4);
assert.equal(a.microbiology_process_hygiene_tables.length,3);
const microbes=a.microbiology_food_safety_table;
assert.deepEqual(new Set(microbes.map(x=>x.organism)),new Set(["Salmonella","Listeria monocytogenes"]));
assert(microbes.every(x=>x.n===5&&x.c===0&&x.limit==="Absent in 25 g"));
assert(microbes.every(x=>!x.legal_product_PASS&&!x.auto_apply_to_engine));
assert(a.microbiology_process_hygiene_tables.every(x=>!x.legal_product_PASS&&!x.auto_apply_to_engine));
assert(a.microbiology_process_hygiene_tables.every(x=>x.process_hygiene_values_NOT_marketing_release_criteria===true));
const nums=Object.fromEntries(a.schedule_D_contaminant_source_rows.map(x=>[x.analyte,x.printed_maximum]));
assert.deepEqual(nums,{
Lead:2.5,Copper:30,Arsenic:1.1,Tin:250,Cadmium:1.5,Mercury:1.0,"Methyl Mercury (calculated as element)":0.25,
"Total Aflatoxins":20,"Aflatoxin B1":10,Melamine:2.5
});
assert(a.schedule_D_contaminant_source_rows.every(x=>x.auto_apply_to_engine===false&&x.whole_product_PASS===false&&x.pdf_page_image_verified===false));
assert(a.source_linked_recipes.every(x=>x.actual_SKU_recipe_and_food_class_confirmed===false&&x.legal_product_compliance_PASS===false&&x.batch_release_authorized===false));
for(const id of RECIPE_ALIGNMENT_HOLDS){
 assert.equal(reviewAyurvedaScheduleD(id,Object.fromEntries(EVIDENCE_FIELDS.map(s=>[s,true]))).status,"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");
}
for(const id of AYURVEDA_RECIPE_IDS.filter(x=>!RECIPE_ALIGNMENT_HOLDS.includes(x))){
 const bad=reviewAyurvedaScheduleD(id,{});
 assert.equal(bad.status,"SCHEDULE_D_EVIDENCE_HOLD");
 assert.equal(bad.missingEvidence.length,EVIDENCE_FIELDS.length);
 const good=reviewAyurvedaScheduleD(id,Object.fromEntries(EVIDENCE_FIELDS.map(s=>[s,true])));
 assert.equal(good.status,"SCHEDULE_D_SOURCE_REVIEW_READY");
 assert.equal(good.legalPASS,false);
 assert.equal(good.batchRelease,false);
 assert.equal(good.numericLimitsAutoApply,false);
}
assert.equal(a.schedule_C_ketaki_caution.ingredient_row_raw_CTR_cleared,false);
assert.equal(a.schedule_C_ketaki_caution.source_product_14_6_title_method_alignment_hold,true);
assert.equal(a.official_regulation_source.pdf_page_image_independently_verified,false);
assert.equal(a.exact_product_CTR_applicability_decisions_closed,0);
assert.equal(a.finished_product_compliance_approved,0);
assert.equal(a.commercial_batch_release_approved,0);
assert.equal(a.numeric_CTR_rules_modified,false);
assert.equal(a.numeric_Ayurveda_schedule_D_production_rules_modified,false);
assert.equal(a.live_PMSV_code_modified,false);
assert.equal(a.draft_PR_2_merge_authorized,false);
console.log(JSON.stringify({result:"PASS",originalRecipes:9,ScheduleDContaminantRows:10,microFoodSafetyCriteria:4,processHygieneGroups:3,unlinkedRawCTRIngredients:14,pendingProductCTRDecisions:137,legalProductApprovals:0}));
