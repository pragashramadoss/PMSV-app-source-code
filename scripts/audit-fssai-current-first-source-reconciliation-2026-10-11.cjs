#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),base=path.join(root,"fssai-product-helper-preview-01/data");
const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),"utf8"));
const catalogue=read("standard-search-index-v1.json").products;
const initial=read("rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const delta=read("rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const decisions=read("rules/fssai-153-source-article-applicability-adjudications-2026-10-11.json");
const core=read("rules/contaminants-v9-core.json");
const official="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
assert.equal(catalogue.length,533);assert.equal(initial.records.length,121);
assert.equal(initial.prior_partial_exact,412);assert.equal(initial.unresolved_first_source,121);
assert.equal(delta.original_pending_first_exact,121);
assert.equal(delta.original_partial_exact_evidence,412);
assert.equal(delta.newly_source_matched_product_count,2);
assert.equal(delta.full_compliance_approvals,0);
assert.equal(delta.official_contaminants_source,official);
assert.equal(core.source_version,"Version IX (03.02.2026)");
assert.equal(core.official_sources[0].url,official);
assert.equal(decisions.records.length,153);assert.equal(decisions.full_compliance_passes,0);
const index=new Map(catalogue.map(p=>[p.id,p]));
const starting=new Map(initial.records.map(p=>[p.catalog_id,p]));
const promotes=new Set;
const positive=[];
for(const x of delta.records){
 const product=index.get(x.catalog_id),old=starting.get(x.catalog_id);
 assert.ok(product&&old,"Promoted ID must have been unresolved");
 assert.equal(x.product_name,product.name);assert.equal(x.fssr,product.fssr);assert.equal(x.fcs,product.fcs);
 assert.equal(x.source_identity_positive,true);assert.equal(x.source_rows_verified,true);
 assert.equal(x.complete_contaminant_panel,false);assert.equal(x.regulatory_sample_pass,false);
 assert.equal(x.not_a_finished_lot_compliance_pass,true);
 assert.equal(x.applicable_source_rows.length,2);
 for(const row of x.applicable_source_rows){
  const ref=core.crop_contaminants[row.source_group];
  assert.equal(ref.unit,"µg/kg");
  assert.equal((ref.rules||[]).filter(r=>r.article===x.source_product_article&&Number(r.limit)===row.limit).length,1);
  assert.ok(decisions.records.some(d=>d.catalog_id===x.catalog_id&&d.legal_article_applicability==="CONFIRMED_NAMED_COMPOSITE_ARTICLE_POSITIVE"&&
   d.contaminant===row.contaminant&&d.source_row_id===(row.source_group==="aflatoxin_b1"?"aflatoxin-b1-composite":"total-aflatoxins-composite")));
 }
 assert.ok(!promotes.has(x.catalog_id));promotes.add(x.catalog_id);
 positive.push({catalog_id:x.catalog_id,product_name:product.name,fssr:x.fssr,fcs:x.fcs,
  first_source_status:"PARTIAL_EXACT_FINISHED_FOOD_SOURCE_MATCH",
  official_regulation:delta.official_contaminants_source,official_recipe:delta.official_recipe_source,
  verified_article:x.source_product_article,named_rows:x.applicable_source_rows,
  sample_pass:false,complete_coverage:false});
}
assert.equal(promotes.size,2);
const remaining=[...starting.values()].filter(p=>!promotes.has(p.catalog_id)).map(p=>({
 catalog_id:p.catalog_id,product_name:p.product_name,fssr:p.fssr,fcs:p.fcs,
 status:"FIRST_EXACT_SOURCE_STILL_PENDING",conditional_reference_article_count:p.named_article_references_review_only.length,
 scope_decisions:decisions.records.filter(r=>r.catalog_id===p.catalog_id).map(r=>({
  source_row_id:r.source_row_id,disposition:r.legal_article_applicability,
  requires:r.positive_proof_to_establish
 })),
 first_source_verified:false,full_compliance_pass:false
}));
assert.equal(remaining.length,119);
assert.equal(new Set(remaining.map(r=>r.catalog_id)).size,119);
assert.deepEqual(new Set([...promotes,...remaining.map(r=>r.catalog_id)]),new Set(starting.keys()));
const counts={};
for(const r of decisions.records)counts[r.legal_article_applicability]=(counts[r.legal_article_applicability]||0)+1;
assert.deepEqual(counts,{DIRECT_FINISHED_ARTICLE_EXCLUDED:53,SUBTYPE_PROCESSING_PROOF_REQUIRED:96,CONFIRMED_NAMED_COMPOSITE_ARTICLE_POSITIVE:4});
const result={
 schema_version:"1.0",as_of:"2026-10-11",source_policy:"Official FSSAI/FoSCoS sources exclusively",
 note:"This reconciles the original archived 412/121 snapshot against 2 later source-verified finished-food article matches; reference exclusions do not constitute first-source promotions.",
 original_catalogue:533,original_partial:412,original_first_source_pending:121,
 current_partial_first_source:414,current_first_source_pending:119,newly_promoted_source_only:2,
 full_finished_food_compliance_passes:0,source_article_link_decisions:153,
 article_link_status_counts:counts,positively_source_matched_products:positive,unresolved_first_source_products:remaining
};
const dir=path.join(root,"audit-output");fs.mkdirSync(dir,{recursive:true});
const dest=path.join(dir,"fssai-current-first-source-533-reconciliation.json");
fs.writeFileSync(dest,JSON.stringify(result,null,2)+"\n");
console.log("PASS: 533 total; historical 412 partial/121 pending; current 414 partial/119 pending; 0 finished-food compliance approvals");
console.log("PASS: 153 source-article decisions reconciled: 53 direct-article exclusions, 96 conditional, 4 positive links for 2 products");
console.log("REPORT "+dest);
