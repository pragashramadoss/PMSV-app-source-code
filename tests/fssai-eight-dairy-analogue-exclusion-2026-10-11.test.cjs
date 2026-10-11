#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),get=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=get("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=get("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(cat.map(p=>[p.id,p]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);const render=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
test("eight different FCS dairy analogue identities have the same explicit non-milk FSSR 2.1.1 source guard",()=>{
 const rows=m.records.filter(r=>r.official_fssai_dairy_analogue_definition_2026_10_11);
 assert.equal(rows.length,8);assert.equal(m.official_fssai_dairy_analogue_definition_2026_10_11_summary.exact_identities,8);
 assert.equal(m.pending,126);assert.equal(m.verified_evidence_added,138);
 assert.equal(new Set(rows.map(r=>r.catalog_id)).size,8);
 assert.equal(new Set(rows.map(r=>r.product_name)).size,1);
 for(let r of rows){
  const x=r.official_fssai_dairy_analogue_definition_2026_10_11,p=byId.get(r.catalog_id);
  assert.ok(p);
  assert.equal(x.catalogue_id,p.id);assert.equal(x.product_name,p.name);assert.equal(x.fssr,p.fssr);
  assert.equal(x.legal_source_subclause,"2.1.1, 3(f)(i) inserted proviso and 1(aa) definition");
  assert.equal(x.no_numeric_ctr_source_inferred,true);
  assert.equal(x.no_automatic_milk_mrl,true);
  assert.equal(x.no_compliance_pass,true);
  assert.match(x.legally_excluded_identity,/not considered milk, milk products or composite milk products/);
  assert.match(x.prohibited_assumption,/does not exempt the product/);
  assert.match(x.official_chapter_source,/^https:\/\/fssai\.gov\.in/);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  assert.match(render(p),/11 October official 2\.1\.1 dairy analogue — NOT ordinary milk/);
  assert.match(render(p),/No complete contaminant compliance established/);
  assert.match(render(p),/must not be assigned milk-only/);
  assert.doesNotMatch(render({...p,fssr:"2.1.2"}),/11 October official 2\.1\.1 dairy analogue/);
 }
 const fcs=rows.map(r=>r.catalog_id.split("-").slice(0,3).join("-")).sort();
 assert.deepEqual(fcs,["01-01-3","01-01-4","01-01-5","01-01-6","01-01-7","02-02-2","02-02-3","02-02-4"]);
});
