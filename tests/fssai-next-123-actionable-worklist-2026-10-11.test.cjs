"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const x=read("audit-output/fssai-next-123-first-exact-source-research-queue.json");
const ledger=read("audit-output/fssai-live-first-source-ledger-533.json");
const c=read("fssai-product-helper-preview-01/data/rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json");
test("123 current unresolved identities have non-generic individual FSSAI questions without numbers applied",()=>{
 assert.deepEqual([x.total,x.partial,x.pending,x.full_compliance_passes],[533,410,123,0]);
 assert.equal(x.records.length,123);
 assert.equal(new Set(x.records.map(r=>r.catalog_id)).size,123);
 assert.deepEqual(new Set(x.records.map(r=>r.catalog_id)),new Set(ledger.pending_product_details.map(r=>r.id)));
 assert.equal(x.scope_nontransfer_cases,31);
 assert.equal(x.guard_source_rows,18);
 for(const r of x.records){
  assert.ok(r.product&&r.family&&typeof r.fssr==='string'&&typeof r.fcs==='string',r.catalog_id);
  assert.ok(r.case_specific_questions.length>=5,r.catalog_id);
  assert.ok(r.case_specific_questions.every(q=>q.length>25),r.catalog_id);
  assert.equal(r.status,"UNRESOLVED_FIRST_EXACT",r.catalog_id);
  assert.equal(r.numeric_finished_product_limit_applied,false,r.catalog_id);
  assert.equal(r.first_exact_source_confirmed,false,r.catalog_id);
  assert.equal(r.full_compliance_pass,false,r.catalog_id);
  assert.equal(r.exemption_asserted,false,r.catalog_id);
  for(const url of r.supporting_source_urls)assert.match(url,/^https:\/\/(www\.)?fssai\.gov\.in\//);
 }
});
test("31 identity-specific official source conflicts are included in live 123-product research worklists, still NOT applied",()=>{
 let count=0,ids=new Set();
 for(const r of x.records){
  const original=c.scope_guards.filter(g=>g.catalog_id===r.catalog_id);
  assert.equal(r.named_article_references_review_only.length,original.length,r.catalog_id);
  for(const g of original){
   const a=r.named_article_references_review_only.find(y=>y.source_reference_id===g.reference_id);
   assert.ok(a,r.catalog_id+" "+g.reference_id);
   assert.equal(a.required_applicability_or_exclusion,g.required_qualifier);
   assert.equal(a.is_applied,false);
   assert.ok(r.case_specific_questions.includes(g.required_qualifier));
   count++;ids.add(r.catalog_id);
  }
 }
 assert.equal(count,31);assert.equal(ids.size,26);
 assert.equal(x.products_with_scope_nontransfer_cases,26);
});

test("13 official Tin reference articles and 61 conditional cases survive in all 123 unresolved research worklists",()=>{
 const tin=read("fssai-product-helper-preview-01/data/rules/fssai-v9-tin-conditional-source-matrix-2026-10-11.json");
 assert.equal(x.tin_named_source_rows,13);
 assert.equal(x.tin_conditional_source_cases,61);
 assert.equal(x.tin_products_with_conditional_source_cases,36);
 let count=0;
 for(const p of x.records){
  const expected=tin.scope_guards.filter(g=>g.catalog_id===p.catalog_id);
  assert.equal(p.tin_named_article_references_review_only.length,expected.length,p.catalog_id);
  for(const g of expected){
   const row=p.tin_named_article_references_review_only.find(y=>y.source_reference_id===g.source_id);
   assert.ok(row,p.catalog_id+" "+g.source_id);
   assert.equal(row.required_applicability_or_exclusion,g.required_qualifier);
   assert.equal(row.is_applied,false);
   assert.equal(row.first_exact_source_confirmed,false);
   count++;
  }
 }
 assert.equal(count,61);
});
