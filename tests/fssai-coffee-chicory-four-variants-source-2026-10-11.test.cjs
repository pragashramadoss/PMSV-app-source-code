#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const p=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products.find(p=>p.id==="coffee-chicory-mixture");
const r=m.records.find(r=>r.catalog_id===p.id),q=r.official_coffee_chicory_four_variants_2026_10_11;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8"),a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const ui=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
test("Coffee-Chicory is four different 2.10.4 FSSR products, each with its own source quality table",()=>{
 assert.equal(q.catalog_id,p.id);assert.equal(q.fssr,p.fssr);assert.equal(q.product_name,p.name);
 assert.equal(q.variants.length,4);
 assert.equal(new Set(q.variants.map(v=>v.name)).size,4);
 assert.equal(m.coffee_chicory_source_variants_summary_2026_10_11.numeric_quality_entries,22);
 assert.equal(q.no_ctr_numeric_automatic_assignment,true);
 assert.equal(q.no_finished_sample_compliance_pass,true);
 assert.equal(q.ota_mixture_applicability_proven,false);
 assert.equal(q.precise_variant_selected,false);
 assert.equal(r.auto_apply_numeric_limit,false);
 assert.equal(m.pending,126);
 assert.match(q.official_chapter2_10_pdf,/fssai\.gov\.in/);
 let n=0;
 for(const v of q.variants){
  assert.ok(v.name.length>15);
  for(const a of v.quality_criteria){
   assert.ok(a.value>0);
   assert.ok(["<=",">="].includes(a.operator));
   assert.match(a.basis,/QUALITY, NOT CTR OTA|dry basis|by mass/);
   n++;
  }
 }
 assert.equal(n,22);
 const output=ui(p);
 assert.match(output,/11 October Coffee-Chicory — FOUR SUBTYPES, SOURCE QUALITY ≠ OTA COMPLIANCE/);
 assert.match(output,/QUALITY NOT CONTAMINANT MRL/);
 assert.match(output,/actual coffee\/chicory finished-food applicability NOT verified/);
 assert.doesNotMatch(ui({...p,name:"Coffee"}),/11 October Coffee-Chicory/);
});
test("Regular coffee caffeine minimum and decaf caffeine maximum are not interchanged",()=>{
 const expected=[
 {name:"Roasted and ground",moist:5,ash:7.5,caffeine:0.6,op:">="},
 {name:"Instant",moist:4,ash:10,caffeine:1.4,op:">="},
 {name:"Decaffeinated roasted and ground",moist:5,ash:7.5,caffeine:0.1,op:"<="},
 {name:"Decaffeinated instant",moist:4,ash:10,caffeine:0.3,op:"<="}
 ];
 for(let i=0;i<expected.length;i++){
  let v=q.variants[i],e=expected[i],get=k=>v.quality_criteria.find(x=>x.parameter===k);
  assert.ok(v.name.toLowerCase().includes(e.name.toLowerCase()),i);
  assert.deepEqual([get("Coffee fraction").value,get("Coffee fraction").operator],[51,">="]);
  assert.deepEqual([get("Moisture").value,get("Total ash").value],[e.moist,e.ash]);
  assert.deepEqual([get("Caffeine").value,get("Caffeine").operator],[e.caffeine,e.op]);
  assert.deepEqual([v.has_decaffeinated_coffee,v.processing==="instant_soluble"],[i>=2,i%2===1]);
 }
 assert.equal(q.conditional_reference_limit,5);assert.equal(q.ota_unit,"µg/kg");
 assert.equal(q.official_ochratoxin_a_named_article,"Wheat, wheat bran, rye, barley, coffee");
});
