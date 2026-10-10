"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const core=read(base+"data/rules/contaminants-v9-core.json");
const chapter=read(base+"data/rules/chapter-2-4-cereals-v1.json");
const products=read(base+"data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const cases=[
 ["06-06-2-solvent-extract-soya-flour","Solvent Extract Soya Flour","2.4.13(1)"],
 ["06-06-2-solvent-extracted-groundnut-flour","Solvent Extracted Groundnut Flour","2.4.13(2)"],
 ["06-06-2-solvent-extracted-sesame-flour","Solvent Extracted Sesame Flour","2.4.13(3)"],
 ["06-06-2-solvent-extracted-cotton-seed-flour","Solvent Extracted Cotton seed Flour","2.4.13(5)"],
 ["06-06-2-expeller-pressed-edible-groundnut-flour","Expeller Pressed Edible Groundnut Flour","2.4.16(2)"],
 ["06-06-8-soy-protein-products","Soy Protein Products","2.4.20"]
];
const chapterUrl="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf";
const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);
assert.ok(start>=0&&end>start);
const ctx=vm.createContext({contaminantsDb:core,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(start,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(r=>
 String(r.source_basis||"").includes("exact Chapter 2.4 oilseed flour/protein source-pinned shared B1"));
test("All six exact oilseed flour/protein identities source-pinned to official Chapter 2.4",()=>{
 assert.ok(chapter.official_sources.some(x=>x.url===chapterUrl));
 for(const [id,name,fssr] of cases){
  const p=products.find(x=>x.id===id),st=chapter.standards.find(x=>x.key===fssr);
  assert.ok(p&&st,id);assert.equal(p.name,name);assert.equal(p.fssr,fssr);
  const identity=st.source_verified_oilseed_identity;
  assert.equal(identity.exact_catalog_id,id);
  assert.equal(identity.exact_catalogue_name,name);
  assert.equal(identity.source_clause,fssr);
  assert.equal(identity.source_url,chapterUrl);
  assert.equal(identity.source_version,"FSSAI Chapter 2.4 Version 4 (07.05.2025)");
  assert.equal(identity.partial_b1_only,true);
  assert.equal(identity.allow_related_food_inheritance,false);
  assert.equal(identity.complete_contaminant_coverage,false);
 }
});
test("All three official B1 source categories agree at 10 µg/kg; Total Aflatoxins withheld",()=>{
 const group=core.crop_contaminants.aflatoxin_b1;
 assert.equal(group.unit,"µg/kg");
 for(const article of ["Oilseeds for further processing","Oilseeds, ready to eat","Food product containing any of the above mentioned food articles"]){
  assert.equal(group.rules.filter(x=>x.article===article&&Number(x.limit)===10).length,1,article);
 }
 for(const [id] of cases){
  const p=products.find(x=>x.id===id);
  assert.deepEqual(run(p).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]],id);
  assert.deepEqual(run({...p,fssr:"2.4.999"}),[],id);
  assert.deepEqual(run({...p,name:"Generic seed flour"}),[],id);
 }
});
test("Edited official source limit, missing article, wrong unit and legal version fail closed",()=>{
 const p=products.find(x=>x.id===cases[0][0]);
 for(const alter of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Oilseeds for further processing").limit=12},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(x=>x.article!=="Oilseeds, ready to eat")},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.source_version="Version VIII"}
 ]){
  const d=structuredClone(core);alter(d);ctx.contaminantsDb=d;assert.deepEqual(run(p),[]);
 }
 ctx.contaminantsDb=core;
});
test("Audit safeguards identical source values and partial-only classification",()=>{
 assert.match(audit,/official_v9_exact_oilseed_flour_protein_b1_partial/);
 assert.match(audit,/exact_oilseed_flour_protein_b1:oilseedFlourProteinB1Evidence/);
 assert.match(audit,/complete_contaminant_coverage:false/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
 assert.match(audit,/identity\.allow_related_food_inheritance!==false/);
});
