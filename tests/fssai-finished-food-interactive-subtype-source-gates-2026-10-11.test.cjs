"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,".."),r="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),"utf8"));
const index=read(r+"data/standard-search-index-v1.json").products,source=read(r+"data/rules/fssai-v9-processed-food-exact-subtype-source-2026-10-11.json"),core=read(r+"data/rules/contaminants-v9-core.json");
const html=fs.readFileSync(path.join(base,r+"index.html"),"utf8");
const begin=html.indexOf("function setPmsvFinishedFoodArticleResearchSubtype(catalogId,subtypeId){"),
 end=html.indexOf("function sourcePinnedExpandedMetalScopeHtml(p){",begin+30);
assert.ok(begin>0&&end>begin);
const esc=s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const context=vm.createContext({namedFoodSubtypesDb:structuredClone(source),contaminantsDb:structuredClone(core),
 pmsvFinishedFoodArticleResearchState:{catalog_id:"",subtype_id:""},selectedCatalogProductForContaminants:()=>null,esc});
vm.runInContext(html.slice(begin,end),context);
const product=n=>index.find(p=>p.name===n),setSelected=p=>{context.selectedCatalogProductForContaminants=()=>p};
const choose=(p,id)=>{setSelected(p);return vm.runInContext("setPmsvFinishedFoodArticleResearchSubtype("+JSON.stringify(p.id)+","+JSON.stringify(id)+")",context)};
const draw=p=>vm.runInContext("sourcePinnedFinishedFoodSubtypeReviewHtml("+JSON.stringify(p)+")",context);
test("21 exact research subtype options across 9 products provide a functioning selector, not a compliance decision",()=>{
 assert.equal(source.records.length,9);
 assert.equal(source.records.reduce((a,r)=>a+r.forms.length,0),21);
 assert.match(html,/id="pmsvFinishedFoodArticleSubtype"/);
 assert.match(html,/productContaminantResults'\)\?\.addEventListener\('change'/);
 assert.match(html,/if\(setPmsvFinishedFoodArticleResearchSubtype\(p.id,select.value\)\)renderProductContaminants\(\)/);
 for(const row of source.records){
  const p=index.find(p=>p.id===row.catalog_id);assert.ok(p);
  const h=draw(p);assert.match(h,/Show all conditional form references/);
  assert.equal((h.match(/<option value="/g)||[]).length,row.forms.length+2);
  assert.match(h,/No source promotion or overall laboratory PASS is claimed/);
 }
});
test("Selecting a subtype filters research references but never applies regulatory numeric values",()=>{
 const p=product("Thermally Processed Fruits");
 assert.match(draw(p),/Canned pineapple/);
 assert.ok(choose(p,"canned_mangoes"));
 const h=draw(p);
 assert.match(h,/Research candidate selected — NOT confirmed as applicable/);
 assert.match(h,/Canned mangoes/);
 assert.doesNotMatch(h,/<td><b>Canned pineapple<\/b>/);
 assert.match(h,/NOT APPLIED/);
 assert.match(h,/No numeric compliance decision is issued/);
 assert.equal(context.pmsvFinishedFoodArticleResearchState.subtype_id,"canned_mangoes");
 const entry=source.records.find(r=>r.catalog_id===p.id);
 assert.equal(entry.first_exact_product_source_promoted,false);
 assert.equal(entry.direct_finished_product_numeric_auto_application,false);
 assert.equal(entry.forms.find(x=>x.subtype_id==="canned_mangoes").numeric_finished_product_limit_applied,false);
});
test("Selecting no matching listed article shows no reference values; returning to all restores candidate table",()=>{
 const p=product("Thermally Processed Vegetables");
 assert.ok(choose(p,"__none__"));
 const h=draw(p);
 assert.match(h,/No listed named article selected/);
 assert.match(h,/No numeric reference is assigned/);
 assert.doesNotMatch(h,/<th>Verified named source row/);
 assert.ok(choose(p,""));
 const all=draw(p);
 assert.match(all,/Canned sweetcorn/);
 assert.match(all,/Canned carrots/);
 assert.match(all,/NOT APPLIED/);
});
test("Cross-product selection and invented subtype cannot leak or bypass source checks",()=>{
 const p=product("Thermally Processed Fruits"),q=product("Sterilized Fungi");
 assert.ok(choose(p,"canned_pineapple"));
 assert.doesNotMatch(draw(q),/Research candidate selected — NOT confirmed as applicable/);
 setSelected(q);
 assert.equal(vm.runInContext('setPmsvFinishedFoodArticleResearchSubtype('+JSON.stringify(p.id)+',"canned_mangoes")',context),false);
 assert.equal(choose(q,"canned_pineapple"),false);
 assert.ok(choose(q,"canned_mushrooms"));
 assert.match(draw(q),/Research candidate selected — NOT confirmed as applicable/);
 assert.match(draw(p),/Show all conditional form references/);
 assert.doesNotMatch(draw(p),/Research candidate selected — NOT confirmed as applicable/);
});
test("Source data mutation or spoofed identity blocks selected form, never shows unverified limit",()=>{
 const p=product("Concentrated Vegetable Pulp/Puree with Preservatives for industrial use only");
 assert.ok(choose(p,"tomato_concentrate"));
 const pristine=context.contaminantsDb,old=context.namedFoodSubtypesDb;
 context.contaminantsDb=structuredClone(core);
 context.contaminantsDb.metal_article_rules_v9.Copper.find(x=>x.article==="Tomato puree, paste, powder, and cocktails").condition="Wet-basis fake";
 assert.match(draw(p),/withheld/);context.contaminantsDb=pristine;
 assert.match(draw({...p,name:"Canned mixed salad"}),/withheld/);
 context.namedFoodSubtypesDb=structuredClone(source);
 context.namedFoodSubtypesDb.records.find(x=>x.catalog_id===p.id).forms[0].legal_or_lab_compliance_pass=true;
 assert.match(draw(p),/withheld/);context.namedFoodSubtypesDb=old;
});
