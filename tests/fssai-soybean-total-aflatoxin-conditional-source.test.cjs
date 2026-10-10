"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/";
const db=read(base+"data/rules/contaminants-v9-core.json");
const idx=read(base+"data/standard-search-index-v1.json");
const review=read(base+"data/reviews/chapter-2-4-30-soybean-aflatoxin-evidence-v1.json");
const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const aud=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const data=db.chapter_2_4_nonfermented_soybean_total_aflatoxin_conditional_v9;
const start=html.indexOf("function sourcePinnedSoybeanTotalAflatoxinReview(p){");
const end=html.indexOf("\nfunction productBaselineContaminantRules(p){",start);
assert.ok(start>0&&end>start,"Missing source-pinned conditional panel function");
const ctx=vm.createContext({contaminantsDb:db});
vm.runInContext(html.slice(start,end),ctx);
const check=(p)=>ctx.sourcePinnedSoybeanTotalAflatoxinReview(p);
test("exact five FSSAI 2.4.30 identities are the only conditional total-aflatoxin matches",()=>{
 assert.equal(data.records.length,5);
 assert.equal(review.records.length,5);
 for(const r of data.records){
  const p=idx.products.find(x=>x.id===r.catalog_id);
  assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);
  assert.equal(check(p).verified,true);
  assert.equal(check(p).not_auto_applied,true);
  assert.equal(check({...p,fssr:"2.4.39"}).verified,false);
  assert.equal(check({...p,name:"Soybean derivative"}).verified,false);
  assert.equal(review.records.find(x=>x.catalog_id===r.catalog_id).total_aflatoxins_auto_assigned,false);
 }
 for(const name of ["Fermented Soybean Curd","Soybean","Soy Protein Products","SOYBEAN SAUCE"]){
  const p=idx.products.find(x=>x.name===name);
  assert.ok(p);
  assert.equal(check(p).relevant,false);
 }
 assert.equal(data.records.find(x=>x.catalog_id==="06-06-8-tofu").subclause,"5","Tofu is distinct from curd");
});
test("the source table difference 20 vs 15 is reviewed, never silently applied",()=>{
 for(const r of data.records){
  const result=check(idx.products.find(x=>x.id===r.catalog_id));
  assert.equal(result.conditional_limit,20);assert.equal(result.raw_oilseed_comparison,15);
  assert.equal(result.full_compliance_verified,false);
 }
 assert.match(html,/sourcePinnedSoybeanTotalAflatoxinReview\(p\)/);
 assert.match(html,/\+soybeanTotalHtml/);
 assert.match(aud,/source_verified_conditional_not_auto_applied/);
 assert.match(aud,/auto_applied:false/);
});
test("source table edit, units, document version and duplicate IDs all fail closed",()=>{
 const p=idx.products.find(x=>x.id==="06-06-8-tofu");
 for(const mutate of [
   d=>d.crop_contaminants.total_aflatoxins.rules.find(x=>x.article===data.applicable_article_for_review).limit=200,
   d=>d.crop_contaminants.total_aflatoxins.rules.find(x=>x.article===data.comparison_raw_oilseed_article).limit=16,
   d=>d.crop_contaminants.total_aflatoxins.unit="mg/kg",
   d=>d.source_version="Version VIII",
   d=>d.chapter_2_4_nonfermented_soybean_total_aflatoxin_conditional_v9.records.push(structuredClone(data.records[0])),
   d=>d.chapter_2_4_nonfermented_soybean_total_aflatoxin_conditional_v9.not_auto_applied=false
 ]){
  const copy=structuredClone(db);mutate(copy);ctx.contaminantsDb=copy;
  assert.equal(check(p).verified,false);
 }
 ctx.contaminantsDb=db;
 assert.equal(check(p).verified,true);
});
