"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),data=path.join(root,"fssai-product-helper-preview-01/data");
const read=f=>JSON.parse(fs.readFileSync(path.join(data,f),"utf8"));
const index=read("standard-search-index-v1.json"),master=read("product-master-v1.json");
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const clauseCompatible=(source,current)=>source===current || source.startsWith(current+"(") || current.startsWith(source+"(");
const ruleFiles=fs.readdirSync(path.join(data,"rules")).filter(x=>/^chapter-.*\.json$/.test(x));
const standards=ruleFiles.flatMap(file=>{
 const db=read("rules/"+file);
 return (db.standards||[]).filter(s=>s.name&&s.key).map(s=>({name:s.name,clause:s.key,file}));
});
const byName=new Map();
for(const row of standards){const key=normalize(row.name);if(!byName.has(key))byName.set(key,[]);byName.get(key).push(row);}
const names=new Map(index.products.map(p=>[p.id,p]));
const matched=index.products.flatMap(p=>(byName.get(normalize(p.name))||[]).map(s=>({product:p,source:s})));
test("Independent exact product-name versus 312 structured FSSAI chapter standards never silently crosses chapters",()=>{
 assert.equal(index.products.length,533);assert.equal(master.catalog_products.length,533);
 assert.ok(standards.length>=300);
 assert.ok(matched.length>50);
 for(const {product:p,source:s} of matched){
  if(!p.fssr)continue; // FoSCoS supplementary identity without its own direct product clause.
  assert.ok(clauseCompatible(s.clause,p.fssr),
   "Exactly matching structured source name resolves to "+s.clause+" but product "+p.id+" is currently routed to "+p.fssr);
 }
});
test("Fruit/Vegetable, Cereal Flakes 2.3.20 remains distinct from grain-first Breakfast Cereal 2.4.35",()=>{
 const flakes=names.get("06-06-3-fruit-vegetable-cereal-flakes"),cereal=names.get("06-06-3-breakfast-cereal");
 assert.ok(flakes&&cereal);assert.equal(flakes.fssr,"2.3.20");assert.equal(cereal.fssr,"2.4.35");
 const candidates=byName.get(normalize(flakes.name))||[];
 assert.ok(candidates.some(x=>x.clause==="2.3.20"&&x.file==="chapter-2-3-fruit-vegetable-v1.json"));
 assert.equal(candidates.some(x=>x.clause==="2.4.35"),false);
 assert.equal(clauseCompatible("2.3.20","2.4.35"),false);
 assert.ok(byName.get(normalize(cereal.name)).some(x=>x.clause==="2.4.35"));
});
test("Rule-key consistency: all 533 search-index products retain the same direct clause as source master",()=>{
 const ms=new Map(master.catalog_products.map(x=>[x.id,x]));
 assert.equal(ms.size,533);
 let exactParentKeys=0;
 for(const p of index.products){
  const row=ms.get(p.id);assert.ok(row,p.id);
  for(const key of ["name","fssr","rule_file","microbiology_status"])assert.equal(row[key],p[key],p.id+" "+key);
  if(row.rule_key!==p.rule_key){
   assert.equal(row.rule_key,"2.4.6","Unapproved parent/subclause divergence "+p.id);
   assert.match(p.rule_key,/^2\.4\.6\(\d+\)$/,"Invalid special 2.4.6 subclause "+p.id);
   exactParentKeys++;
  }
 }
 assert.equal(exactParentKeys,8,"Only eight source-verified 2.4.6 parent/subclause variants are permitted");
});
