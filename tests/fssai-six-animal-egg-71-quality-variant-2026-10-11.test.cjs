#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(cat.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const st=html.indexOf("function pendingContaminantReviewNotice(p){"),en=html.indexOf("function renderProductContaminants(){",st);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(st,en),ctx);
const ui=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
const rows=m.records.filter(r=>r.chapter_2_5_variant_quality_provisions_2026_10_11);
test("all 71 numeric product-quality values for six animal/egg identities remain variant-scoped, not CTR MRLs",()=>{
 assert.equal(rows.length,6);assert.equal(m.pending,126);assert.equal(m.verified_evidence_added,138);
 assert.equal(m.chapter_2_5_variant_quality_provisions_summary_2026_10_11.six_products,6);
 assert.equal(m.chapter_2_5_variant_quality_provisions_summary_2026_10_11.form_specific_quality_numeric_entries,71);
 let count=0;
 for(const r of rows){
  const q=r.chapter_2_5_variant_quality_provisions_2026_10_11,p=byId.get(r.catalog_id);
  assert.ok(p);
  assert.equal(q.catalog_id,p.id);assert.equal(q.product_name,p.name);assert.equal(q.fssr,p.fssr);
  assert.equal(q.numeric_quality_criteria_not_ctr_mrl,true);
  assert.equal(q.criteria_apply_only_after_subtype_selection,true);
  assert.equal(q.any_lab_sample_compliance_pass,false);
  assert.equal(q.pesticide_processing_factor_validated,false);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  assert.match(q.official_source,/^https:\/\/www\.fssai\.gov\.in/);
  assert.ok(q.source_pdf_page_one_based>=14&&q.source_pdf_page_one_based<=29);
  const output=ui(p);
  assert.match(output,/11 October rabbit\/egg product-standard composition — VARIANT-SPECIFIC, NOT MRL/);
  assert.match(output,/NOT a pesticide MRL/);
  assert.match(output,/NO LAB PASS/);
  assert.match(output,/Confirm product variant, actual lab tests, CTR MRL applicability/);
  for(const variant of q.variants){
   assert.ok(variant.sample_condition.length>20);
   assert.ok(output.includes(variant.name));
   for(const x of variant.quality_criteria){
    assert.ok(x.parameter);
    assert.match(x.regulation_type,/NOT a pesticide MRL/);
    assert.ok(Number.isFinite(x.minimum)||Number.isFinite(x.maximum));
    if(x.minimum!==undefined&&x.maximum!==undefined)assert.ok(x.minimum<=x.maximum);
    count++;
   }
  }
  assert.doesNotMatch(ui({...p,fssr:"changed"}),/11 October rabbit\/egg product-standard composition/);
 }
 assert.equal(count,71);
});
test("Rabbit meat FSSR 2.5.2(6) source ranges are moisture 72.5–75%, protein 20–23%, fat 1–6% for both identities",()=>{
 for(const r of rows.filter(r=>r.catalog_id.includes("rabbit"))){
  const q=r.chapter_2_5_variant_quality_provisions_2026_10_11;
  assert.equal(q.variants.length,1);
  const cr=q.variants[0].quality_criteria;
  assert.deepEqual(cr.map(x=>[x.parameter,x.minimum,x.maximum]),[["Moisture",72.5,75],["Protein",20,23],["Fat",1,6]]);
  assert.equal(q.fssr,"2.5.2(6)");
 }
});
test("Frozen and liquid egg contents must select white/yolk/whole variant before solids, protein, fat, pH",()=>{
 for(const id of ["10-10-2-frozen-egg-products","10-10-2-liquid-egg-products"]){
  const r=rows.find(x=>x.catalog_id===id),q=r.chapter_2_5_variant_quality_provisions_2026_10_11;
  assert.equal(q.variants.length,3);
  assert.deepEqual(q.variants.map(x=>x.quality_criteria[0].minimum),[10.5,40,22]);
  assert.deepEqual(q.variants.map(x=>x.quality_criteria[1].minimum),[0.05,25,9.8]);
  assert.deepEqual(q.variants.map(x=>x.quality_criteria[2].minimum),[10,15,10.5]);
  assert.deepEqual(q.variants.map(x=>x.quality_criteria[3].minimum),[8.5,5.9,7]);
 }
});
test("Dried egg 2% moisture limit applies to each distinct white/yolk/whole ingredient",()=>{
 const r=rows.find(x=>x.catalog_id==="10-10-2-egg-powder"),q=r.chapter_2_5_variant_quality_provisions_2026_10_11;
 assert.equal(q.variants.length,3);
 assert.deepEqual(q.variants.map(x=>x.quality_criteria.find(z=>z.parameter==="Moisture").maximum),[2,2,2]);
 assert.deepEqual(q.variants.map(x=>x.quality_criteria.find(z=>z.parameter==="Total solids").minimum),[91.5,95,95]);
});
test("Pickled egg oil- and vinegar-based recipes remain distinct and non-transferable to raw egg pesticide sample",()=>{
 const r=rows.find(x=>x.catalog_id==="10-10-3-pickled-eggs"),q=r.chapter_2_5_variant_quality_provisions_2026_10_11;
 assert.equal(q.variants.length,2);
 assert.match(q.variants[0].sample_condition,/1:1\.25/);
 assert.match(q.variants[1].sample_condition,/70:30/);
 assert.ok(q.variants[1].quality_criteria.find(x=>x.parameter.includes("Egg mass")).minimum===69);
 assert.ok(q.variants[1].quality_criteria.find(x=>x.parameter.includes("Egg mass")).maximum===71);
 assert.ok(q.variants.every(v=>v.quality_criteria.some(x=>x.parameter==="Maturation time"&&x.minimum===48)));
});
