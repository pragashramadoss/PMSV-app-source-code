"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,base,p),"utf8"));
const idx=read("data/standard-search-index-v1.json").products;
const manifest=read("data/rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const source=read("data/rules/contaminants-v9-core.json");
const recipes=read("data/rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const html=fs.readFileSync(path.join(root,base,"index.html"),"utf8");
const code=fs.readFileSync(path.join(root,base,"fssai-ayurveda-composite-first-source.js"),"utf8");
const ctx=vm.createContext({contaminantsDb:source,ayurvedaRecipeReviewDb:recipes,esc:x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(code,ctx);ctx.pmsvAyurvedaCompositeB1Db=manifest;
const product=id=>idx.find(x=>x.id===id),show=p=>vm.runInContext("sourcePinnedAyurvedaCompositeB1Html("+JSON.stringify(p)+")",ctx);
test("Official Ayurveda recipe is mandatory cereal/pulse retained in the finished product for exactly two foods",()=>{
 assert.equal(manifest.records.length,2);
 assert.deepEqual([manifest.current_partial_exact_after_supplement,manifest.current_unresolved_after_supplement,manifest.full_compliance_approvals],[414,119,0]);
 for(const x of manifest.records){
  const p=product(x.catalog_id),r=recipes.records.find(y=>y.catalog_id===x.catalog_id);
  assert.ok(p&&r);
  assert.equal(x.product_name,p.name);assert.equal(x.fssr,p.fssr);assert.equal(x.fcs,p.fcs);
  assert.equal(x.recipe_id,r.official_recipe_id);assert.equal(x.ingredient_proof,r.recipe_ingredient_evidence);
  assert.equal(r.has_b1_recipe_candidate,true);
  assert.equal(x.source_product_article,"Food product containing any of the above mentioned food articles");
  assert.match(x.ingredient_proof,/rice|barley|lentils/i);
  assert.match(show(p),/Positive FSSAI first-source match/);
  assert.match(show(p),/No finished-product laboratory result/);
 }
});
test("Two independent officially stored compound-food aflatoxin articles agree in analyte, limit, and units",()=>{
 for(const x of manifest.records){
  for(const [type,n] of [["aflatoxin_b1",10],["total_aflatoxins",20]]){
   const rule=x.applicable_source_rows.find(x=>x.source_group===type);
   assert.ok(rule);assert.equal(rule.limit,n);assert.equal(rule.unit,"µg/kg");
   assert.ok((source.crop_contaminants[type].rules||[]).some(r=>r.article===x.source_product_article&&Number(r.limit)===n));
  }
  assert.equal(x.regulatory_sample_pass,false);assert.equal(x.complete_contaminant_panel,false);
 }
});
test("Invalid ID, altered cooked-food formula, numeric FSSAI limit and non-recipe analogues fail closed",()=>{
 const p=product(manifest.records[0].catalog_id);
 assert.match(show({...p,name:"Khichdi instant mix"}),/withheld/);
 assert.equal(show(product("102-102-1-12-1-lajadi-kashaya-parched-rice-tea")),"");
 let prior=ctx.contaminantsDb;
 ctx.contaminantsDb=JSON.parse(JSON.stringify(source));
 ctx.contaminantsDb.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article===manifest.records[0].source_product_article).limit=11;
 assert.match(show(p),/withheld/);ctx.contaminantsDb=prior;
 const review=ctx.ayurvedaRecipeReviewDb;ctx.ayurvedaRecipeReviewDb=JSON.parse(JSON.stringify(recipes));
 ctx.ayurvedaRecipeReviewDb.records.find(x=>x.catalog_id===p.id).recipe_ingredient_evidence="Water only";
 assert.match(show(p),/withheld/);ctx.ayurvedaRecipeReviewDb=review;
 const m=ctx.pmsvAyurvedaCompositeB1Db;ctx.pmsvAyurvedaCompositeB1Db=null;
 assert.match(show(p),/withheld/);ctx.pmsvAyurvedaCompositeB1Db=m;
});
test("Loaded live Helper integrates optional verified subtype module independently of historic 121 queue",()=>{
 assert.match(html,/fssai-ayurveda-composite-first-source\.js\?v=20261011-plus2/);
 assert.match(html,/typeof pmsvLoadAyurvedaCompositeB1==='function'/);
 assert.match(html,/sourcePinnedAyurvedaCompositeB1Html\(p\)/);
 assert.match(html,/sourcePinned121ResearchProofHtml\(p\)/);
});
