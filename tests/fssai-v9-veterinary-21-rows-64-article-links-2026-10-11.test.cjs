"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base=path.join(root,"fssai-product-helper-preview-01"),rules="rules/";
const read=p=>JSON.parse(fs.readFileSync(path.join(base,"data",p),"utf8"));
const db=read(rules+"fssai-v9-21-vet-article-source-64-links-2026-10-11.json");
const core=read(rules+"contaminants-v9-core.json");
const chapter=read(rules+"chapter-2-5-meat-eggs-v1.json");
const products=read("standard-search-index-v1.json").products,index=new Map(products.map(x=>[x.id,x]));
const a=read(rules+"fssai-next121-positive-subtype-proof-2026-10-11.json");
const last=read(rules+"fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json");
const vet=core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits;
test("21 distinct official 2026 veterinary rows match source, never a bundled generic row",()=>{
 assert.equal(core.source_version,"Version IX (03.02.2026)");
 assert.equal(db.source_version,core.source_version);
 assert.equal(db.official_ctr,core.official_sources[0].url);
 assert.equal(db.official_fssr,chapter.official_sources[0].url);
 assert.equal(db.distinct_analyte_source_rows,21);
 assert.equal(db.source_rows.length,21);
 assert.equal(new Set(db.source_rows.map(r=>r.key)).size,21);
 assert.equal(vet.completeness,"complete");assert.equal(vet.auto_apply,false);
 const broad=db.source_rows.filter(x=>x.key!=="vet-47-eggs");
 assert.equal(broad.length,20);
 assert.equal(db.source_rows.find(x=>x.key==="vet-47-eggs").source_article,"Poultry and egg");
 for(const row of db.source_rows){
  const src=vet.rows.filter(x=>x.serial===row.serial&&x.name===row.analyte);
  assert.equal(src.length,1,row.key);
  assert.equal(src[0].rows.filter(x=>x.article===row.source_article&&Number(x.limit)===row.limit&&x.unit===row.unit).length,1,row.key);
  assert.equal(row.limit,0.01);
  assert.equal(row.unit,"mg/kg");
  if(row.key!=="vet-47-eggs")assert.match(row.source_article,/^All edible animal tissues/);
 }
});
test("40 exact rabbit + 20 conditional casing + 4 conditional processed-egg links reconcile without approvals",()=>{
 assert.equal(products.length,533);
 assert.equal(db.products_total,533);assert.equal(db.partial_first_source,417);
 assert.equal(db.pending_first_source,116);assert.equal(db.new_first_source_promotions,0);
 assert.equal(db.finished_food_approvals,0);assert.equal(db.scope_product_count,7);
 assert.equal(db.records.length,7);
 const group=(kind)=>db.records.filter(x=>x.route_type===kind);
 assert.equal(group("rabbit_exact_edible_tissue").length,2);
 assert.equal(group("casing_ingredient_conditional").length,1);
 assert.equal(group("processed_egg_conditional").length,4);
 assert.equal(group("rabbit_exact_edible_tissue").reduce((n,x)=>n+x.source_article_keys.length,0),40);
 assert.equal(group("casing_ingredient_conditional").reduce((n,x)=>n+x.source_article_keys.length,0),20);
 assert.equal(group("processed_egg_conditional").reduce((n,x)=>n+x.source_article_keys.length,0),4);
 const seen=new Set;
 for(const x of db.records){
  assert.ok(!seen.has(x.catalog_id));seen.add(x.catalog_id);
  const p=index.get(x.catalog_id);
  assert.ok(p&&a.records.some(o=>o.catalog_id===p.id));
  assert.equal(x.product_name,p.name);assert.equal(x.fssr,p.fssr);assert.equal(x.fcs,p.fcs);
  assert.equal(x.numeric_auto_apply,false);assert.equal(x.analytical_lot_pass,false);assert.equal(x.full_contaminant_pass,false);
  assert.ok(x.requires.length>85&&x.forbidden_inheritance.length>45);
  assert.equal(new Set(x.source_article_keys).size,x.source_article_keys.length);
  for(const key of x.source_article_keys)assert.ok(db.source_rows.some(r=>r.key===key));
  assert.equal(x.first_source_already_positive,x.route_type==="rabbit_exact_edible_tissue");
 }
 assert.equal(last.positive_records.length,2);
 assert.ok(last.positive_records.every(x=>seen.has(x.catalog_id)));
});
test("live Helper confirms only exact source, blocks altered 2026 row and stops egg/casing promotion",async()=>{
 const js=fs.readFileSync(path.join(base,"fssai-source-proof-panels.js"),"utf8");
 const data={
  "fssai-next121-positive-subtype-proof-2026-10-11.json":a,
  "fssai-next29-no-source-proof-dossiers-2026-10-11.json":read(rules+"fssai-next29-no-source-proof-dossiers-2026-10-11.json"),
  "fssai-2026-10-11-cross-form-nontransfer-large-batch.json":read(rules+"fssai-2026-10-11-cross-form-nontransfer-large-batch.json"),
  "fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json":last,
  "fssai-v9-21-vet-article-source-64-links-2026-10-11.json":db
 };
 const ctx={contaminantsDb:core,chapterRuleDbs:[chapter],
 sourcePriorityMetalDb:{partial_exact_count:412,pending_first_exact_count:121,
 unresolved_first_exact_catalog_ids:a.records.map(x=>x.catalog_id)},
 esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"),
 fetch:async url=>{const key=Object.keys(data).find(k=>url.includes(k));return key?{ok:true,json:async()=>data[key]}:{ok:false};}};
 vm.createContext(ctx);vm.runInContext(js,ctx);await ctx.pmsvLoadPositiveSourceProof();
 assert.ok(ctx.pmsvVet64SourceDb);
 for(const x of db.records){
  const p=index.get(x.catalog_id);
  assert.equal(ctx.pmsvVet64SourceValid(p),true,x.catalog_id);
  const html=ctx.pmsvVet64ProofHtml(p);
  assert.match(html,/NOT A FINISHED-FOOD COMPLIANCE PASS/);
  assert.match(html,/Article conditions still to establish/);
  if(x.route_type==="rabbit_exact_edible_tissue"){
   assert.match(html,/Ampicillin/);assert.match(html,/Xylazine/);
   assert.match(html,/20 named references/);
  }else if(x.route_type==="casing_ingredient_conditional"){
   assert.match(html,/CONDITIONAL SOURCE REFERENCE ONLY/);
   assert.match(html,/20 named references/);
  }else{
   assert.match(html,/Virginiamycin/);
   assert.match(html,/1 named references/);
  }
  const wrong={...p,name:"Unauthenticated food identity"};
  assert.equal(ctx.pmsvVet64SourceValid(wrong),false);
 }
 const p=index.get(db.records[0].catalog_id);
 const badRows=vet.rows.map(x=>x.serial===48?{...x,rows:[{article:"All edible animal tissues except in fish; Fats derived from animal tissues",limit:"0.99",unit:"mg/kg"}]}:x);
 ctx.contaminantsDb={...core,antibiotic_and_pharmacological_substances:{
   ...core.antibiotic_and_pharmacological_substances,
   veterinary_tolerance_limits:{...vet,rows:badRows}}};
 assert.equal(ctx.pmsvVet64SourceValid(p),false);
 assert.match(ctx.pmsvVet64ProofHtml(p),/withheld/);
});
