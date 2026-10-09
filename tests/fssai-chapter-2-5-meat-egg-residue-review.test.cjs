"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const products=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const mapped=db.chapter_2_5_commodity_mrl_review_v1;
const clauses=products.filter(p=>String(p.fssr||"").startsWith("2.5"));
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slice=name=>{
 const at=html.indexOf(name);assert.ok(at>=0,"Missing "+name);
 const end=html.indexOf("\nfunction ",at+name.length);
 assert.ok(end>at,"No next function for "+name);return html.slice(at,end);
};
const funcs=[
"function exactFinishedProductContaminantLock(p){",
"function exactMeatEggCommodityReview(p){",
"function exactRawMeatMetalLock(p){",
"function productMeatEggCommodityMrlReviewHtml(p){",
"function contaminantProfileForProduct(p){",
"function productBaselineContaminantRules(p){"
].map(slice).join("\n");
function harness(p,overrides={}){
 const context=vm.createContext({esc,contaminantsDb:{...db,...overrides},normIngredient:s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),chapterRuleDbs:[],ruleDbStandards:()=>[]});
 vm.runInContext(funcs,context);
 const run=expression=>vm.runInContext(expression,context);
 const json=JSON.stringify(p);
 return {review:run("exactMeatEggCommodityReview("+json+")"),html:run("productMeatEggCommodityMrlReviewHtml("+json+")"),lock:run("exactRawMeatMetalLock("+json+")"),profile:run("contaminantProfileForProduct("+json+")"),baseline:run("productBaselineContaminantRules("+json+")")};
}
test("all 37 Chapter 2.5 meat and egg products have unique source-scoped candidate-review routes",()=>{
 assert.equal(clauses.length,37);
 assert.equal(mapped.length,37);
 assert.equal(new Set(mapped.map(x=>x.catalog_id)).size,37);
 assert.deepEqual(new Set(mapped.map(x=>x.catalog_id)),new Set(clauses.map(x=>x.id)));
 const counts=Object.fromEntries(["raw_meat","processed_meat","raw_egg","processed_egg"].map(k=>[k,mapped.filter(x=>x.scope===k).length]));
 assert.deepEqual(counts,{raw_meat:12,processed_meat:20,raw_egg:1,processed_egg:4});
 for(const p of mapped){
  assert.equal(p.auto_apply_commodity_mrl,false,p.catalog_id);
  assert.equal(p.full_product_regulatory_approval,false,p.catalog_id);
  assert.equal(p.scope_review_status,"source_commodity_exists_product_applicability_pending");
  assert.ok(p.candidate_rows_in_loaded_official_source>0,p.catalog_id);
  assert.match(p.source_basis,/FSSAI CTR Version IX/);
  assert.ok(p.qualifier_review.length>50);
 }
});
test("official Version IX commodity pesticide categories remain exactly scoped and qualify testing basis",()=>{
 const all=new Set(db.residue_mrls.pesticides.flatMap(p=>p.rows||[]).map(x=>String(x.food).toLowerCase()));
 for(const label of ["Eggs","Meat and Poultry","Meat and Meat products","Meat & Poultry"])assert.ok(all.has(label.toLowerCase()));
 for(const p of mapped){
  for(const commodity of p.candidate_commodity_articles)assert.ok(all.has(commodity.toLowerCase()),p.catalog_id+" missing official category "+commodity);
 }
 const eggs=mapped.filter(p=>p.scope==="raw_egg");
 assert.deepEqual(eggs.map(x=>x.product_name),["Fresh Eggs"]);
 assert.deepEqual(eggs[0].candidate_commodity_articles,["Eggs"]);
 assert.ok(mapped.filter(p=>p.scope==="processed_egg").every(x=>/processing changes moisture/i.test(x.qualifier_review)));
});
test("MRL candidate review is rendered but not passed or auto-applied for all 37 identities",()=>{
 for(const p of clauses){
  const v=harness(p);
  assert.ok(v.review,p.name);
  assert.match(v.html,/REVIEW ONLY · NOT APPLIED/,p.name);
  assert.match(v.html,/Do not assume these rows apply automatically/,p.name);
  assert.match(v.html,/FSSAI commodity pesticide MRL candidates/,p.name);
  assert.match(v.html,/Official FSSAI Version IX PDF/,p.name);
  assert.match(v.html,/applicability unconfirmed/,p.name);
  assert.doesNotMatch(v.html,/MRL PASSED|final product compliance approved/i,p.name);
 }
});
test("fresh egg shows 9 exact Eggs commodity MRLs only as references",()=>{
 const p=clauses.find(x=>x.id==="10-10-1-fresh-eggs");
 const v=harness(p);
 assert.match(v.html,/Eggs/);
 assert.match(v.html,/9 FSSAI commodity MRL reference/);
 assert.match(v.html,/Shell free basis/i);
 assert.doesNotMatch(v.html,/Meat and Meat products/);
});
test("processed meat and egg variants cannot inherit raw commodity MRLs automatically",()=>{
 const p=clauses.find(x=>x.id==="10-10-2-egg-powder");
 const v=harness(p);
 assert.match(v.html,/Processing changes moisture and sampling matrix/);
 assert.match(v.html,/applicability unconfirmed/);
 const sausage=clauses.find(x=>x.id==="08-08-3-meat-sausages-dry-or-fermented");
 const v2=harness(sausage);
 assert.match(v2.html,/Manufacturing\/process and species\/matrix must be confirmed/);
 assert.equal(v2.review.auto_apply_commodity_mrl,false);
});
test("all four goat and rabbit locks defeat injected future broad article/profile matches",()=>{
 const locked=clauses.filter(p=>/^(Fresh or Chilled|Frozen) (?:Chevon|Rabbit)/i.test(p.name));
 assert.equal(locked.length,4);
 const hypothetical=locked.map(p=>({id:"bad-"+p.id,catalog_ids:[p.id],rules:[{contaminant:"Lead",limit:0.1,unit:"mg/kg"}]}));
 for(const p of locked){
  const v=harness(p,{profiles:[...hypothetical,...db.profiles]});
  assert.ok(v.lock,p.id);
  assert.equal(v.profile,null,p.id);
  assert.deepEqual(Array.from(v.baseline),[],p.id);
  assert.ok(v.html.includes("REVIEW ONLY"),p.id);
 }
});
test("known cattle sheep pig poultry metal limits remain independent of candidate pesticide categories",()=>{
 const accepted=["08-08-1-fresh-or-chilled-beef","08-08-1-fresh-or-chilled-poultry-meat","08-08-2-frozen-pork-or-pig-meat"];
 for(const id of accepted){const p=clauses.find(x=>x.id===id);const v=harness(p);assert.equal(v.lock,null,id);assert.ok(v.profile?.rules?.length>0,id);}
});
test("contaminant UI and master summary show evidence without a full compliance pass",()=>{
 assert.match(html,/const meatEggCommodityReview=productMeatEggCommodityMrlReviewHtml\(p\)/);
 assert.match(html,/\+meatEggCommodityReview/);
 assert.match(html,/const strictProductLock=exactFinishedProductContaminantLock\(product\)\|\|exactRawMeatMetalLock\(product\)/);
 assert.match(html,/exactFinishedProductContaminantLock\(product\)\|\|exactRawMeatMetalLock\(product\)/);
});
