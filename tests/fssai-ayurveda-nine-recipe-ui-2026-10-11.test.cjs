"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/",read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const m=read(base+"rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const d=read(base+"rules/contaminants-v9-core.json"),pending=read(base+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const idx=read(base+"standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function sourcePinnedAyurvedaRecipeB1ReviewHtml(p){"),b=html.indexOf("function sourcePriorityMetalFallbackReviewHtml(p){",a+45);
assert.ok(a>0&&b>a);
const context=vm.createContext({ayurvedaRecipeReviewDb:structuredClone(m),contaminantsDb:structuredClone(d),sourcePriorityMetalDb:structuredClone(pending),esc:x=>String(x)});
vm.runInContext(html.slice(a,b),context);
const prod=id=>idx.find(p=>p.id===id),render=p=>vm.runInContext("sourcePinnedAyurvedaRecipeB1ReviewHtml("+JSON.stringify(p)+")",context);
test("All nine exact FSSAI recipes appear as NOT APPLIED with four common B1 source references",()=>{
 for(const row of m.records){
  const h=render(prod(row.catalog_id));
  assert.match(h,/NOT APPLIED/);assert.match(h,/recipe ingredient/);assert.match(h,/Total Aflatoxins/);
  if(row.has_b1_recipe_candidate)assert.match(h,/Aflatoxin B1 10 µg\/kg/);
  else assert.doesNotMatch(h,/Aflatoxin B1 10 µg\/kg/);
 }
});
test("Unrelated and modified name, FoSCoS category or source data never borrow recipe source",()=>{
 const row=m.records.find(r=>r.has_b1_recipe_candidate),p=prod(row.catalog_id);
 assert.equal(render(prod("05-05-1-chocolate")),"");
 assert.match(render({...p,name:"Invented recipe"}),/withheld/);
 assert.match(render({...p,fcs:"99.0"}),/withheld/);
 const original=context.contaminantsDb;
 context.contaminantsDb=structuredClone(d);
 context.contaminantsDb.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Pulses").limit=99;
 assert.match(render(p),/withheld/);
 context.contaminantsDb=original;
});
test("Tampering review approval flags withholds source and no numeric PASS is possible",()=>{
 const row=m.records.find(r=>r.has_b1_recipe_candidate),p=prod(row.catalog_id);
 const orig=context.ayurvedaRecipeReviewDb;
 context.ayurvedaRecipeReviewDb=structuredClone(m);
 context.ayurvedaRecipeReviewDb.records.find(x=>x.catalog_id===p.id).finished_product_numeric_limit_applied=true;
 assert.match(render(p),/withheld/);
 context.ayurvedaRecipeReviewDb=orig;
 assert.match(html,/sourcePinnedAyurvedaRecipeB1ReviewHtml\(p\)/);
 assert.match(html,/ayurvedaRecipeReviewDb=await r.json\(\)/);
});
test("Research worksheet holds all nine recipe qualifications, but zero product MRL applications",()=>{
 const q=read("audit-output/fssai-next-123-first-exact-source-research-queue.json");
 assert.deepEqual([q.ayurveda_recipe_reviews,q.ayurveda_recipe_b1_overlap_candidates,q.total,q.partial,q.pending],[9,4,533,410,123]);
 for(const r of q.records.filter(x=>x.ayurveda_recipe_ingredient_source_review_only)){
  assert.equal(r.ayurveda_recipe_ingredient_source_review_only.article_applied,false);
  assert.equal(r.ayurveda_recipe_ingredient_source_review_only.first_exact_product_source_cleared,false);
 }
});
