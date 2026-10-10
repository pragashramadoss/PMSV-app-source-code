#!/usr/bin/env node
"use strict";
/**
 * PMSV identity-conservation audit: every one of 533 FoSCoS identities is
 * either partially source-backed or missing its first exact article, not both.
 * No branch can silently promote a product because of a generic FSSR chapter.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const ix=read(base+"standard-search-index-v1.json").products;
const q=read(base+"rules/contaminants-v9-unresolved-264-review-v1.json");
const report=read("audit-output/fssai-product-readiness-audit.json");
const review=read(base+"rules/fssai-full-136-identity-applicability-review-2026-10-10.json");
const matched=read(base+"rules/fssai-next10-exact-source-candidate-2026-10-10.json");
const cross=read(base+"rules/fssai-25-beverage-confectionery-fungi-v9-source-evidence-2026-10-10.json");
const batch40=read(base+"rules/fssai-batch40-exact-commodity-and-conditional-scope-v1.json");
const ixIds=new Set(ix.map(p=>p.id));
const qIds=new Set(q.records.map(p=>p.catalog_id));
assert.equal(ix.length,533);assert.equal(ixIds.size,533);
assert.equal(report.summary.loaded,533);
assert.equal(report.products.length,533);
assert.equal(q.records.length,q.count);
assert.equal(q.pending,q.count);
assert.equal(qIds.size,q.count);
assert.equal(q.full_compliance_achieved,0);
assert.equal(q.verified_evidence_added+269+q.pending,533);
const audited=new Map(report.products.map(x=>[x.id,x]));
assert.equal(audited.size,533);
let countedPartial=0,countedPending=0;
const byFamily={},pendingProducts=[];
for(const p of ix){
 const x=audited.get(p.id);
 assert.ok(x&&x.name===p.name&&x.fssr===p.fssr&&x.fcs===p.fcs,p.id);
 assert.equal(x.compliance_decision,"not_established_by_route_evidence");
 const hasEvidence=x.contaminant_evidence_index.status==="some_exact_product_evidence_not_full_coverage";
 const needsExact=qIds.has(p.id);
 assert.notEqual(hasEvidence,needsExact,"Exactly one of partial source / unresolved applies: "+p.id);
 if(hasEvidence)countedPartial++;
 else {
  countedPending++;
  const row=q.records.find(z=>z.catalog_id===p.id);
  assert.ok(row&&row.product_name===p.name&&row.fssr===p.fssr);
  assert.equal(row.auto_apply_numeric_limit,false);
  assert.equal(row.unconditional_compliance_pass,false);
  assert.equal(row.exemption_asserted,false);
  byFamily[row.regulatory_family]=(byFamily[row.regulatory_family]||0)+1;
  pendingProducts.push({id:p.id,name:p.name,fssr:p.fssr,fcs:p.fcs,family:row.regulatory_family,
   review_status:"first_exact_source_article_required",
   complete_contaminant_and_pesticide_review:false,
   numeric_compliance_pass:false});
 }
}
assert.equal(countedPending,126);
assert.equal(countedPartial,407);
assert.equal(countedPending,q.count);
assert.equal(countedPartial,report.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage);
assert.equal(countedPartial,q.current_snapshot_summary_2026_10_10.exact_partial_evidence);
assert.equal(countedPending,q.current_snapshot_summary_2026_10_10.pending);
const original136=new Map(review.records.map(x=>[x.catalog_id,x]));
assert.equal(original136.size,136);
assert.equal(review.source_pinned_partial_matches_new,10);
assert.equal(matched.matched.length,10);
const last10=new Set(matched.matched.map(x=>x.catalog_id));
assert.equal(last10.size,10);
for(const row of matched.matched){
 const p=audited.get(row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs);
 assert.ok(original136.has(row.catalog_id));
 assert.ok(!qIds.has(row.catalog_id));
 assert.equal(p.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
 assert.equal(p.contaminant_evidence_index.exact_next10_source_article_v9.full_product_compliance_verified,false);
 assert.equal(row.finished_product_numeric_pass,false);
 assert.equal(original136.get(row.catalog_id).evidence_disposition,"partial_named_article_identity_source_only");
}
for(const row of review.records){
 assert.ok(ixIds.has(row.catalog_id));
 assert.equal(row.finished_product_compliance_pass,false);
 assert.equal(row.numeric_limit_auto_applied_to_product,false);
 if(!last10.has(row.catalog_id))assert.ok(qIds.has(row.catalog_id),"Historic 136 source review and final pending set drift: "+row.catalog_id);
}
const evidenceCollections=[
 {name:"25_article_batch",items:cross.matched},
 {name:"40_article_batch",items:batch40.rows},
 {name:"full136_new_10",items:matched.matched}
];
const recent=new Map();
for(const group of evidenceCollections){
 for(const row of group.items){
  assert.ok(ixIds.has(row.catalog_id));
  assert.ok(!recent.has(row.catalog_id),"Duplicate first-exact-source promotion between new batches: "+row.catalog_id);
  recent.set(row.catalog_id,group.name);
  assert.ok(!qIds.has(row.catalog_id),"Recent source-matched product still pending: "+row.catalog_id);
 }
}
assert.equal(recent.size,30);
const saved={
 date:"2026-10-10",product_count:533,partial_first_source_evidence:countedPartial,
 unresolved_first_source_gaps:countedPending,legal_or_laboratory_compliance_passes:0,
 source_collections_checked:3,recent_source_backed_partial_promotions_crosschecked:30,
 earlier_136_product_identity_reviews_preserved:review.records.length,
 current_pending_by_family:Object.fromEntries(Object.entries(byFamily).sort((a,b)=>a[0].localeCompare(b[0]))),
 invariant:"All 533 exactly one of partial or unresolved; all approved-compliance claims remain prohibited",
 pending_product_details:pendingProducts
};
const dest=path.join(root,"audit-output","fssai-live-first-source-ledger-533.json");
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.writeFileSync(dest,JSON.stringify(saved,null,2)+"\n");
console.log("PASS: first source-ledger 533 = 407 partial + 126 unresolved; 30 exact first-source promotions cross-checked; 136 source review histories retained; 0 compliance approvals");
