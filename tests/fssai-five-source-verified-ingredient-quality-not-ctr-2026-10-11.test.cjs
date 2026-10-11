#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(cat.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8"),a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const render=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
const rows=m.records.filter(r=>r.verified_chapter_quality_only_2026_10_11);
test("Five exact source-verified FSSAI product quality standards are never contaminant MRLs",()=>{
 assert.equal(rows.length,5);
 assert.equal(m.verified_chapter_quality_only_2026_10_11_summary.reviewed,5);
 assert.equal(m.verified_chapter_quality_only_2026_10_11_summary.new_independent_product_standard_quality_criteria,12);
 assert.equal(m.verified_chapter_quality_only_2026_10_11_summary.new_exact_ctr_contaminant_article_matches,0);
 assert.equal(m.pending,126);assert.equal(m.verified_evidence_added,138);
 let total=0;
 for(const r of rows){
  const q=r.verified_chapter_quality_only_2026_10_11,p=byId.get(r.catalog_id);
  assert.ok(p);
  assert.equal(q.catalog_id,p.id);assert.equal(q.product_name,p.name);assert.equal(q.fssr,p.fssr);
  assert.match(q.official_fssai_chapter_source,/^https:\/\/(www\.)?fssai\.gov\.in/);
  assert.ok(Number.isInteger(q.pdf_page_one_based)&&q.pdf_page_one_based>0);
  assert.equal(q.requires_actual_test_results,true);
  assert.equal(q.new_exact_contaminant_match,false);
  assert.equal(q.finished_product_compliance_pass,false);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  const shown=render(p);
  assert.match(shown,/11 October verified FSSAI product-standard quality values — NOT CONTAMINANT MRLs/);
  assert.match(shown,/Real test results and applicable CTR contaminants remain separately unresolved/);
  assert.match(shown,/NOT a CTR MRL/);
  for(const x of q.quality_criteria){
   assert.ok(x.parameter&&["<=",">="].includes(x.operator)&&typeof x.value==="number"&&x.value>0);
   assert.match(x.article_type,/NOT CTR/);
   assert.ok(shown.includes(String(x.value)+" "+x.unit),p.id);
   total++;
  }
  assert.doesNotMatch(render({...p,name:"modified product"}),/verified FSSAI product-standard quality/);
 }
 assert.equal(total,12);
});
test("Sulphated ash for lactose, total ash for trehalose and sodium for salt substitutes cannot be interchanged",()=>{
 const get=id=>m.records.find(r=>r.catalog_id===id).verified_chapter_quality_only_2026_10_11.quality_criteria;
 let lact=get("11-11-1-edible-lactose");
 assert.ok(lact.some(x=>x.parameter==="Sulphated ash"&&x.value===0.3&&x.unit==="% (m/m)"));
 let tre=get("99-99-1-trehalose");
 assert.ok(tre.some(x=>x.parameter==="Total ash"&&x.value===0.05));
 assert.equal(tre.some(x=>x.parameter.includes("Sulphated")),false);
 let salt=get("12-12-1-salt-substitutes");
 assert.ok(salt.some(x=>x.parameter==="Sodium content"&&x.value===120&&x.unit==="mg/100 g mixture"));
 let pan=get("100-100-pan-masala");
 assert.ok(pan.some(x=>x.parameter.startsWith("Total ash")&&x.value===8));
 let dex=get("99-99-7-dietary-fibre-dextrin-soluble-fibre");
 assert.deepEqual(dex.map(x=>x.value),[12,25]);
});
