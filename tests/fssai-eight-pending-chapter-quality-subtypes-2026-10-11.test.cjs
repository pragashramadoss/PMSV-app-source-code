#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),dir="fssai-product-helper-preview-01/data/";
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=load(dir+"rules/fssai-eight-pending-chapter-quality-subtypes-2026-10-11.json");
const catalogue=load(dir+"standard-search-index-v1.json").products;
const chapters=[
"chapter-2-1-dairy-v1.json","chapter-2-4-cereals-v1.json",
"chapter-2-7-sweets-confectionery-v1.json","chapter-2-8-sweetening-honey-v1.json"
].map(x=>load(dir+"rules/"+x));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const begin=html.indexOf("function sourcePinnedEightPendingQualityHtml(p){"),
      end=html.indexOf("function sourcePinnedSevenOfficialProductQualityHtml(p){",begin);
assert.ok(begin>0&&end>begin,"Quality panel must appear before existing seven-product panel");
const esc=s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const context=vm.createContext({eightPendingQualityDb:structuredClone(manifest),chapterRuleDbs:structuredClone(chapters),esc});
vm.runInContext(html.slice(begin,end),context);
const draw=p=>vm.runInContext("sourcePinnedEightPendingQualityHtml("+JSON.stringify(p)+")",context);
const original=context.eightPendingQualityDb;
const product=id=>catalogue.find(x=>x.id===id);
test("The 8 previously pending product identities remain separate from chemical contaminant clearance",()=>{
 assert.equal(catalogue.length,533);
 assert.equal(manifest.partial_first_source,412);
 assert.equal(manifest.first_exact_source_pending,121);
 assert.equal(manifest.finished_product_compliance_passes,0);
 assert.equal(manifest.automatic_ctr_assignments,0);
 assert.equal(manifest.records.length,8);
 assert.equal(manifest.records.reduce((n,r)=>n+r.forms.length,0),11);
 assert.equal(manifest.records.reduce((n,r)=>n+r.forms.reduce((s,f)=>s+f.criteria.length,0),0),61);
 assert.equal(new Set(manifest.records.map(x=>x.catalog_id)).size,8);
 for(const row of manifest.records){
   const p=product(row.catalog_id);
   assert.ok(p,row.catalog_id);
   assert.equal(row.product_name,p.name);
   assert.equal(row.fssr,p.fssr);
   assert.equal(row.fcs,p.fcs);
   const doc=chapters.find(x=>x.chapter===row.fssr.split(".").slice(0,2).join("."));
   assert.ok(doc&&doc.official_sources[0].url===row.official_source);
   assert.equal(row.first_exact_contaminant_evidence_added,false);
   assert.equal(row.complete_compliance_pass,false);
   for(const f of row.forms){
      assert.equal(f.product_variant_verified,false);
      assert.equal(f.compliance_pass,false);
      assert.equal(f.numeric_finished_food_contaminant_limit_applied,false);
   }
 }
});
test("Two new jaggery panels render while six existing verified product panels are not duplicated",()=>{
 assert.match(html,/fssai-eight-pending-chapter-quality-subtypes-2026-10-11\.json/);
 assert.match(html,/eightPendingQualityDb=await res\.json/);
 assert.match(html,/\+sourcePinnedEightPendingQualityHtml\(p\)/);
 for(const row of manifest.records){
   const displayed=draw(product(row.catalog_id));
   if(row.fssr==="2.8.4(1)"||row.fssr==="2.8.4(2)"){
     assert.match(displayed,/REVIEW ONLY \/ NOT CTR MRL/);
     assert.match(displayed,/No PASS is issued/);
     assert.match(displayed,/Official FSSAI Chapter/);
     assert.doesNotMatch(displayed,/source withheld/);
   } else {
     assert.equal(displayed,"","Existing six chapter-quality panels must remain the only visible panel");
   }
 }
 assert.equal(draw(product("05-05-1-chocolate")),"");
});
test("Cocoa mass, cocoa cake and the two Khandsari sugar varieties retain independent exact source values",()=>{
 const cocoa=manifest.records.find(r=>r.fssr==="2.7.8");
 assert.equal(cocoa.forms.find(f=>f.label.includes("Cocoa mass")).criteria.find(c=>c.source_field==="cocoa_shell_max_pct_alkali_free").value,1.75);
 assert.equal(cocoa.forms.find(f=>f.label==="Cocoa cake").criteria.find(c=>c.source_field==="cocoa_shell_max_pct_alkali_free").value,4.5);
 const sugar=manifest.records.find(r=>r.fssr==="2.8.1(3)");
 assert.equal(sugar.forms.length,2);
 assert.ok(sugar.forms[0].criteria.some(c=>c.parameter==="Sucrose"&&c.value===96.5));
 assert.ok(sugar.forms[1].criteria.some(c=>c.parameter==="Sucrose"&&c.value===93));
});
test("2025 superseding IgG standard prevents older colostrum total-immunoglobulin values from being used",()=>{
 const row=manifest.records.find(r=>r.fssr==="2.1.23"),p=product(row.catalog_id);
 assert.equal(row.forms[0].criteria.find(x=>x.source_field==="immunoglobulins_g_igg_min_pct").value,1.8);
 assert.equal(row.forms[1].criteria.find(x=>x.source_field==="immunoglobulins_g_igg_min_pct").value,8.5);
 assert.match(html,/superseded 12\.5% total-immunoglobulin figure/);
 const replacement=structuredClone(manifest);
 replacement.records.find(x=>x.fssr==="2.1.23").forms[1].criteria.find(x=>x.source_field==="immunoglobulins_g_igg_min_pct").value=12.5;
 context.eightPendingQualityDb=replacement;
 assert.match(draw(product("11-11-1-gur-or-jaggery")),/source withheld/);
 context.eightPendingQualityDb=original;
});
test("Manifest, source, subtype, source basis and cross-product corruption all fail closed",()=>{
 const target=product("11-11-1-gur-or-jaggery");
 const changes=[
   x=>x.records.find(r=>r.fssr==="2.8.7").forms[0].criteria[0].value=999,
   x=>x.records.find(r=>r.fssr==="2.4.9").forms[0].criteria[0].unit="mg/kg",
   x=>x.records.find(r=>r.fssr==="2.7.8").forms[0].source_node.cocoa_butter_pct_range=[40,90],
   x=>x.records.find(r=>r.fssr==="2.8.1(3)").forms[0].product_variant_verified=true,
   x=>x.records.find(r=>r.fssr==="2.1.23").additional_effective_amendment_source="https://example.org/fake.pdf",
   x=>x.records.find(r=>r.fssr==="2.8.4(2)").forms.pop(),
   x=>x.records.find(r=>r.fssr==="2.8.7").forms[0].compliance_pass=true,
   x=>x.records.pop(),
   x=>x.source_qualified_criteria=60
 ];
 for(const change of changes){
   context.eightPendingQualityDb=structuredClone(manifest);change(context.eightPendingQualityDb);
   assert.match(draw(target),/source withheld/);
 }
 context.eightPendingQualityDb=original;
 const chaptersCopy=context.chapterRuleDbs;
 context.chapterRuleDbs=structuredClone(chapters);
 context.chapterRuleDbs.find(x=>x.chapter==="2.1").standards.find(x=>x.key==="2.1.20").composition[0].moisture_max_pct=50;
 assert.match(draw(target),/source withheld/);
 context.chapterRuleDbs=chaptersCopy;
 assert.match(draw({...target,name:"Adulterated edible lactose"}),/source withheld/);
});
