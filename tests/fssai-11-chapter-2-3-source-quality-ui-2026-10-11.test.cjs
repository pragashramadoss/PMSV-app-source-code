"use strict";const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8")),pre="fssai-product-helper-preview-01/data/";
const m=read(pre+"rules/fssai-11-fruit-pickles-pastes-chutney-quality-2026-10-11.json"),ix=read(pre+"standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function sourcePinnedFruitPickleQuality11Html(p){"),b=html.indexOf("function sourcePinnedFungiQualitySourceReviewHtml(p){",a+45);assert.ok(a>0&&b>a);
const ctx=vm.createContext({fruitQuality11Db:structuredClone(m),esc:x=>String(x).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});vm.runInContext(html.slice(a,b),ctx);
const choose=id=>ix.find(x=>x.id===id),display=p=>vm.runInContext("sourcePinnedFruitPickleQuality11Html("+JSON.stringify(p)+")",ctx);
test("Every one of 11 source-verified product panels renders only its own Chapter 2.3 quality source",()=>{
 for(const x of m.records){
  const shown=display(choose(x.catalog_id));assert.match(shown,/NOT a contaminant PASS/);
  assert.match(shown,/quality\/process criteria/);
  assert.ok(shown.includes(x.criteria[0].parameter));
  assert.match(shown,/No compliance PASS/);
 }
});
test("Other products, corrupted FoSCoS identities and wrong version cannot borrow numeric standard",()=>{
 const p=choose("04-04-1-fruits-and-vegetable-chutney");
 assert.equal(display(choose("04-04-2-cocoa-beans")),"");
 for(const changed of [{name:"Mango Chutney"},{fssr:"2.3.42"},{fcs:"00.0"}])
  assert.match(display({...p,...changed}),/withheld/);
 const initial=ctx.fruitQuality11Db;
 ctx.fruitQuality11Db=structuredClone(m);
 ctx.fruitQuality11Db.records.find(x=>x.catalog_id===p.id).criteria[0].value=500;
 assert.match(display(p),/withheld/);
 ctx.fruitQuality11Db=initial;
});
test("No source flags, preservation methods or generic metal names create a contaminant PASS",()=>{
 assert.match(html,/fruitQuality11Db=await source.json\(\)/);
 assert.match(html,/sourcePinnedFruitPickleQuality11Html\(p\)/);
 assert.match(display(choose("04-04-1-fruits-and-vegetable-chutney")),/Mango Chutney contaminant article/);
 const q=read("audit-output/fssai-next-121-first-exact-source-research-queue.json");
 assert.deepEqual([q.fruit_pickle_paste_quality_products,q.fruit_pickle_paste_quality_rules,q.fruit_pickle_paste_first_exact_ctr_promotions],[11,48,0]);
 for(const r of q.records.filter(x=>x.fruit_pickle_paste_quality_source_review_only)){
  assert.equal(r.fruit_pickle_paste_quality_source_review_only.first_exact_ctr_source_cleared,false);
  assert.equal(r.fruit_pickle_paste_quality_source_review_only.product_compliance_pass,false);
 }
});
