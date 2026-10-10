"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/fssai-26-cross-family-condition-review-2026-10-10.json"),"utf8"));
const pending=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json"),"utf8"));
assert.equal(data.count,26);
assert.equal(data.records.length,26);
assert.equal(data.remaining_pending_after_review,156);
const pendingById=new Map(pending.records.map(x=>[x.catalog_id,x]));
assert.equal(new Set(data.records.map(x=>x.catalog_id)).size,26);
for(const row of data.records){
 assert.match(row.official_source,/^https:\\/\\/(?:www\\.)?fssai\\.gov\\.in\\//);
 assert.equal(row.full_compliance_pass,false);
 assert.equal(row.exact_identity_source_evidence_claimed,false);
 assert.equal(row.numeric_limit_auto_applied,false);
 assert.equal(row.source_named_article_applies_to_finished_identity,false);
 assert.equal(row.evidence_status,"review_only_pending_exact_applicability");
 assert.ok(row.qualifier.length>15);
 const live=pendingById.get(row.catalog_id);
 assert.ok(live,"Pending identity missing: "+row.catalog_id);
 assert.equal(live.product_name,row.product_name);
 assert.equal(live.fssr,row.fssr);
 if(row.source_article_candidate){
  assert.equal(row.source_article_candidate.parameter,"Lead");
  assert.ok(row.source_article_candidate.limit>0);
  assert.ok(row.source_article_candidate.pdf_page>=2);
 }
}
assert.equal(pending.count,156);
assert.equal(pending.pending,156);
console.log("PASS 26 individual fail-closed conditional source-gate records; 156 remain unresolved.");
