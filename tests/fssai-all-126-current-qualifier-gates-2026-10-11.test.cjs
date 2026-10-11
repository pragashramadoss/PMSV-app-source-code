#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(cat.map(p=>[p.id,p]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:v=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const ui=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
const keys=["exact_subtype_transfer_safeguard_2026_10_11","chapter_2_3_qualifier_matrix_2026_10_11","special_foscos_identity_matrix_2026_10_11","remaining_cross_family_qualifier_matrix_2026_10_11"];
test("every one of 126 unresolved IDs has EXACTLY one current five-qualifier review, no regulatory clearance",()=>{
 assert.equal(cat.length,533);assert.equal(m.records.length,126);assert.equal(m.pending,126);
 assert.equal(m.verified_evidence_added,138);assert.equal(m.full_compliance_achieved,0);
 const cnt=Object.fromEntries(keys.map(k=>[k,0]));
 for(const r of m.records){
  const active=keys.filter(k=>r[k]);
  assert.equal(active.length,1,r.catalog_id+" "+active);
  const x=r[active[0]],p=byId.get(r.catalog_id);assert.ok(p,r.catalog_id);
  assert.equal(x.catalog_id,p.id);assert.equal(x.product_name,p.name);
  cnt[active[0]]++;
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  let rendered=ui(p);
  assert.match(rendered,/11 October/);
  assert.match(rendered,/NOT APPLIED/);
  assert.match(rendered,/compliance/i);
  assert.doesNotMatch(ui({...p,fssr:"unknown-fssr"}),/11 October/);
 }
 assert.deepEqual(keys.map(k=>cnt[k]),[28,43,28,27]);
 assert.equal(Object.values(cnt).reduce((a,b)=>a+b,0),126);
});
test("27 residual cross-family products have specific five-part source gates and identity-bound display",()=>{
 const rows=m.records.filter(x=>x.remaining_cross_family_qualifier_matrix_2026_10_11);
 const sizes={};assert.equal(rows.length,27);
 for(const r of rows){
  const q=r.remaining_cross_family_qualifier_matrix_2026_10_11,p=byId.get(r.catalog_id);
  assert.equal(q.regulatory_family,r.regulatory_family);
  assert.equal(q.fssr,p.fssr);assert.equal(q.catalog_id,p.id);
  assert.equal(q.qualifier_fields_before_named_ctr_limit_may_be_checked.length,5);
  assert.equal(new Set(q.qualifier_fields_before_named_ctr_limit_may_be_checked).size,5);
  assert.ok(q.existing_precision_source_gate.length>20);
  assert.ok(q.existing_nontransferable_source_article.length>20);
  assert.match(q.official_fssai_chapter_source,/fssai\.gov\.in/);
  assert.match(q.official_ctr_source,/fssai\.gov\.in/);
  assert.equal(q.new_exact_numeric_ctr_source_match,false);
  assert.equal(q.ready_to_apply_numeric_limit,false);
  assert.equal(q.legal_compliance_pass,false);
  assert.match(ui(p),/11 October cross-family identity and matrix verification/);
  assert.match(ui(p),/Numeric product-specific source and all effective amendments still require separate verification/);
  sizes[r.regulatory_family]=(sizes[r.regulatory_family]||0)+1;
 }
 assert.deepEqual(Object.keys(sizes).sort().map(k=>[k,sizes[k]]),[["2.1",12],["2.10",2],["2.2",1],["2.5",7],["2.7",2],["2.9",2],["3.3",1]]);
});
test("no currently source-matched product receives an unresolved notice or new 11 October source gates",()=>{
 const pendingIds=new Set(m.records.map(r=>r.catalog_id));
 assert.equal(pendingIds.size,126);
 for(const p of cat){
  if(!pendingIds.has(p.id))assert.equal(ui(p),"",p.id);
 }
 assert.equal(cat.filter(p=>!pendingIds.has(p.id)).length,407);
});
