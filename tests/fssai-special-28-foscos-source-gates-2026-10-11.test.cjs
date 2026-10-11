#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const rd=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=rd("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=rd("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(cat.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const render=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
const rows=m.records.filter(r=>r.special_foscos_identity_matrix_2026_10_11);
test("all 28 special FoSCoS identities have five safeguarded product/applicability checks",()=>{
 assert.equal(cat.length,533);
 assert.equal(m.pending,126);assert.equal(m.records.length,126);assert.equal(m.verified_evidence_added,138);
 assert.equal(m.special_foscos_28_identity_summary_2026_10_11.reviewed,28);
 assert.equal(m.special_foscos_28_identity_summary_2026_10_11.groups,13);
 assert.equal(m.special_foscos_28_identity_summary_2026_10_11.new_first_exact_ctr_matches,0);
 assert.equal(rows.length,28);assert.equal(new Set(rows.map(r=>r.catalog_id)).size,28);
 for(const r of rows){
  const p=byId.get(r.catalog_id),q=r.special_foscos_identity_matrix_2026_10_11;
  assert.ok(p,p?.id||r.catalog_id);
  assert.equal(r.regulatory_family,"special");
  assert.equal(q.catalog_id,p.id);assert.equal(q.product_name,p.name);assert.equal(q.fssr,p.fssr);
  assert.equal(q.five_required_ingredient_process_and_source_qualifiers.length,5);
  assert.ok(q.five_required_ingredient_process_and_source_qualifiers.every(v=>v.length>20));
  assert.ok(q.exact_product_identity_required.length>30);
  assert.ok(q.illegal_article_transfer_to_block.length>30);
  assert.equal(q.auto_apply_metal_mycotoxin_or_pesticide_limit,false);
  assert.equal(q.finished_product_compliance_result,false);
  assert.equal(q.confirms_specific_ctr_product_article,false);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  assert.equal(q.official_foscos_source,"https://fcstraining.fssai.gov.in/standard-product");
  assert.match(q.official_ctr_source,/fssai\.gov\.in/);
  const shown=render(p);
  assert.match(shown,/11 October special FoSCoS product — mandatory ingredient and source qualifications/);
  assert.match(shown,/Product-specific contaminant limits and compliance remain unresolved/);
  assert.match(shown,/NOT APPLIED/);
  assert.doesNotMatch(render({...p,name:"forged food"}),/11 October special FoSCoS product/);
 }
});
test("Ayurveda Aahara category 102 and Indian sweets 18 are distinct food category routes, not source articles",()=>{
 const ayur=rows.filter(r=>r.catalog_id.startsWith("102-"));
 const sweets=rows.filter(r=>r.catalog_id.startsWith("18-"));
 assert.equal(ayur.length,8);assert.equal(sweets.length,6);
 for(const r of ayur){
  const q=r.special_foscos_identity_matrix_2026_10_11;
  assert.equal(q.official_foscos_category,"102");
  assert.ok(q.specific_extra_safeguards.some(x=>x.includes("not itself FSSR")));
 }
 for(const r of sweets){
  const q=r.special_foscos_identity_matrix_2026_10_11;
  assert.equal(q.official_foscos_category,"18");
  assert.ok(q.specific_extra_safeguards.some(x=>x.includes("not automatically a product-specific contaminant limit")));
 }
});
test("Special enzyme, polyol, acidity regulator, dried seeds and dietary category don't inherit substitute values",()=>{
 for(const id of ["99-99-1-acidity-regulators-l-tartaric-acid","99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc","11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th","04-04-1-edible-dried-seeds-obtained-from-fruits","formulated-supplements-children"]){
  const r=rows.find(x=>x.catalog_id===id);assert.ok(r,id);
  assert.equal(r.special_foscos_identity_matrix_2026_10_11.confirms_specific_ctr_product_article,false);
  assert.match(render(byId.get(id)),/Official FoSCoS products/);
 }
});
