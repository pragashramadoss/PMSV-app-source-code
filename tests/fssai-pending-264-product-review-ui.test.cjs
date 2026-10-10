"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const index=JSON.parse(read("fssai-product-helper-preview-01/data/standard-search-index-v1.json")).products;
const manifest=JSON.parse(read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json"));
const html=read("fssai-product-helper-preview-01/index.html"),queue=read("FSSAI-CONTAMINANT-EVIDENCE-QUEUE-2026-10-10.md");
const byId=new Map(index.map(x=>[x.id,x]));
const queued=new Set([...queue.matchAll(/^\| [^|]+\| `([^`]+)` \|/gm)].map(m=>m[1]));
test("All 263 pending identities have accurate individual FSSAI review records with no exemption or PASS",()=>{
 assert.equal(queued.size,263);
 assert.equal(manifest.count,263);
 assert.equal(manifest.records.length,263);
 assert.deepEqual(new Set(manifest.records.map(x=>x.catalog_id)),queued);
 assert.equal(manifest.full_compliance_achieved,0);
 assert.equal(manifest.verified_evidence_added,1);
 for(const item of manifest.records){
  const product=byId.get(item.catalog_id);
  assert.ok(product,item.catalog_id);
  assert.equal(item.product_name,product.name,item.catalog_id);
  assert.equal(item.fssr,product.fssr,item.catalog_id);
  assert.equal(item.assessment_status,"exact_contaminant_evidence_not_yet_established");
  assert.equal(item.auto_apply_numeric_limit,false);
  assert.equal(item.unconditional_compliance_pass,false);
  assert.equal(item.exemption_asserted,false);
  assert.ok(item.review_requirements.length>=3);
  assert.match(item.official_source,/^https:\/\/fssai\.gov\.in\/upload\/uploadfiles\/files\/Comp_Contaminants_/);
 }
});
test("Risk-sensitive FSSAI product distinctions are individually documented",()=>{
 const requirements=id=>manifest.records.find(p=>p.catalog_id===id)?.review_requirements.join(" | ")||"";
 for(const [id,pattern] of [
   ["01-01-5-milk-powders-and-cream-powder",/4 µg\/kg.*6 µg\/kg/],
   ["06-06-1-quinoa",/explicitly excluded/i],
   ["06-06-4-macaroni-products-instant-noodle",/legume or tuber/i],
   ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake",/Cocoa Powder lead 5 mg\/kg/],
   ["02-02-2-fat-spread",/Nickel rule/i],
   ["100-100-royal-jelly",/Bees Wax 2 mg\/kg/],
   ["coffee-chicory-mixture",/coffee-only OTA/i],
   ["10-10-2-egg-powder",/shell-free/i],
   ["purified-vending-water",/2\.10\.9/]
 ]){
  assert.match(requirements(id),pattern,id);
 }
 assert.equal(requirements("04-04-2-peanut-butter"),"","Peanut Butter has moved from missing-exact to partial verified composite aflatoxin evidence");
});
test("Product Contaminants displays evidence gaps and cannot turn review notes into numeric limits",()=>{
 assert.match(html,/let contaminantsPendingReviewDb=null/);
 assert.match(html,/contaminants-v9-unresolved-264-review-v1\.json\?v=1/);
 assert.match(html,/el\.innerHTML=profileMsg\s*\+pendingContaminantReviewNotice\(p\)/);
 const start=html.indexOf("function pendingContaminantReviewNotice(p){");
 const end=html.indexOf("function renderProductContaminants(){",start);
 assert.ok(start>=0&&end>start);
 const ctx={contaminantsPendingReviewDb:manifest,esc:value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))};
 vm.runInNewContext(html.slice(start,end),ctx);
 let sample=byId.get("06-06-1-quinoa");
 const result=ctx.pendingContaminantReviewNotice(sample);
 assert.match(result,/Exact finished-product contaminant evidence still incomplete/);
 assert.match(result,/explicitly excluded/i);
 assert.match(result,/not an exemption/);
 assert.doesNotMatch(result,/compliance PASS|0\.2 mg\/kg as a limit/);
 assert.equal(ctx.pendingContaminantReviewNotice(byId.get("coffee")),"");
});
