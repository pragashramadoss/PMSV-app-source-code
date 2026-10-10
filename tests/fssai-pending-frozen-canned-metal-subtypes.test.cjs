"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const idx=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const manifest=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const start=html.indexOf("function metalSubtypeRulesForProduct(p){");
const end=html.indexOf("function renderMetalSubtypeStatus(p){",start);
assert.ok(start>=0&&end>start);
const sel={value:"",dataset:{catalogId:""}};
const ctx={contaminantsDb:db,standardSearchIndexDb:{products:idx},document:{getElementById:()=>sel},esc:v=>String(v),normIngredient:v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()};
vm.runInNewContext(html.slice(start,end),ctx);
const specs=[
{ id:"01-01-7-ice-cream-kulfi-chocolate-ice-cream-softy-ice-cream-milk-ice-milk-lolly-and-dried-",
subtype:"Frozen ice cream / kulfi / softy / milk ice / milk lolly (not dried mix)",
rules:[["Lead",1],["Arsenic",0.5]], bad:"Dried Ice Cream Mix"},
{ id:"04-04-2-sterilized-fungi",
subtype:"Canned mushrooms (actual mushroom species; canned pack, not glass/pouch)",
rules:[["Lead",1],["Tin",250]], bad:"Bottled fungi"},
{ id:"04-04-1-thermally-processed-fruit-salad-cocktail-mix",
subtype:"Canned fruit cocktail (food can; not bottled/flexible/aseptic)",
rules:[["Lead",1],["Tin",250]], bad:"Flexible pack fruit salad"}
];
const rulesFor=product=>Array.from(ctx.selectedMetalSubtypeRules(product),x=>[x.contaminant,x.limit,x.unit]);
test("All three mixed catalogue identities retain pending status until user confirms exact finished subtype",()=>{
 assert.equal(manifest.pending,228);
 assert.equal(db.combined_catalogue_finished_subtype_review_2026_10_10.new_source_pinned_conditional_rows,6);
 assert.equal(db.combined_catalogue_finished_subtype_review_2026_10_10.auto_apply,false);
 for(const s of specs){
   const p=idx.find(x=>x.id===s.id);assert.ok(p);
   const row=manifest.records.find(x=>x.catalog_id===s.id);assert.ok(row);
   assert.equal(row.assessment_status,"exact_contaminant_evidence_not_yet_established");
   assert.equal(row.auto_apply_numeric_limit,false);
   assert.equal(row.unconditional_compliance_pass,false);
   assert.ok(row.version_ix_named_article_scope_review.source_article_candidates_review_only.length>=2);
   const sub=db.product_subtype_conditional_metal_rules_v9.filter(x=>x.catalog_id===s.id);
   assert.equal(sub.length,2);
   assert.equal(new Set(sub.map(x=>x.subtype)).size,1);
   for(const x of sub){
     assert.equal(x.auto_apply,false);
     assert.equal(x.requires_input,"product.exact_subtype");
     assert.equal(x.official_source_url,db.official_sources[0].url);
     assert.ok(x.condition.length>80);
     const source=db.metal_article_rules_v9[x.contaminant].filter(z=>z.row_type==="exact"&&z.article===x.article&&z.limit===x.limit&&z.unit===x.unit);
     assert.equal(source.length,1,s.id);
   }
 }
});
test("Frozen and canned finished-product limits are only shown after matching product-specific subtype selection",()=>{
 for(const s of specs){
   const p=idx.find(x=>x.id===s.id);
   sel.dataset.catalogId=s.id;sel.value="";
   assert.deepEqual(rulesFor(p),[]);
   sel.value=s.bad;assert.deepEqual(rulesFor(p),[]);
   sel.value=s.subtype;
   assert.deepEqual(rulesFor(p),s.rules.map(([m,n])=>[m,n,"mg/kg"]),p.name);
   assert.equal(ctx.selectedMetalSubtypeRule(p),null,"Do not discard either metal in two-row legacy accessor");
   sel.dataset.catalogId="stale-other-product";assert.deepEqual(rulesFor(p),[]);
   sel.dataset.catalogId=s.id;
   assert.deepEqual(rulesFor({...p,name:p.name+" unrelated"}),[]);
   assert.deepEqual(rulesFor({...p,fssr:"2.99.99"}),[]);
 }
});
test("Changed numeric source, unit or row article withholds the entire subtype metal set",()=>{
 for(const s of specs){
  const p=idx.find(x=>x.id===s.id);
  sel.dataset.catalogId=s.id;sel.value=s.subtype;
  const original=rulesFor(p);assert.equal(original.length,2);
  const src=db.product_subtype_conditional_metal_rules_v9.find(x=>x.catalog_id===s.id);
  const altered=structuredClone(db);
  altered.metal_article_rules_v9[src.contaminant].find(x=>x.article===src.article).limit=987;
  ctx.contaminantsDb=altered;assert.deepEqual(rulesFor(p),[]);
  const wrongUnit=structuredClone(db);
  wrongUnit.product_subtype_conditional_metal_rules_v9.find(x=>x.catalog_id===s.id).unit="mg/L";
  ctx.contaminantsDb=wrongUnit;assert.deepEqual(rulesFor(p),[]);
  const wrongSource=structuredClone(db);
  wrongSource.product_subtype_conditional_metal_rules_v9.find(x=>x.catalog_id===s.id).official_source_url="https://not-fssai.example/other.pdf";
  ctx.contaminantsDb=wrongSource;assert.deepEqual(rulesFor(p),[]);
  ctx.contaminantsDb=db;
 }
});
