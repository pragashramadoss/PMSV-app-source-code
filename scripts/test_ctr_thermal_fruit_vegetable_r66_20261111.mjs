import assert from "node:assert/strict";
import fs from "node:fs";
import {checkR66} from "../fssai-helper/ctr-thermal-fruit-vegetable-source-gate-r66-20261111.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-thermally-processed-fruit-vegetable-r66-2026-11-11.json");
const r50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r65=rd("fssai-helper/ctr-edible-fungi-ten-styles-r65-2026-11-11.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);assert.equal(r50.records.length,137);
assert.equal(r65.R65_cumulative_unique_focused_cases,60);
assert.equal(r.cumulative_focused_count,63);assert.equal(r.outside_selected_focused_rounds,74);
assert.equal(r.product_records.length,3);
for(const x of r.product_records){
const old=r50.records.find(z=>z.id===x.id);
assert.ok(old);assert.equal(old.priority,"P2");assert.equal(old.fssr,x.fssr);assert.equal(old.fcs,x.fpc);
assert.equal(checkR66(r,x.id).status,"OFFICIAL_SOURCE_VERIFIED__PRODUCT_CTR_HOLD");
for(const claim of ["legalPASS","release","applyCTR","borrowCocktailDenominator","applySauce25ToAllVegetables","applyBrixToUnsweetenedWater","assumeCommercialSterility","assumeAllGazettesVerified"]){
assert.equal(checkR66(r,x.id,{[claim]:true}).status,"INDEPENDENT_SKU_LAW_LAB_REVIEW_REQUIRED");
}}
for(const change of [
x=>x.product_records[0].source_requirements.liquid_pack_drained_weight_min_pct_of_net_contents=25,
x=>x.product_records[1].source_requirements.drained_weight_min_pct_of_distilled_water_capacity=40,
x=>x.product_records[2].source_requirements.liquid_pack_edible_fungi_vegetables_including_baked_beans_in_sauce_min_pct_net_contents=50,
x=>x.product_records[2].legal_product_PASS=true,
x=>x.legal_product_PASS_count=1,
x=>x.official_source.source_page_images_checked=true]){
const t=structuredClone(r);change(t);assert.equal(checkR66(t,r.product_records[0].id).status,"INTEGRITY_HOLD");
}
assert.equal(checkR66(r,"unknown").status,"OUT_OF_SCOPE");
console.log("R66 PASS: three original IDs; 63 selected focused; 137 legal holds; zero approvals.");
