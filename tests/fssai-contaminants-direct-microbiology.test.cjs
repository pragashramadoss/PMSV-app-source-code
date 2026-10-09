"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const chapter=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json"),"utf8"));
const index=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/standard-search-index-v1.json"),"utf8"));
const standards=new Map(chapter.standards.map(x=>[x.key,x]));
const ids=["2.4.13(1)","2.4.13(2)","2.4.13(3)","2.4.13(4)","2.4.13(5)"];
const start="function chapterSpecificMicrobiologyForProduct(p){",end="function renderProductMicrobiology(){";
const pos=html.indexOf(start),finish=html.indexOf(end,pos+start.length);
assert.ok(pos>0&&finish>pos,"Chapter-specific renderer missing");
const snippet=html.slice(pos,finish);
const esc=str=>String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const context=vm.createContext({esc, currentChapterStandards:()=>[]});
vm.runInContext(snippet,context);
function render(product,records) {
 context.currentChapterStandards=()=>records.map(standard=>({standard}));
 return {
  matched:vm.runInContext("chapterSpecificMicrobiologyForProduct("+JSON.stringify(product)+").map(s=>s.key)",context),
  html:vm.runInContext("chapterSpecificMicrobiologyHtml("+JSON.stringify(product)+")",context)
 };
}
test("five exact oilseed flours display their own direct FSSAI source microbiology",()=>{
 for(const key of ids){
  const product=index.products.find(p=>p.rule_key===key);
  assert.ok(product,key+" product missing");
  const item=standards.get(key);
  const output=render(product,[item]);
  assert.deepEqual(Array.from(output.matched),[key]);
  assert.match(output.html,/Direct product-standard microbiological criteria/);
  assert.match(output.html,/50,?000|50000/);
  assert.match(output.html,/Coliform bacteria/);
  assert.match(output.html,/Salmonella/);
  assert.match(output.html,/Absent in 25 g/);
  assert.match(output.html,/current amendments and other applicability still require review/);
  assert.match(output.html,/Official FSSAI chapter source/);
 }
});
test("different grain or flour never inherits oilseed-flour microbiology",()=>{
 for(const key of ["2.4.1","2.4.6","2.4.31"]){
  const product=index.products.find(p=>p.rule_key===key);
  assert.ok(product,"Missing product "+key);
  const output=render(product,[...ids.map(k=>standards.get(k)),standards.get(key)]);
  assert.equal(output.html,"",key);
  assert.equal(output.matched.length,0,key);
 }
});
test("loaded unrelated chapter rule cannot leak into exact product microbiology",()=>{
 const p=index.products.find(p=>p.rule_key===ids[0]);
 const output=render(p,[standards.get(ids[1])]);
 assert.equal(output.html,"");
 assert.equal(output.matched.length,0);
});
test("microbiology renderer is connected to live results and assessment summary",()=>{
 assert.match(html,/const chapterSpecific=chapterSpecificMicrobiologyHtml\(p\)/);
 assert.match(html,/el\.innerHTML=chapterSpecific\+microbiologyProfileHtml/);
 assert.match(html,/chapterSpecificMicrobiologyForProduct\(product\)\.length/);
 assert.match(html,/Additional microbiology review remains open/);
});
test("source rows are escaped, and prohibited auto-approval is not enabled",()=>{
 const r={key:"2.4.13(1)",numeric_evidence:{source_url:"https://fssai.gov.in/source.pdf",compliance_assessment_enabled:false},chapter_specific_microbiology:[{parameter:"<img src=x>",value:1,operator:"<=",unit:"CFU/g"}]};
 const h=render({id:"synthetic",rule_key:r.key},[r]).html;
 assert.doesNotMatch(h,/<img /);
 assert.match(h,/&lt;img/);
 assert.doesNotMatch(h,/COMPLIANT|CERTIFIED|ALL RULES PASSED/i);
});
test("master contaminant lookup does not pass with universal-only methylmercury",()=>{
 const at=html.indexOf("function renderMasterComplianceSummary(){");
 assert.ok(at>0);
 const end=html.indexOf("   if(!product){",at);
 assert.ok(end>at,"Could not locate the microbiology boundary in the lookup summary");
 const scoped=html.slice(at,end);
 assert.match(scoped,/const productSpecificCount=exactCount\+baselineCount\+pesticideCount/);
 assert.match(scoped,/const state=productSpecificCount\?'evidence':'incomplete'/);
 assert.match(scoped,/universal-only evidence as complete coverage/);
 assert.doesNotMatch(scoped,/const totalMapped=exactCount\+baselineCount\+pesticideCount\+conditionalCount\+universalCount/);
});

test("INS 223/224 exact metabisulphite source metals remain substance-specific, not finished-food permission",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json"),"utf8"));
 const family=db.special_exact_metabisulphite_metal_articles_v9;
 assert.equal(family.verified_additive_identities.length,2);
 assert.equal(family.finished_food_additive_permission_verified,false);
 const at=html.indexOf("function productBaselineContaminantRules(p){");
 const stop=html.indexOf("\nfunction ",at+25);
 assert.ok(at>=0&&stop>at);
 const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
  exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(at,stop),ctx);
 const run=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx))
  .filter(x=>x.source_basis?.includes("exact INS additive identity/purity metal")).map(x=>[x.contaminant,x.limit,x.unit]);
 for(const row of family.verified_additive_identities){
  const p=index.products.find(x=>x.id===row.catalog_id);assert.ok(p);
  assert.equal(p.name,row.product_name);
  assert.deepEqual(run(p),[["Lead",2,"mg/kg"],["Selenium",5,"mg/kg"]]);
  assert.deepEqual(run({...p,name:"generic additive blend"}),[]);
  const changed=structuredClone(db);
  changed.metal_article_rules_v9.Lead.find(x=>x.article===row.official_article).limit=22;
  ctx.contaminantsDb=changed;
  assert.deepEqual(run(p),[["Selenium",5,"mg/kg"]]);
  ctx.contaminantsDb=db;
 }
});

test("Guar Gum INS 412 routes only its exact Gaur gum source metal article and never additive use approval",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json"),"utf8"));
 const m=db.special_guar_gum_exact_metal_article_v9;
 const p=index.products.find(x=>x.id===m.catalog_id);assert.ok(p);
 assert.equal(p.name,m.product_name);
 assert.equal(m.identity_ins,"412");
 assert.equal(m.identity_clause,"3.2.11(10)");
 assert.equal(m.official_article_spelling,"Gaur gum");
 assert.equal(m.finished_food_additive_use_approved,false);
 const at=html.indexOf("function productBaselineContaminantRules(p){"),stop=html.indexOf("\nfunction ",at+25);
 assert.ok(at>=0&&stop>at);
 const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
  exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(at,stop),ctx);
 const run=x=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(x)+")",ctx))
  .filter(r=>r.source_basis?.includes("exact INS 412 Guar Gum substance alias")).map(r=>[r.contaminant,r.limit,r.unit]);
 assert.deepEqual(run(p),[["Arsenic",3,"mg/kg"],["Lead",2,"mg/kg"]]);
 assert.deepEqual(run({...p,name:"Compound stabilizer blend"}),[]);
 assert.deepEqual(run({...p,fcs:"14.1"}),[]);
 const changed=structuredClone(db);changed.metal_article_rules_v9.Arsenic.find(r=>r.article==="Gaur gum").limit=30;
 ctx.contaminantsDb=changed;assert.deepEqual(run(p),[["Lead",2,"mg/kg"]]);ctx.contaminantsDb=db;
});
