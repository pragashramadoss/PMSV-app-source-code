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
 ["06-06-8-tempe","Tempe","2.4.26"],
 ["06-06-8-textured-soy-protein-soy-bari-or-soy-chunks-or-soy-granules","Textured Soy Protein (Soy Bari or Soy Chunks or Soy Granules)","2.4.27"]
];
const src="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf";
const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);
assert.ok(start>=0&&end>start);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(start,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(r=>
 String(r.source_basis||"").includes("harmonised oilseed and composite B1 source rows"));
test("Exact Tempe and Textured Soy Protein identities are supported by current official Chapter 2.4",()=>{
 assert.ok(chapter.official_sources.some(x=>x.url===src));
 for(const [id,name,fssr] of ids){
  const p=products.find(x=>x.id===id);assert.ok(p,id);
  assert.equal(p.name,name);assert.equal(p.fssr,fssr);
  const st=chapter.standards.find(x=>x.key===fssr);
  assert.equal(st.source_verified_identity.principal_source,"Soybean (Glycine max)");
  assert.equal(st.source_verified_identity.official_source_url,src);
  assert.equal(st.source_verified_identity.source_clause,fssr);
  assert.equal(st.source_verified_identity.complete_contaminant_compliance,false);
 }
 const tempe=chapter.standards.find(x=>x.key==="2.4.26");
 assert.ok(tempe.permitted_ingredients.includes("soybean"));
 const soyChunks=chapter.standards.find(x=>x.key==="2.4.27");
 assert.match(soyChunks.definition,/defatted soy flour or grits/);
});
test("Official ready-to-eat oilseed and composite-food B1 entries agree at 10 µg/kg",()=>{
 const g=db.crop_contaminants.aflatoxin_b1;
 assert.equal(g.unit,"µg/kg");
 for(const article of ["Oilseeds, ready to eat","Food product containing any of the above mentioned food articles"])
  assert.equal(g.rules.filter(r=>r.article===article&&Number(r.limit)===10).length,1,article);
 for(const [id] of ids){
  const p=products.find(x=>x.id===id);
  assert.deepEqual(run(p).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]]);
  assert.equal(run({...p,name:"Wrong name"}).length,0);
  assert.equal(run({...p,id:"06-06-8-tofu"}).length,0);
  assert.equal(run({...p,fssr:"2.4.other"}).length,0);
 }
});
test("Changed source row, amount, units or Version IX fail closed",()=>{
 const target=products.find(x=>x.id===ids[0][0]);
 for(const mutate of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(r=>r.article==="Oilseeds, ready to eat").limit=11},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(r=>r.article!=="Oilseeds, ready to eat")},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.source_version="Version VIII"}
 ]){
  const c=structuredClone(db);mutate(c);ctx.contaminantsDb=c;
  assert.deepEqual(run(target),[]);
 }
 ctx.contaminantsDb=db;
 assert.equal(run(target).length,1);
});
test("Audit classifies exact soy routes as partial toxin evidence and not complete regulatory compliance",()=>{
 assert.match(audit,/official_v9_soy_derivative_oilseed_composite_b1_partial/);
 assert.match(audit,/exact_soy_derivative_oilseed_composite_b1:soyDerivativeB1Evidence/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
 assert.match(audit,/full_compliance_verified:false/);
});
