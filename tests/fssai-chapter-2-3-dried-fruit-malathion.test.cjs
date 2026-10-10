"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),helper=path.join(root,"fssai-product-helper-preview-01");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const standards=read("fssai-product-helper-preview-01/data/rules/chapter-2-3-fruit-vegetable-v1.json").standards;
const manifest=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const source=db.chapter_2_3_dried_fruit_exact_malathion_v9;
const html=fs.readFileSync(path.join(helper,"index.html"),"utf8");
const from=html.indexOf("function sourcePinnedDriedFruitMalathion(p){");
const to=html.indexOf("function exactFruitVegCommodityReview(p){",from);
assert.ok(from>=0&&to>from);
const ctx=vm.createContext({contaminantsDb:db});
vm.runInContext(html.slice(from,to),ctx);
const call=p=>vm.runInContext("sourcePinnedDriedFruitMalathion("+JSON.stringify(p)+")",ctx);
test("Official Version IX Malathion Dried fruits 8 mg/kg source is exact and residue definition retained",()=>{
 assert.equal(source.verified_product_identities.length,3);
 assert.equal(source.commodity_article,"Dried fruits");
 assert.match(source.pesticide_name,/malathion and malaoxon/);
 const result=(db.residue_mrls.pesticides||[]).flatMap(pest=>pest.name===source.pesticide_name?pest.rows.filter(x=>x.food===source.commodity_article):[]);
 assert.equal(result.length,1);assert.equal(Number(result[0].mrl),8);assert.equal(result[0].unit,"mg/kg");
 const fresh=(db.residue_mrls.pesticides||[]).flatMap(pest=>pest.name===source.pesticide_name?pest.rows.filter(x=>x.food==="Fruits"):[]);
 assert.equal(fresh.length,1);assert.equal(Number(fresh[0].mrl),4);
 assert.equal(source.copy_fresh_fruit_4mgkg_prohibited,true);assert.equal(source.automatic_compliance_pass,false);
});
test("Exactly three source-matched dried-fruit standards have partial commodity reference but no compliance PASS",()=>{
 const selectedIds=new Set(source.verified_product_identities.map(x=>x.catalog_id));
 assert.equal(selectedIds.size,3);
 for(const row of source.verified_product_identities){
  const p=catalogue.find(x=>x.id===row.catalog_id);
  assert.ok(p);assert.equal(p.name,row.product_name);assert.equal(p.fssr,row.fssr);
  assert.ok(standards.some(x=>x.name===p.name&&x.key===p.fssr));
  assert.equal(manifest.records.some(x=>x.catalog_id===p.id),false,"Partial source evidence must not remain in no-exact queue");
  const v=call(p);assert.ok(v,p.id);assert.equal(v.limit,8);assert.equal(v.unit,"mg/kg");
  assert.equal(v.article,"Dried fruits");assert.equal(v.compliance_approved,false);
 }
 for(const excluded of source.excluded_catalog_ids){
   const product=catalogue.find(x=>x.id===excluded);
   assert.ok(product);assert.equal(call(product),null);
 }
});
test("Changed value, unit, residue definition, version or catalogue identity withholds source reference",()=>{
 const p=catalogue.find(x=>x.id===source.verified_product_identities[0].catalog_id);
 for(const kind of ["value","unit","pesticide","version"]){
  const clone=structuredClone(db);
  if(kind==="value")clone.residue_mrls.pesticides.find(x=>x.name===source.pesticide_name).rows.find(x=>x.food==="Dried fruits").mrl="9";
  if(kind==="unit")clone.residue_mrls.pesticides.find(x=>x.name===source.pesticide_name).rows.find(x=>x.food==="Dried fruits").unit="mg/L";
  if(kind==="pesticide")clone.chapter_2_3_dried_fruit_exact_malathion_v9.pesticide_name="Malathion";
  if(kind==="version")clone.source_version="Version X";
  ctx.contaminantsDb=clone;assert.equal(call(p),null,kind);
 }
 ctx.contaminantsDb=db;
 assert.equal(call({...p,name:"Dates"}),null);
 assert.equal(call({...p,fssr:"2.3.47(4)"}),null);
});
