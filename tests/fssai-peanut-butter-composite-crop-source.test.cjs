"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-2-fats-oils-v1.json");
const master=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
test("FSSAI peanut butter is made from roasted peanut/groundnut kernels, not an interchangeable raw groundnut article",()=>{
 const product=master.find(x=>x.id==="04-04-2-peanut-butter");
 assert.ok(product);
 assert.equal(product.fssr,"2.2.4(11)");
 const standard=chapter.standards.find(x=>x.key==="2.2.4(11)");
 assert.equal(standard.name,"Peanut Butter");
 assert.ok(standard.permitted_ingredients.includes("roasted groundnut kernels"));
 assert.match(standard.source_url,/^https:\/\/www\.fssai\.gov\.in\//);
});
test("Official Version IX composite-food Aflatoxins group contains source-exact 20 and 10 µg/kg rows",()=>{
 const expected=[["total_aflatoxins",20],["aflatoxin_b1",10]];
 for(const [key,number] of expected){
   const group=db.crop_contaminants[key];assert.ok(group,key);
   assert.equal(group.unit,"µg/kg",key);
   const rows=group.rules.filter(x=>/food product containing any/i.test(x.article||""));
   assert.equal(rows.length,1,key+" grouped composite article missing or ambiguous");
   assert.equal(Number(rows[0].limit),number,key);
 }
 assert.match(db.source_version,/Version IX.*03\.02\.2026/);
});

test("PMSV exact Peanut Butter route renders two validated composite-food limits and rejects source drift",()=>{
 const vm=require("node:vm");
 const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
 const at=html.indexOf("function productBaselineContaminantRules(p){");
 const end=html.indexOf("\nfunction ",at+25);
 assert.ok(at>=0&&end>at);
 const ctx=vm.createContext({
  contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
  exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  isVerifiedFermentedMilkProduct:()=>false
 });
 vm.runInContext(html.slice(at,end),ctx);
 const peanut=master.find(x=>x.id==="04-04-2-peanut-butter");
 const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(r=>
  String(r.source_basis||"").includes("product containing oilseed"));
 const actual=run(peanut);
 assert.deepEqual(actual.map(x=>[x.contaminant,x.limit,x.unit]),[
  ["Total Aflatoxins",20,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]
 ]);
 for(const wrong of [{...peanut,id:"04-04-1-groundnut-kernel-deshelled"}, {...peanut,fssr:"2.2.4(10)"},{...peanut,name:"Peanut Paste"}])
   assert.equal(run(wrong).length,0);
 const bad=structuredClone(db);
 bad.crop_contaminants.total_aflatoxins.rules.find(x=>/food product containing any/i.test(x.article)).limit=21;
 ctx.contaminantsDb=bad;
 assert.deepEqual(run(peanut).map(x=>x.contaminant),["Aflatoxin B1"],"Numeric mismatch must withhold only affected source");
 bad.crop_contaminants.aflatoxin_b1.unit="mg/kg";
 assert.equal(run(peanut).length,0,"Altered source units must suppress the second rule too");
 bad.crop_contaminants.total_aflatoxins.rules.find(x=>/food product containing any/i.test(x.article)).limit=20;
 bad.source_version="Version VIII";
 assert.equal(run(peanut).length,0,"Wrong legal source version must fail closed");
});
test("Audit counts Peanut Butter only as partial source-backed crop toxin evidence",()=>{
 const script=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(script,/official_v9_exact_peanut_butter_composite_aflatoxins_partial/);
 assert.match(script,/exact_peanut_butter_composite_aflatoxins:peanutButterCompositeEvidence/);
 assert.match(script,/pesticide_mrls_auto_approved:false/);
 assert.match(script,/full_contaminant_coverage:false/);
});
