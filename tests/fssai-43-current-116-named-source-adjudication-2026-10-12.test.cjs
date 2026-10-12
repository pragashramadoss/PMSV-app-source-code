"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/",rules=base+"data/rules/";
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const d=json(rules+"fssai-forty-plus-conditional-finished-article-2026-10-12.json");
const ledger=json(rules+"fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const work=json(rules+"fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const core=json(rules+"contaminants-v9-core.json");
const cat=json(base+"data/standard-search-index-v1.json").products;
const pre=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
const src=fs.readFileSync(path.join(root,base+"fssai-43-exact-article-research-gates.js"),"utf8");
const map=new Map(cat.map(x=>[x.id,x]));
function context(){
 const c={console,esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(c);vm.runInContext(pre,c);vm.runInContext(src,c);
 c.pmsvCurrent533SourceLedger=structuredClone(ledger);
 c.contaminantsDb=structuredClone(core);
 c.pmsv43ConditionalSource=structuredClone(d);
 return c;
}
const variants=id=>d.records.find(x=>x.catalog_id===id).source_branch_options;
const keys=(id,variant)=>variants(id).find(x=>x.key===variant).article_keys;
const source=k=>d.positive_source_rows.find(x=>x.key===k);
test("43 current unresolved identities, 53 distinct subtypes, 45 official source articles and 110 conditional links are source-anchored",()=>{
 const c=context();assert.equal(c.pmsv43ValidDocument(),true);
 assert.equal(d.records.length,43);assert.equal(d.positive_source_rows.length,45);
 assert.equal(d.records.reduce((s,x)=>s+x.source_branch_options.length,0),53);
 assert.equal(d.records.reduce((s,x)=>s+x.source_branch_options.reduce((v,p)=>v+p.article_keys.length,0),0),110);
 assert.equal(ledger.records.length,533);assert.equal(ledger.partial_exact,417);
 assert.equal(ledger.first_source_pending,116);assert.equal(work.records.length,116);
 assert.equal(d.first_exact_promotions,0);assert.equal(d.complete_compliance_passes,0);
 const pending=new Set(work.records.map(x=>x.catalog_id));
 assert.equal(new Set(d.records.map(x=>x.catalog_id)).size,43);
 for(const r of d.records){assert.ok(pending.has(r.catalog_id));assert.equal(r.product_name,map.get(r.catalog_id).name);
  assert.equal(r.current_first_exact_source_pending,true);assert.equal(r.automatic_finished_limit_application,false);
  assert.equal(r.lot_pass,false);assert.equal(r.full_compliance_pass,false);
  for(const v of r.source_branch_options){assert.match(v.applicability,/CONDITIONAL_PENDING/);}
 }
 for(const r of d.positive_source_rows)assert.equal(r.official_source,core.official_sources[0].url);
});
test("Actual product matrix keeps source article names, numerical maxima, bases, editions and case exclusions distinct",()=>{
 assert.deepEqual([source("agaric_mushroom").analyte,source("agaric_mushroom").article,source("agaric_mushroom").limit,source("agaric_mushroom").unit],["Agaric acid","Food containing mushrooms",100,"ppm"]);
 assert.deepEqual([source("lead_canned_mushroom").analyte,source("lead_canned_mushroom").limit,source("tin_canned_mushroom").limit],["Lead",1,250]);
 assert.deepEqual([source("lead_processed_tomato_concentrate").limit,source("copper_tomato_puree").limit,source("copper_tomato_puree").basis.includes("dried tomato solids")],[1.5,100,true]);
 assert.equal(source("tin_mango_chutney").article,"Mango Chutney");
 assert.equal(source("tin_pickled_cucumber").article,"Pickled cucumber");
 assert.deepEqual([source("lead_mango_chutney").limit,source("tin_mango_chutney").limit,source("lead_pickled_cucumber").limit,source("tin_pickled_cucumber").limit],[1,250,1,250]);
 assert.deepEqual([source("lead_sugar_highash").limit,source("lead_sugar_highash").basis.includes(">1.0%"),source("lead_starch_conversion_highash").limit],[5,true,5]);
 assert.deepEqual([source("lead_hardboiled").limit,source("copper_hardboiled").limit,source("arsenic_hardboiled").limit,source("tin_hardboiled").limit,source("hydrocyan_confectionery").limit],[2,5,1,5,5]);
 assert.deepEqual([source("aflatoxins_composite").limit,source("b1_composite").limit,source("aflatoxins_spices").limit,source("b1_spices").limit],[20,10,30,15]);
 assert.equal(source("arsenic_natural_colour").basis.includes("dry colouring matter"),true);
 assert.equal(source("tin_fruit_pulp").basis.includes("no can-only qualifier"),true);
});
test("43 case options preserve critical cannot-inherit boundaries",()=>{
 assert.ok(keys("04-04-2-sterilized-fungi","canned_mushroom").includes("tin_canned_mushroom"));
 assert.ok(!keys("04-04-2-sterilized-fungi","actual_mushroom").includes("lead_canned_mushroom"));
 assert.ok(keys("04-04-1-fruits-and-vegetable-chutney","mango_chutney").includes("tin_mango_chutney"));
 assert.ok(keys("04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms","cucumber_pickle").includes("tin_pickled_cucumber"));
 assert.ok(!keys("04-04-2-fermented-fungi","actual_mushroom").includes("lead_canned_mushroom"));
 assert.deepEqual(keys("11-11-1-dried-glucose-syrup","high_ash_article_excluded"),[]);
 assert.match(d.records.find(x=>x.catalog_id==="11-11-1-dried-glucose-syrup").source_branch_options[0].excludes,/>1%/);
 assert.deepEqual(keys("18-18-1-indian-confections","actual_confectionery"),["hydrocyan_confectionery"]);
 assert.equal(keys("18-18-1-starch-based-sweets","hard_boiled_candy").length,5);
 assert.ok(!keys("12-12-2-seasoning","verified_pure_spice_mix").includes("aflatoxins_composite"));
 assert.ok(keys("12-12-6-culinary-pastes","verified_spice_containing_composite").includes("aflatoxins_composite"));
 assert.deepEqual(keys("99-99-1-colouring-foods","non_synthetic_colour"),["lead_food_colour","arsenic_natural_colour"]);
});
test("All 43 user-facing panels are absent by default and expose only conditional rows when operator picks a subtype",()=>{
 const c=context();const included=new Set(d.records.map(x=>x.catalog_id));
 for(const x of cat.filter(x=>!included.has(x.id)))assert.equal(c.pmsv43ConditionalArticleHtml(x),"");
 for(const r of d.records){
  const p=map.get(r.catalog_id),html=c.pmsv43ConditionalArticleHtml(p);
  assert.match(html,/First exact finished CTR source unresolved/);
  assert.doesNotMatch(html,/CONDITIONAL OFFICIAL SOURCE REFERENCE/);
  c.pmsv43ArticleSelections[r.catalog_id]=r.source_branch_options[0].key;
  const out=c.pmsv43ConditionalArticleHtml(p);
  assert.match(out,/CONDITIONAL OFFICIAL SOURCE REFERENCE — NOT APPLIED/);
  if(r.source_branch_options[0].article_keys.length)assert.match(out,/Maximum limit — source only/);
  else assert.match(out,/Source intentionally excluded/i);
  assert.doesNotMatch(out,/COMPLIANCE APPROVED|LAB PASS: true|AUTO APPLIED/i);
  delete c.pmsv43ArticleSelections[r.catalog_id];
 }
});
test("Any mutation to an official article, legal predicate, status, linkage, source version or ledger disables every new panel",()=>{
 const changes=[
 c=>c.pmsv43ConditionalSource.positive_source_rows[0].limit=9999,
 c=>c.pmsv43ConditionalSource.positive_source_rows[1].article="Any foods",
 c=>c.pmsv43ConditionalSource.records[0].source_branch_options[0].positive_evidence=["Any product"],
 c=>c.pmsv43ConditionalSource.records[8].source_branch_options[0].article_keys=["wrong"],
 c=>c.pmsv43ConditionalSource.records[17].requires_nonmatching_product_guard="Any form allowed",
 c=>c.pmsv43ConditionalSource.records[28].full_compliance_pass=true,
 c=>c.pmsv43ConditionalSource.version="Version VIII",
 c=>c.pmsv43ConditionalSource.first_exact_pending=115,
 c=>c.pmsvCurrent533SourceLedger.records[0].product_name="Changed",
 c=>c.contaminantsDb.source_version="not Version IX"
 ];
 for(const change of changes){
  const c=context();change(c);assert.equal(c.pmsv43ValidDocument(),false);
  assert.match(c.pmsv43ConditionalArticleHtml(map.get(d.records[0].catalog_id)),/withheld/);
 }
});
test("The GitHub site, workbench loader and verification workflow install the exact source matrix",()=>{
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 assert.match(html,/fssai-43-exact-article-research-gates\.js\?v=20261012-source43/);
 assert.match(src,/fssai-forty-plus-conditional-finished-article-2026-10-12\.json/);
 assert.match(src,/pmsvBefore43CurrentStatusHtml\(p\)\+pmsv43ConditionalArticleHtml\(p\)/);
 const yaml=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(yaml,/fssai-43-current-116-named-source-adjudication-2026-10-12\.test\.cjs/);
});
