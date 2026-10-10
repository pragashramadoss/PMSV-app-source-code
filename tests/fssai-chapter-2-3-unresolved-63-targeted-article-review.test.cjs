#!/usr/bin/env node
"use strict";
/** Audit selected official FSSAI CTR Version IX source references, NOT compliance. */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const pending=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const byId=new Map(catalogue.map(p=>[p.id,p]));
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const source=db.official_sources[0].url;
const chapter="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf";
const rows=pending.records.filter(r=>r.regulatory_family==="2.3");
function permittedOnlyAsReview(r){
 const v=r.chapter_2_3_targeted_evidence_review_2026_10_10;
 return !!(v && v.catalog_id===r.catalog_id && v.product_name===r.product_name &&
  v.fssr===r.fssr && v.source_urls.official_version_ix_contaminants===source &&
  v.source_urls.fssai_product_standard===chapter && v.product_specific_gate.length>35 &&
  v.nontransferable_lookalike_article.length>35 && v.numeric_limit_auto_applied===false &&
  v.source_article_unconditionally_confirmed===false &&
  v.all_contaminant_pesticide_and_amendment_rules_verified===false &&
  v.legal_compliance_pass===false && r.unconditional_compliance_pass===false &&
  r.auto_apply_numeric_limit===false);
}
test("61 remaining of the original 63 Chapter 2.3 identities have individual source and matrix review, preserving the historical 164 review baseline",()=>{
 assert.equal(catalogue.length,533);
 assert.equal(pending.pending,136);
 assert.equal(pending.count,136);
 assert.equal(pending.verified_evidence_added,128);
 assert.equal(pending.full_compliance_achieved,0);
 assert.equal(rows.length,48);
 assert.equal(pending.chapter_2_3_targeted_evidence_summary_2026_10_10.reviewed,63);
 assert.equal(pending.chapter_2_3_targeted_evidence_summary_2026_10_10.remaining_unresolved,164);
 assert.equal(pending.chapter_2_3_targeted_evidence_summary_2026_10_10.numeric_limits_applied,0);
 const buckets={};
 for(const row of rows){
  const p=byId.get(row.catalog_id);
  assert.ok(p && p.name===row.product_name && p.fssr===row.fssr,row.catalog_id);
  assert.ok(permittedOnlyAsReview(row),row.catalog_id);
  const v=row.chapter_2_3_targeted_evidence_review_2026_10_10;
  assert.ok(!v.review_bucket.startsWith("unclassified"),row.catalog_id);
  assert.ok(row.review_requirements.some(q=>q.includes("Chapter 2.3 form and matrix review ("+v.review_bucket+")")));
  assert.ok(row.review_requirements.some(q=>q.includes("Source-article exclusion: ")));
  if(v.review_bucket==="fungi_processing_species_pack")assert.match(p.name,/fungi/i);
  if(/frozen/i.test(p.name)&&!/fungi/i.test(p.name))assert.match(v.review_bucket,/frozen_/i);
  buckets[v.review_bucket]=(buckets[v.review_bucket]||0)+1;
 }
 const historic={...pending.chapter_2_3_targeted_evidence_summary_2026_10_10.groups};
 // The original 63-product snapshot includes two products now promoted by
 // source-gated exact article evidence; preserve the original audit numbers.
 historic.fermented_bean_or_protein_derivative--;
 historic.diluted_beverage_vs_syrup-=9;
 delete historic.diluted_beverage_vs_syrup;
 historic.industrial_juice_concentrate_vs_puree-=4;
 historic.reconstituted_dry_soup--;
 delete historic.reconstituted_dry_soup;
 assert.deepEqual(buckets,historic);
 assert.ok(Object.keys(buckets).length>=20);
});
test("The 11 named metal source-row examples require an actual subtype and cannot be auto applied",()=>{
 const examples=rows.flatMap(r=>r.chapter_2_3_targeted_evidence_review_2026_10_10.conditional_named_articles.map(a=>({id:r.catalog_id,...a})));
 assert.equal(examples.length,11);
 assert.equal(pending.chapter_2_3_targeted_evidence_summary_2026_10_10.conditional_source_article_candidates_not_applied,11);
 const ids=new Set(examples.map(x=>x.id));
 assert.equal(ids.size,7);
 for(const x of examples){
  assert.equal(x.review_only,true,x.id);
  assert.equal(x.automatic_finished_product_limit,false,x.id);
  assert.equal(x.complete_compliance,false,x.id);
  assert.ok(x.requirement.length>20 && x.version_ix_pdf_page_one_based>=2);
  assert.ok(x.unit==="mg/kg" && x.limit>0);
  // These source article values are integrity anchors, not evidence of product compliance.
  const sourceRows=(db.metal_article_rules_v9[x.metal]||[]).filter(s=>
    s.row_type==="exact" && norm(s.article)===norm(x.official_article) &&
    Number(s.limit)===Number(x.limit) && norm(s.unit)===norm(x.unit));
  assert.equal(sourceRows.length,1,"Official Version IX source article mismatch for "+x.id+" "+x.metal+" "+x.official_article);
 }
});
test("Control negatives do not inherit canned, dry-vegetable or dairy commodity metal articles",()=>{
 const get=id=>rows.find(r=>r.catalog_id===id)?.chapter_2_3_targeted_evidence_review_2026_10_10;
 for(const id of ["04-04-1-frozen-fruits-fruit-products","04-04-2-frozen-vegetables","04-04-2-quick-frozen-fried-potatoes",
   "04-04-1-coconut-milk-non-dairy","04-04-1-date-paste","04-04-2-fungi-in-olive-oil-and-other-vegetable-oils"]){
  const v=get(id);assert.ok(v,id);assert.deepEqual(v.conditional_named_articles,[],id);
 }
 for(const x of rows){
  const v=x.chapter_2_3_targeted_evidence_review_2026_10_10;
  assert.ok(v.conditional_named_articles.every(a=>a.review_only&&!a.automatic_finished_product_limit));
 }
 const negative=structuredClone(rows[0]);
 negative.chapter_2_3_targeted_evidence_review_2026_10_10.legal_compliance_pass=true;
 assert.equal(permittedOnlyAsReview(negative),false);
});
