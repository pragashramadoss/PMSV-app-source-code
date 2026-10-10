"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read(base+"data/rules/contaminants-v9-core.json");
const chapter=read(base+"data/rules/chapter-2-4-cereals-v1.json");
const products=read(base+"data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const ids=[
 ["06-06-8-soybean-beverages-and-related-products","Soybean Beverages and Related Products"],
 ["06-06-8-soybean-curd-and-related-products","Soybean Curd and Related Products"],
 ["06-06-8-compressed-soybean-curd","Compressed Soybean Curd"],
 ["06-06-8-dehydrated-soybean-curd-film","Dehydrated Soybean Curd Film"],
 ["06-06-8-tofu","Tofu"]
];
const official="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf";
const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);
assert.ok(start>=0&&end>start);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(start,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(r=>
 String(r.source_basis||"").includes("non-fermented soybean finished product, source-matched shared B1 categories"));
test("Exact 2.4.30 product identities are locked to current official Chapter 2.4",()=>{
 assert.ok(chapter.official_sources.some(s=>s.url===official));
 const st=chapter.standards.find(x=>x.key==="2.4.30");
 assert.equal(st.name,"Non-Fermented Soybean Products");
 assert.equal(st.source_verified_identity.official_source_url,official);
 assert.equal(st.source_verified_identity.source_compendium,"Version 4 (07.05.2025)");
 assert.equal(st.source_verified_identity.allow_cross_product_auto_inheritance,false);
 assert.equal(st.source_verified_identity.complete_contaminant_compliance,false);
 assert.equal(st.source_verified_identity.approved_exact_catalogue_identities.length,5);
 for(const [id,name] of ids){
  const p=products.find(x=>x.id===id);
  assert.ok(p,id);assert.equal(p.fssr,"2.4.30");assert.equal(p.name,name);
  assert.ok(st.source_verified_identity.approved_exact_catalogue_identities.some(x=>
   x.catalog_id===id&&x.product_name===name&&x.fssr===p.fssr));
 }
});
test("Both official oilseed and composite-food B1 source articles are checked",()=>{
 const group=db.crop_contaminants.aflatoxin_b1;
 assert.equal(group.unit,"µg/kg");
 for(const article of ["Oilseeds, ready to eat","Food product containing any of the above mentioned food articles"])
  assert.equal(group.rules.filter(x=>x.article===article&&x.limit===10).length,1);
 for(const [id] of ids){
  const p=products.find(x=>x.id===id);
  assert.deepEqual(run(p).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]],id);
  assert.equal(run({...p,name:"Other soy product"}).length,0);
  assert.equal(run({...p,fssr:"2.4.39"}).length,0);
 }
});
test("Changed Version IX B1 source rows, units or version fail closed for each exact product",()=>{
 for(const change of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(r=>r.article==="Oilseeds, ready to eat").limit=12},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(r=>r.article!=="Oilseeds, ready to eat")},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.source_version="Version VIII"}
 ]){
  const d=structuredClone(db);change(d);ctx.contaminantsDb=d;
  for(const [id] of ids)assert.deepEqual(run(products.find(x=>x.id===id)),[],id);
 }
 ctx.contaminantsDb=db;
});
test("Audit recognizes exact partial B1 evidence; no automatic Total Aflatoxins or complete PASS",()=>{
 assert.match(audit,/official_v9_exact_nonfermented_soybean_b1_partial/);
 assert.match(audit,/exact_nonfermented_soybean_b1:nonFermentedSoybeanB1Evidence/);
 assert.match(audit,/identity\.approved_exact_catalogue_identities\.length!==5/);
 assert.match(audit,/complete_contaminant_compliance:false/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
});
