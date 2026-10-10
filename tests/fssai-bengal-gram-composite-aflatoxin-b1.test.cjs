"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read(base+"data/rules/contaminants-v9-core.json");
const chapter=read(base+"data/rules/chapter-2-4-cereals-v1.json");
const catalogue=read(base+"data/standard-search-index-v1.json").products;
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const expected=[
 ["06-06-2-besan","Besan","2.4.4"],
 ["06-06-2-roasted-bengal-gram-flour-chana-sattu","Roasted Bengal Gram Flour (Chana Sattu)","2.4.33"]
];
const chapterSource="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf";
const start=html.indexOf("function productBaselineContaminantRules(p){");
const end=html.indexOf("\nfunction ",start+25);
assert.ok(start>0&&end>start,"Missing source-gated baseline rules");
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(start,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(r=>
 String(r.source_basis||"").includes("exact Chapter 2.4 Bengal gram identity"));
test("Besan and Chana Sattu botanical identities pinned to official current FSSAI Chapter 2.4",()=>{
 assert.ok(chapter.official_sources.some(x=>x.url===chapterSource));
 for(const [id,name,fssr] of expected){
  const p=catalogue.find(x=>x.id===id);assert.ok(p,id);
  assert.equal(p.name,name);assert.equal(p.fssr,fssr);
  const st=chapter.standards.find(x=>x.key===fssr);assert.ok(st);
  assert.equal(st.source_verified_identity.botanical_identity,"Cicer arietinum");
  assert.equal(st.source_verified_identity.official_source_url,chapterSource);
  assert.equal(st.source_verified_identity.source_compendium_version,"Version 4 (07.05.2025)");
  assert.equal(st.source_verified_identity.source_clause,fssr);
  assert.equal(st.source_verified_identity.full_compliance_verified,false);
 }
});
test("Both Version IX pulse and composite source rows agree on Aflatoxin B1 10 µg/kg",()=>{
 const group=db.crop_contaminants.aflatoxin_b1;
 assert.equal(group.unit,"µg/kg");
 assert.match(db.source_version,/Version IX.*03\.02\.2026/);
 for(const article of ["Pulses","Food product containing any of the above mentioned food articles"])
   assert.equal(group.rules.filter(x=>x.article===article&&Number(x.limit)===10).length,1,article);
 for(const [id] of expected){
   const p=catalogue.find(x=>x.id===id),rules=run(p);
   assert.deepEqual(rules.map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]],id);
   assert.equal(rules.some(x=>x.contaminant==="Total Aflatoxins"),false);
 }
});
test("Other pulses, soy or unrelated flour cannot borrow exact Bengal gram route",()=>{
 const p=catalogue.find(x=>x.id===expected[0][0]);
 const checks=[
  {...p,id:"06-06-2-groundnut-flour"}, {...p,name:"Soybean Flour"},
  {...p,fssr:"2.4.7"}, {...p,id:"06-06-2-roasted-bengal-gram-flour-chana-sattu"},
  catalogue.find(x=>x.id==="06-06-2-maize-starch")
 ].filter(Boolean);
 for(const x of checks)assert.deepEqual(run(x),[],x.id);
});
test("Changed source amount, unit, article, and compendium version fail closed",()=>{
 const p=catalogue.find(x=>x.id===expected[0][0]);
 for(const mutate of [
  x=>{x.crop_contaminants.aflatoxin_b1.rules.find(r=>r.article==="Pulses").limit=12},
  x=>{x.crop_contaminants.aflatoxin_b1.rules=x.crop_contaminants.aflatoxin_b1.rules.filter(r=>r.article!=="Pulses")},
  x=>{x.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  x=>{x.source_version="Version VIII"}
 ]){
  const changed=structuredClone(db);mutate(changed);ctx.contaminantsDb=changed;
  assert.deepEqual(run(p),[]);
 }
 ctx.contaminantsDb=db;
 assert.equal(run(p).length,1);
});
test("Audit requires independently checked identity and never claims complete contaminant coverage",()=>{
 assert.match(audit,/official_v9_exact_bengal_gram_pulse_composite_b1_partial/);
 assert.match(audit,/exact_bengal_gram_pulse_composite_b1:bengalGramAflatoxinB1Evidence/);
 assert.match(audit,/identity\.official_source_url/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
 assert.match(audit,/full_contaminant_compliance:false/);
});
