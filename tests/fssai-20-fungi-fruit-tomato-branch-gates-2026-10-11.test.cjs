"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"../fssai-product-helper-preview-01"),read=p=>JSON.parse(fs.readFileSync(path.join(base,p),"utf8")),code=p=>fs.readFileSync(path.join(base,p),"utf8");
const d=read("data/rules/fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json");
const official=read("data/rules/contaminants-v9-core.json"),chapter=read("data/rules/chapter-2-3-fruit-vegetable-v1.json");
const idx=read("data/standard-search-index-v1.json").products,byId=new Map(idx.map(p=>[p.id,p]));
const ctx=vm.createContext({contaminantsDb:official,chapterRuleDbs:[chapter],esc:s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(code("fssai-20-fungi-fruit-tomato-article-branches.js"),ctx);
ctx.pmsvTwentySourceDb=d;
const show=id=>vm.runInContext("sourcePinnedTwentyArticleBranchesHtml("+JSON.stringify(byId.get(id))+")",ctx);
test("Twenty FoSCoS identities, each exact Chapter 2.3 standard and no false first-source promotion",()=>{
 assert.equal(d.review_products,20);assert.equal(d.records.length,20);
 assert.equal(d.source_articles.length,11);assert.equal(d.positive_conditional_branches,25);
 assert.equal(d.catalogue,533);assert.equal(d.partial_evidence,415);assert.equal(d.pending_first_exact,118);
 assert.equal(d.no_new_unconditional_first_source_promotions,true);assert.equal(d.finished_compliance_passes,0);
 assert.match(code("index.html"),/fssai-20-fungi-fruit-tomato-article-branches\.js\?v=20261011-branch20/);
 const uniq=new Set;
 for(const r of d.records){
  const p=byId.get(r.catalog_id);
  assert.ok(p&&p.fssr===r.fssr&&p.fcs===r.fcs&&p.name===r.name,r.catalog_id);
  assert.ok(chapter.standards.some(x=>x.key===r.rule_key));
  uniq.add(r.catalog_id);const shown=show(r.catalog_id);
  assert.match(shown,/Exact FSSAI mushroom, fruit or tomato source route/);
  assert.match(shown,/NOT A COMPLIANCE PASS/);
  assert.doesNotMatch(shown,/Conditional named FSSAI reference — NOT APPLIED/);
 }
 assert.equal(uniq.size,20);
});
test("Only named mushroom-containing articles get agaric acid; dry/frozen fungi cannot inherit canned metals",()=>{
 for(const r of d.records.filter(x=>x.regulatory_case==="fungi")){
  assert.ok(r.branches.some(x=>x.id==="mushroom_species_proven"));
  const id=r.catalog_id;ctx.pmsvTwentySubtypeChoices[id]="mushroom_species_proven";
  assert.match(show(id),/Agaric acid: 100 ppm/);
  if(/dried|frozen|grits|concentrate|extract|salted|fermented|pickled/.test(r.name.toLowerCase()))
   assert.ok(!r.branches.some(x=>x.id==="actually_canned_mushroom"),r.name);
 }
 const id="04-04-2-sterilized-fungi";
 ctx.pmsvTwentySubtypeChoices[id]="actually_canned_mushroom";
 const h=show(id);assert.match(h,/Lead: 1 mg\/kg/);assert.match(h,/Tin: 250 mg\/kg/);
 assert.match(h,/NOT APPLIED/);
});
test("Mango chutney and processed tomato source article not assigned by a general vegetable name",()=>{
 const chutney="04-04-1-fruits-and-vegetable-chutney";
 ctx.pmsvTwentySubtypeChoices[chutney]="verified_mango_chutney";
 assert.match(show(chutney),/Mango chutney/);
 assert.match(show(chutney),/Tin: 250 mg\/kg/);
 const tomato="concentrated-vegetable-pulp-puree";
 ctx.pmsvTwentySubtypeChoices[tomato]="verified_processed_tomato_concentrate";
 const h=show(tomato);assert.match(h,/Processed tomato concentrates/);
 assert.match(h,/100 mg\/kg/);assert.match(h,/DRIED TOMATO SOLIDS/);
 assert.match(h,/NOT APPLIED/);
});
test("Date paste and fruit sweets do not inherit fruit pulp article without product identity confirmation",()=>{
 for(const id of ["04-04-1-date-paste","04-04-1-fruit-cheese","04-04-1-fruit-bar-toffee"]){
  const initial=show(id);assert.doesNotMatch(initial,/Copper: 5 mg\/kg/);
  ctx.pmsvTwentySubtypeChoices[id]="fruit_pulp_identity_checked";
  assert.match(show(id),/Copper: 5 mg\/kg/);assert.match(show(id),/NOT APPLIED/);
 }
});
test("Mutated numeric source rows or identity fail closed; no product outside twenty inherits source",()=>{
 const id="04-04-1-date-paste",p=byId.get(id);
 assert.match(vm.runInContext("sourcePinnedTwentyArticleBranchesHtml("+JSON.stringify({...p,name:"Cocoa mass"})+")",ctx),/withheld/);
 const former=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(official));
 ctx.contaminantsDb.metal_article_rules_v9.Copper.find(r=>r.article==="Pulp and pulp products of any fruit").limit=500;
 assert.match(show(id),/withheld/);ctx.contaminantsDb=former;
 assert.equal(show("11-11-1-cube-sugar"),"");
 const v=ctx.pmsvTwentySourceDb;ctx.pmsvTwentySourceDb=null;
 assert.equal(show(id),"");ctx.pmsvTwentySourceDb=v;
});
