"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-3-fungi-agaric-conditional-v1.json");
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const master=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const begin=html.indexOf("function productContaminantGateNotices(p){");
const end=html.indexOf("\nfunction ",begin+40);
assert.ok(begin>=0&&end>begin,"Conditional contaminant UI function must be available");
const context=vm.createContext({
 contaminantsDb:db,
 fungiAgaricConditionalDb:chapter,
 sourcePinnedDirectStandardLimit:()=>false,
 esc:x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;")
});
vm.runInContext(html.slice(begin,end),context);
const choose=id=>master.find(p=>p.id===id);
test("UI renders conditional mushroom agaric acid source note for all 10 Chapter 2.3.62 identities",()=>{
 assert.match(html,/let fungiAgaricConditionalDb=null/);
 assert.match(html,/chapter-2-3-fungi-agaric-conditional-v1\.json\?v=1/);
 for(const item of chapter.records){
   const out=context.productContaminantGateNotices(choose(item.catalog_id));
   assert.match(out,/Agaric acid — mushroom species verification/);
   assert.match(out,/100 ppm/);
   assert.match(out,/Confirmed edible mushroom genus\/species/);
   assert.match(out,/conditional reference only, not a regulatory PASS/);
 }
});
test("UI withholds numeric source if current data row or effective version changes",()=>{
 const original=context.contaminantsDb;
 for(const mutate of [
  x=>x.naturally_occurring_toxic_substances.agaric_acid.find(r=>r.article==="Food containing mushrooms").limit=101,
  x=>x.naturally_occurring_toxic_substances.agaric_acid.find(r=>r.article==="Food containing mushrooms").unit="mg/kg",
  x=>x.source_version="Version VIII"
 ]){
   const changed=structuredClone(db);mutate(changed);context.contaminantsDb=changed;
   const out=context.productContaminantGateNotices(choose("04-04-2-dried-fungi"));
   assert.match(out,/numeric rule is withheld/);
   assert.doesNotMatch(out,/100 ppm/);
 }
 context.contaminantsDb=original;
});
test("Unrelated foods and product name mismatch cannot inherit fungi agaric review",()=>{
 assert.equal(context.productContaminantGateNotices({id:"04-04-2-dried-fungi",name:"Cocoa Beans",fssr:"2.3.62"}).includes("Agaric acid"),false);
 assert.equal(context.productContaminantGateNotices(choose("04-04-2-cocoa-beans")).includes("Agaric acid"),false);
});
test("Species-only note does not flow into unconditional finished-product contaminant limit generator",()=>{
 const begin=html.indexOf("function productBaselineContaminantRules(p){");
 const end=html.indexOf("\nfunction ",begin+35);
 assert.ok(begin>0&&end>begin);
 const body=html.slice(begin,end);
 assert.ok(!body.includes("fungiAgaricConditionalDb"));
 assert.equal(chapter.auto_apply,false);
});
