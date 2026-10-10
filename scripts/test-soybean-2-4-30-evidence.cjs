#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const file=path.join(__dirname,"../fssai-product-helper-preview-01/data/reviews/chapter-2-4-30-soybean-aflatoxin-evidence-v1.json");
const data=JSON.parse(fs.readFileSync(file,"utf8"));
assert.equal(data.records.length,5);
assert.equal(new Set(data.records.map(r=>r.identity)).size,5);
assert.equal(data.source_section,"2.2.1");
assert.equal(data.distinct_oilseed_limits.total_aflatoxins,15);
for(const record of data.records){
 assert.equal(record.standard,"2.4.30");
 assert.equal(record.scope,"source_verified_conditional_total_aflatoxins_not_auto_applied");
 assert.equal(record.exact_catalog_match_verified,true);
 assert.equal(record.finished_product_composite_article_applicability,"conditional_review_no_auto_apply");
 assert.equal(record.no_auto_inheritance_from,"Oilseeds or oil");
 assert.equal(record.complete_contaminant_coverage,false);
 assert.equal(record.amendments_fully_reconciled,false);
 assert.equal(record.pesticide_mrl_auto_apply,false);
 assert.deepEqual(record.candidate_contaminant_rows.map(x=>[x.parameter,x.limit,x.unit]),[["Total Aflatoxins",20,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]]);
 for(const row of record.candidate_contaminant_rows) assert.match(row.condition,/Only where exact finished product qualifies/);
}
assert.equal(data.records.find(r=>r.identity==="Tofu").tofu_alias_confirmation_required,false);
console.log("5 conditional soybean identities: validation passed. Not a full compliance verdict.");
