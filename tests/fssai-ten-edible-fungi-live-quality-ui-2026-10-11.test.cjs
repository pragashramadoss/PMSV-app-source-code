"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const d=read(base+"rules/fssai-ten-edible-fungi-2-3-62-quality-and-ctr-gates-2026-10-11.json");
const ctr=read(base+"rules/contaminants-v9-core.json");
const index=read(base+"standard-search-index-v1.json").products,by=new Map(index.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function sourcePinnedFungiQualitySourceReviewHtml(p){"),b=html.indexOf("function sourcePinnedAyurvedaRecipeB1ReviewHtml(p){",a+55);
assert.ok(a>0&&b>a);
const c=vm.createContext({fungiExactQualityDb:structuredClone(d),contaminantsDb:structuredClone(ctr),esc:x=>String(x).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(html.slice(a,b),c);
const draw=p=>vm.runInContext("sourcePinnedFungiQualitySourceReviewHtml("+JSON.stringify(p)+")",c);
test("All 10 fungi product-identity screens show only their own FSSAI quality benchmarks",()=>{
 for(const r of d.records){
  const shown=draw(by.get(r.catalog_id));
  assert.match(shown,/exact quality references/);assert.match(shown,/review, NOT compliance PASS/);
  assert.match(shown,/Agaric acid 100 ppm/);assert.match(shown,/NOT APPLIED/);
  assert.match(shown,/tin 250 mg\/kg/);assert.match(shown,/lead 1 mg\/kg/);
  assert.ok(shown.includes(String(r.criteria[0].value??r.criteria[0].min)));
 }
});
test("No unrelated category or product name can borrow official FSSR 2.3.62 criteria",()=>{
 const p=by.get("04-04-2-dried-fungi");assert.ok(p);
 assert.equal(draw(by.get("04-04-2-cocoa-beans")),"");
 for(const delta of [{name:"Unknown Dry Product"},{fssr:"2.4.12"},{fcs:"14.1.2.1"}])
  assert.match(draw({...p,...delta}),/withheld/);
});
test("Changed nominal quality numbers, source file fingerprint and approval flags fail closed",()=>{
 const p=by.get("04-04-2-quick-frozen-fungi");
 const initial=c.fungiExactQualityDb;
 for(const edit of [
  x=>x.records.find(r=>r.catalog_id===p.id).criteria[0].value=100,
  x=>x.quality_rows_fnv32_fingerprint="invalid",
  x=>x.records.find(r=>r.catalog_id===p.id).finished_product_ctr_numeric_limit_auto_apply=true
 ]){
  c.fungiExactQualityDb=structuredClone(d);edit(c.fungiExactQualityDb);
  assert.match(draw(p),/withheld/);
 }
 c.fungiExactQualityDb=initial;
 const originalCore=c.contaminantsDb;
 c.contaminantsDb=structuredClone(ctr);
 c.contaminantsDb.metal_article_rules_v9.Tin.find(r=>r.article==="Canned mushrooms").limit=400;
 assert.match(draw(p),/withheld/);
 c.contaminantsDb=originalCore;
});
test("121 research worksheets include 55 fungi quality records and do not mark fungi CTR verified",()=>{
 const q=read("audit-output/fssai-next-121-first-exact-source-research-queue.json");
 assert.deepEqual([q.total,q.partial,q.pending,q.fungi_quality_products,q.fungi_quality_source_rows,q.fungi_first_exact_contaminant_promotions],[533,412,121,10,55,0]);
 const fungi=q.records.filter(x=>x.fungi_exact_quality_source_review_only);
 assert.equal(fungi.length,10);
 for(const r of fungi){
  const x=r.fungi_exact_quality_source_review_only;
  assert.equal(x.first_exact_ctr_source_cleared,false);assert.equal(x.complete_compliance_pass,false);
  assert.equal(x.canned_mushroom_tin_or_lead_auto_applied,false);
  assert.equal(x.mushroom_agaric_acid_article_auto_applied,false);
 }
});
