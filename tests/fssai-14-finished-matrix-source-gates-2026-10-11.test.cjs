"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"../fssai-product-helper-preview-01"),read=p=>JSON.parse(fs.readFileSync(path.join(base,p),"utf8")),txt=p=>fs.readFileSync(path.join(base,p),"utf8");
const db=read("data/rules/fssai-14-sugar-egg-confection-source-gates-2026-10-11.json"),ctr=read("data/rules/contaminants-v9-core.json");
const sugar=read("data/rules/chapter-2-8-sweetening-honey-v1.json"),egg=read("data/rules/chapter-2-5-meat-eggs-v1.json"),prod=read("data/standard-search-index-v1.json").products;
const byId=new Map(prod.map(x=>[x.id,x]));
const ctx=vm.createContext({contaminantsDb:ctr,chapterRuleDbs:[sugar,egg],esc:x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(txt("fssai-14-finished-form-gates.js"),ctx);ctx.pmsvFourteenSourceRoutes=db;
const show=id=>vm.runInContext("pmsvFourteenSourceGatesHtml("+JSON.stringify(byId.get(id))+")",ctx);
test("14 genuine FoSCoS identities have source-locked verified distinction and no first-source promotions",()=>{
 assert.equal(db.records.length,14);assert.equal(db.category_counts.sugar,8);
 assert.equal(db.category_counts.egg,4);assert.equal(db.category_counts.confectionery,2);
 assert.equal(db.current_partial,415);assert.equal(db.current_pending,118);
 assert.equal(db.first_source_promotions,0);assert.equal(db.finished_food_compliance_passes,0);
 assert.match(txt("index.html"),/fssai-14-finished-form-gates\.js\?v=20261011-14matrix/);
 for(const r of db.records){
  const p=byId.get(r.catalog_id);assert.ok(p,r.catalog_id);
  assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
  assert.equal(r.source_positive_finished_article,false);assert.equal(r.full_lot_compliance_pass,false);
  assert.match(show(p.id),/Finished-form source qualification/);
  assert.match(show(p.id),/No first-source promotion or compliance PASS/);
 }
});
test("Sugar reported total ash cannot qualify as measured sulphated ash, dried glucose excluded",()=>{
 const id="11-11-3-golden-syrup",dried="11-11-1-dried-glucose-syrup";
 assert.match(show(id),/Not assigned/);
 ctx.pmsvFourteenClaimedSubtype[id]="sulphated_ash_above_1_verified";
 assert.match(show(id),/Conditional named article candidate/);
 assert.match(show(id),/does NOT apply the limit/);
 ctx.pmsvFourteenClaimedSubtype[dried]="sulphated_ash_above_1_verified";
 assert.match(show(dried),/Direct article exclusion/);
 assert.doesNotMatch(show(dried),/Conditional named article candidate/);
});
test("Eggs shell-free 0.05 mg/kg pesticide row cannot automatically pass processed egg products",()=>{
 for(const r of db.records.filter(x=>x.type==="egg")){
  const h=show(r.catalog_id);assert.match(h,/0\.05 mg\/kg/);
  assert.match(h,/NOT automatically evaluated/);
  ctx.pmsvFourteenClaimedSubtype[r.catalog_id]="processed_egg_yolk";
  assert.match(show(r.catalog_id),/raw eggs MRL/);
 }
});
test("Broad confections only show 4 official metal rows after unverified hard-boiled process declaration",()=>{
 for(const r of db.records.filter(x=>x.type==="confectionery")){
  assert.match(show(r.catalog_id),/Not assigned/);
  ctx.pmsvFourteenClaimedSubtype[r.catalog_id]="declared_hard_boiled_2_7_1";
  const t=show(r.catalog_id);
  for(const [a,n] of [["Lead",2],["Arsenic",1],["Copper",5],["Tin",5]])assert.ok(t.includes(a+" "+n+" mg/kg"));
  assert.match(t,/no compliance limit auto-applied/);
 }
});
test("Source limit tampering and FoSCoS identity mutation withhold all numbers",()=>{
 const id="11-11-3-golden-syrup",p=byId.get(id);
 assert.match(vm.runInContext("pmsvFourteenSourceGatesHtml("+JSON.stringify({...p,name:"Refined Sugar"})+")",ctx),/withheld/);
 const prev=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(ctr));
 ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article.startsWith("All types of sugars")).limit=999;
 assert.match(show(id),/withheld/);
 ctx.contaminantsDb=prev;
});
