"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-9-salt-spices-condiments-v1.json");
const pending=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const start=html.indexOf("function sourcePinnedSpiceAflatoxinRule(p,rule){");
const stop=html.indexOf("function productBaselineContaminantRules(p){",start);
assert.ok(start>0&&stop>start);
const ctx={contaminantsDb:db,normIngredient:s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()};
vm.runInNewContext(html.slice(start,stop),ctx);
const records=[
 ["12-12-2-dried-mango-slices","Dried Mango Slices","2.9.23"],
 ["12-12-2-dried-mango-powder-amchur","Dried Mango Powder (Amchur)","2.9.24"]
];
test("Dried mango exact FSSR 2.9 identities are classified as FoSCoS 12.2.1 spices",()=>{
 for(const [id,name,fssr] of records){
  const product=catalogue.find(x=>x.id===id),rule=chapter.standards.find(x=>x.key===fssr);
  assert.ok(product&&rule);
  assert.equal(product.name,name);assert.equal(product.fssr,fssr);assert.equal(product.fcs,"12.2.1");
  assert.equal(rule.name,name);
  const matches=db.spice_crop_contaminant_identity_mappings_v9.filter(x=>x.catalog_id===id);
  assert.equal(matches.length,1);
  assert.equal(matches[0].fssr,fssr);assert.equal(matches[0].fcs,"12.2.1");
  assert.equal(matches[0].product_name,name);assert.equal(matches[0].article,"Spices/Spice Mix");
  assert.equal(matches[0].full_compliance_verified,false);
  assert.equal(pending.records.some(x=>x.catalog_id===id),false);
 }
 assert.equal(pending.pending,136);assert.equal(pending.verified_evidence_added,128);
});
test("Two independent aflatoxin rows are source-verified and fail closed on altered numerical values or units",()=>{
 for(const [id] of records){
  const p=catalogue.find(x=>x.id===id);
  const m=db.spice_crop_contaminant_identity_mappings_v9.find(x=>x.catalog_id===id);
  for(const [contaminant,limit,key,field] of [
   ["Total Aflatoxins",30,"total_aflatoxins","total_aflatoxins_limit"],
   ["Aflatoxin B1",15,"aflatoxin_b1","aflatoxin_b1_limit"]]){
   const candidate={contaminant,article:m.article,limit:m[field],unit:m.unit};
   assert.equal(db.crop_contaminants[key].rules.filter(x=>x.article==="Spices/Spice Mix"&&x.limit===limit).length,1);
   assert.equal(ctx.sourcePinnedSpiceAflatoxinRule(p,candidate),true,id+" "+contaminant);
   assert.equal(ctx.sourcePinnedSpiceAflatoxinRule(p,{...candidate,limit:limit+1}),false);
   assert.equal(ctx.sourcePinnedSpiceAflatoxinRule(p,{...candidate,unit:"mg/kg"}),false);
   assert.equal(ctx.sourcePinnedSpiceAflatoxinRule(p,{...candidate,article:"Nuts: ready to eat"}),false);
   const wrong=structuredClone(db);
   wrong.crop_contaminants[key].rules=wrong.crop_contaminants[key].rules.filter(x=>x.article!==m.article);
   ctx.contaminantsDb=wrong;assert.equal(ctx.sourcePinnedSpiceAflatoxinRule(p,candidate),false);
   ctx.contaminantsDb=db;
  }
 }
});
test("Dried mango spice mapping does not leak to seasonings or other mango products",()=>{
 const m=db.spice_crop_contaminant_identity_mappings_v9.find(x=>x.catalog_id===records[0][0]);
 const c={contaminant:"Total Aflatoxins",article:m.article,limit:30,unit:"µg/kg"};
 for(const variant of ["12-12-2-seasoning","04-04-1-thermally-processed-mango-pulp","12-12-2-asafoetida-hing-or-hingra"]){
  const p=catalogue.find(x=>x.id===variant);
  if(p)assert.equal(ctx.sourcePinnedSpiceAflatoxinRule(p,c),false,variant);
 }
 const p=catalogue.find(x=>x.id===m.catalog_id);
 assert.equal(ctx.sourcePinnedSpiceAflatoxinRule({...p,name:"Raw Mango"},c),false);
 assert.equal(ctx.sourcePinnedSpiceAflatoxinRule({...p,id:"12-12-2-seasoning"},c),false);
 assert.equal(ctx.sourcePinnedSpiceAflatoxinRule({...p,fssr:"2.9.31"},c),false);
 assert.equal(ctx.sourcePinnedSpiceAflatoxinRule({...p,fcs:"12.2.2"},c),false);
 assert.equal(pending.full_compliance_achieved,0);
});
