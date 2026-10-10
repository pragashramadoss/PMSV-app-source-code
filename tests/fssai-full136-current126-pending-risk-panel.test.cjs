"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const review=read(base+"rules/fssai-full-136-identity-applicability-review-2026-10-10.json");
const current=read(base+"rules/contaminants-v9-unresolved-264-review-v1.json");
const contaminant=read(base+"rules/contaminants-v9-core.json");
const index=read(base+"standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const by=new Map(index.map(x=>[x.id,x])),pending=new Set(current.records.map(x=>x.catalog_id));
function make(){
 const a=html.indexOf("function sourceSpecificPendingRiskReviewHtml(p){"),
  b=html.indexOf("function sourcePinnedCompositeOrSoupPartialHtml(p){",a);
 assert.ok(a>=0&&b>a);
 const ctx=vm.createContext({full136ReviewDb:structuredClone(review),contaminantsPendingReviewDb:structuredClone(current),contaminantsDb:structuredClone(contaminant),esc:s=>String(s).replaceAll("<","&lt;")});
 vm.runInContext(html.slice(a,b),ctx);
 return {ctx,view:id=>vm.runInContext("sourceSpecificPendingRiskReviewHtml("+JSON.stringify(by.get(id))+")",ctx)};
}
test("All 126 currently unresolved products show their own exact source risk and forbidden inherited numeric articles",()=>{
 assert.equal(review.records.length,136);assert.equal(current.records.length,126);
 const {view}=make();
 for(const row of current.records){
  const r=review.records.find(x=>x.catalog_id===row.catalog_id);
  assert.ok(r,row.catalog_id);
  const html=view(row.catalog_id);
  assert.ok(html.includes("Requires verification"),row.catalog_id);
  assert.ok(html.includes("NO PASS"),row.catalog_id);
  assert.ok(html.includes(r.priority_family_risk),row.catalog_id);
  assert.ok(html.includes("Limits that must not be inherited:"),row.catalog_id);
  assert.ok(html.includes(r.per_product_prohibited_inheritance),row.catalog_id);
  assert.ok(html.includes("Not an exemption or noncompliance finding"),row.catalog_id);
 }
});
test("Previously source-matched products are excluded from the unresolved 126-product risk panel",()=>{
 const {view}=make();
 const ten=read(base+"rules/fssai-next10-exact-source-candidate-2026-10-10.json").matched;
 assert.equal(ten.length,10);
 for(const x of ten){
  assert.ok(!pending.has(x.catalog_id));
  assert.equal(view(x.catalog_id),"",x.catalog_id);
 }
 assert.equal(review.records.filter(x=>x.evidence_disposition==="no_first_exact_named_article_yet").length,126);
});
test("Source version, identity or compliance-pass tampering cannot present unverified sources as applicable",()=>{
 const {ctx,view}=make(),id="06-06-1-quinoa";
 assert.ok(pending.has(id));
 const row=ctx.full136ReviewDb.records.find(x=>x.catalog_id===id);
 assert.ok(row);
 row.finished_product_compliance_pass=true;
 assert.match(view(id),/unavailable/);
 row.finished_product_compliance_pass=false;
 row.product_name="Something else";
 assert.match(view(id),/unavailable/);
 row.product_name=by.get(id).name;
 ctx.full136ReviewDb.regulatory_source="https://example.invalid";
 assert.match(view(id),/unavailable/);
 ctx.full136ReviewDb=structuredClone(review);
 ctx.contaminantsPendingReviewDb.records=ctx.contaminantsPendingReviewDb.records.filter(x=>x.catalog_id!==id);
 assert.equal(view(id),"");
});
