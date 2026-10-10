"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/fssai-26-cross-family-condition-review-2026-10-10.json"),"utf8"));
const pending=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json"),"utf8"));
assert.equal(data.count,26);
assert.equal(data.records.length,26);
assert.equal(data.remaining_pending_after_review,156); // historical review snapshot
const pendingById=new Map(pending.records.map(x=>[x.catalog_id,x]));
const promoted=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/fssai-25-beverage-confectionery-fungi-v9-source-evidence-2026-10-10.json"),"utf8"));
const promotedIds=new Set(promoted.matched.map(x=>x.catalog_id));
const newer=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/fssai-batch40-exact-commodity-and-conditional-scope-v1.json"),"utf8"));
const laterPromotedIds=new Set(newer.rows.map(x=>x.catalog_id));
assert.equal(new Set(data.records.map(x=>x.catalog_id)).size,26);
for(const row of data.records){
 assert.ok(row.official_source.startsWith("https://fssai.gov.in/"));
 assert.equal(row.full_compliance_pass,false);
 assert.equal(row.exact_identity_source_evidence_claimed,false);
 assert.equal(row.numeric_limit_auto_applied,false);
 assert.equal(row.source_named_article_applies_to_finished_identity,false);
 assert.equal(row.evidence_status,"review_only_pending_exact_applicability");
 assert.ok(row.qualifier.length>15);
 const live=pendingById.get(row.catalog_id);
 if(!live){
  assert.ok(promotedIds.has(row.catalog_id)||laterPromotedIds.has(row.catalog_id),"Product missing from all partial/provisional source indices: "+row.catalog_id);
 }else{
  assert.equal(live.product_name,row.product_name);
  assert.equal(live.fssr,row.fssr);
 }
 if(row.source_article_candidate){
  assert.equal(row.source_article_candidate.parameter,"Lead");
  assert.ok(row.source_article_candidate.limit>0);
  assert.ok(row.source_article_candidate.pdf_page>=2);
 }
}
assert.equal(pending.count,136);
assert.equal(pending.pending,136);
assert.equal(data.records.filter(x=>pendingById.has(x.catalog_id)).length,23);
assert.equal(data.records.filter(x=>laterPromotedIds.has(x.catalog_id)).length,1);
assert.equal(data.records.filter(x=>promotedIds.has(x.catalog_id)).length,2);
console.log("PASS 26 original fail-closed source gates; 2 previously promoted and 1 later source-matched; 136 remain unresolved.");
