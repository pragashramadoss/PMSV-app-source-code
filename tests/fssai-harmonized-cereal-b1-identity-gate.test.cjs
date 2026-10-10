"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json");
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const officialArticle="Food product containing any of the above mentioned food articles";
const subjects=[
 ["06-06-3-oat-products","Oat Products","2.4.12"],
 ["06-06-2-multigrain-flour-atta","Multigrain flour (atta)","2.4.37"]
];
const begin=html.indexOf("function productBaselineContaminantRules(p){");
const end=html.indexOf("\nfunction ",begin+29);
assert.ok(begin>=0&&end>begin);
const ctx=vm.createContext({
 contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false
});
vm.runInContext(html.slice(begin,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(r=>
 String(r.source_basis||"").includes("identical cereal and composite food B1 limits"));
test("Chapter 2.4 identity definitions guarantee cereal ingredients for both narrowly mapped products",()=>{
 const oat=chapter.standards.find(x=>x.key==="2.4.12");
 assert.equal(oat.name,"Oat Products");
 assert.ok(oat.variants.some(x=>x.name==="Rolled/Flaked Oats"));
 assert.ok(oat.variants.some(x=>x.name==="Products containing oats"));
 const atta=chapter.standards.find(x=>x.key==="2.4.37");
 assert.equal(atta.name,"Multigrain Flour (Atta)");
 assert.ok(atta.formulation_rules.some(x=>x.parameter==="Whole wheat flour"&&x.min===50&&x.max===90));
 for(const [id,name,fssr] of subjects){
  const p=catalogue.find(x=>x.id===id);
  assert.ok(p);assert.equal(p.name,name);assert.equal(p.fssr,fssr);
 }
});
test("Both official B1 source articles agree at 10 µg/kg, while total aflatoxins differ and are withheld",()=>{
 const b1=db.crop_contaminants.aflatoxin_b1,ta=db.crop_contaminants.total_aflatoxins;
 assert.equal(b1.unit,"µg/kg");
 for(const article of ["Cereal and cereal products",officialArticle]){
  assert.equal(b1.rules.filter(x=>x.article===article&&Number(x.limit)===10).length,1);
 }
 assert.equal(ta.rules.find(x=>x.article==="Cereal and cereal products").limit,15);
 assert.equal(ta.rules.find(x=>x.article===officialArticle).limit,20);
 for(const [id] of subjects){
  const p=catalogue.find(x=>x.id===id);
  assert.deepEqual(run(p).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]]);
  assert.equal(run({...p,fssr:"2.4.other"}).length,0);
  assert.equal(run({...p,name:"Unrelated food product"}).length,0);
 }
});
test("Changed source B1 value, unit, article or effective Version IX must fail closed",()=>{
 const target=catalogue.find(x=>x.id===subjects[0][0]);
 const original=ctx.contaminantsDb;
 for(const mutate of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article===officialArticle).limit=12},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(x=>x.article!==officialArticle)},
  d=>{d.source_version="Version VIII"}
 ]){
  const altered=structuredClone(db);mutate(altered);ctx.contaminantsDb=altered;
  assert.equal(run(target).length,0);
 }
 ctx.contaminantsDb=original;
 assert.equal(run(target).length,1);
});
test("Audit recognizes only source-backed partial B1, not complete contaminant compliance",()=>{
 assert.match(audit,/official_v9_harmonised_cereal_composite_b1_partial/);
 assert.match(audit,/exact_harmonised_cereal_aflatoxin_b1:sharedCerealAflatoxinB1Evidence/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
 assert.match(audit,/complete_contaminant_compliance:false/);
});
