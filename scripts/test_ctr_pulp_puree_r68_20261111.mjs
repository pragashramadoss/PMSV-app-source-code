import assert from "node:assert/strict";
import fs from "node:fs";
import {checkR68} from "../fssai-helper/ctr-pulp-puree-source-gate-r68-20261111.mjs";
const rd=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=rd("fssai-helper/ctr-pulp-puree-industrial-concentrates-r68-2026-11-11.json");
const r50=rd("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r67=rd("fssai-helper/ctr-rte-curried-vegetables-r67-2026-11-11.json");
const master=rd("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);assert.equal(r50.records.length,137);
assert.equal(r67.cumulative_unique_focused_cases,64);assert.equal(r.cumulative_focused_cases,67);
assert.equal(r.outside_selected_focused_rounds,70);assert.equal(r.products.length,3);
for(const p of r.products){
const old=r50.records.find(x=>x.id===p.id);
assert.ok(old);assert.equal(old.fssr,p.fssr);assert.equal(old.fcs,p.fpc);
assert.equal(old.priority,"P2");assert.equal(old.currentLegalArticleAdjudicated,false);
assert.equal(checkR68(r,p.id).status,"FSSR_2_3_13_16_17_SOURCE__PRODUCT_CTR_HOLD");
for(const c of ["apply2xToUnconcentrated","assumeIndustrialUseExempt","borrowSoupTSS","assumeAllProductsHeatSterile","assignGenericCTR","assumeUniversal2Brix","legalPASS","releaseBatch","assumeCurrentGazetteReconciled"])
assert.equal(checkR68(r,p.id,{[c]:true}).status,"ACTUAL_SKU_EFFECTIVE_LAW_AND_LAB_REVIEW_REQUIRED");
}
assert.deepEqual(r.products.map(x=>x.concentration_factor_min),[2,null,2]);
for(const m of [x=>x.products[1].concentration_factor_min=2,x=>x.products[2].industrial_only=false,x=>x.products[0].heat_preservation_required=false,x=>x.products[0].rigid_fill_percent_water_capacity_min=80,x=>x.new_legal_product_approvals=1,x=>x.source.original_Gazette_amendments_fully_reconciled=true]){
const t=structuredClone(r);m(t);assert.equal(checkR68(t,r.products[0].id).status,"SOURCE_INTEGRITY_HOLD");
}
assert.equal(checkR68(r,"not-original").status,"OUT_OF_SCOPE");
console.log("R68 PASS: 3 original cases, 67 focused, 137 CTR legal holds, zero approvals.");
