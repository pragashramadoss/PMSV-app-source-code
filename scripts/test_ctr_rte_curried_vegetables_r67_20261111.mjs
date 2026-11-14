import assert from "node:assert/strict";
import fs from "node:fs";
import {checkR67} from "../fssai-helper/ctr-rte-curried-vegetables-source-gate-r67-20261111.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-rte-curried-vegetables-r67-2026-11-11.json");
const r50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r66=rd("fssai-helper/ctr-thermally-processed-fruit-vegetable-r66-2026-11-11.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(r50.records.length,137);
assert.equal(r66.cumulative_focused_count,63);
const original=r50.records.find(x=>x.id===r.record.catalogue_id);
assert.ok(original);assert.equal(original.priority,"P2");
assert.equal(original.fssr,r.record.source_FSSR);
assert.equal(original.fcs,r.record.source_FPC);
assert.equal(original.currentLegalArticleAdjudicated,false);
assert.equal(checkR67(r).status,"OFFICIAL_FSSR_2_3_4_SOURCE__CTR_PRODUCT_HOLD");
for(const name of ["borrowSoupTSS5","borrowTomatoSoupTSS7","borrowVegetableDrainedWeight",
"assumeCommercialSterility","assumeMilkFree","autoSelectRawVegetableCTR",
"assumeAllCurrentGazettesReviewed","legalPASS","releaseLot","applyNumericCTR"]){
 const d=checkR67(r,{[name]:true});assert.equal(d.status,"INDEPENDENT_ACTUAL_SKU_LEGAL_LAB_REVIEW_REQUIRED");
 assert.equal(d.legalProductPASS,false);
}
for(const f of [x=>x.record.source_rigid_container_fill_min_percent_of_water_capacity=80,
 x=>x.record.source_specific_TSS_minimum_printed_in_2_3_4=5,
 x=>x.record.source_FSSR="2.3.5",
 x=>x.record.commercial_release_authorized=true,
 x=>x.cumulative_unique_focused_cases=65,
 x=>x.new_legal_product_approvals=1,
 x=>x.source_pdf_pages_zero_based_visually_checked=[]]){
 const t=structuredClone(r);f(t);assert.equal(checkR67(t).status,"SOURCE_INTEGRITY_HOLD");
}
assert.equal(r.new_CTR_article_decisions_closed,0);
assert.equal(r.outside_selected_focused_rounds,73);
console.log("R67 PASS: FSSR 2.3.4 original P2 case, 64 focused, 137 legal holds, 0 approvals.");
