"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=read("fssai-current40-decisive-positive-article-review-2026-10-13.json");
const q=read("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const l=read("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json");
const js=fs.readFileSync(path.join(root,"fssai-current40-decisive-positive-article-review-2026-10-13.js"),"utf8");
function ctx(){
 const c={console,pmsv493Valid:()=>true,pmsv40FourMetalProofValid:()=>true,
  pmsvPending40QualityCoverage:()=>new Map(d.records.map(x=>[x.catalog_id,{quality_module:x.separately_linked_fssr_quality_module}])),
  pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},
  sourcePinned121ResearchProofHtml:()=>"Previous panels intact"};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv40DecisiveReviewData=JSON.parse(JSON.stringify(d));return c;
}
test("All 40 finished foods preserve named CTR status and separate FSSR quality scope",()=>{
 assert.equal(ctx().pmsv40DecisiveReviewValid(),true);
 assert.equal(d.records.length,40);assert.equal(d.targeted_product_distinctions,22);
 assert.equal(new Set(d.records.map(x=>x.catalog_id)).size,40);
 assert.equal(d.records.filter(x=>x.separately_linked_fssr_quality_module).length,31);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,40);
 assert.equal(d.confirmed_named_source_promotions,0);assert.equal(d.full_compliance_approvals,0);
});
test("Nontransfer controls explicitly distinguish wrong ash tests and mistaken commodity articles",()=>{
 const find=id=>d.records.find(x=>x.catalog_id===id);
 assert.match(find("11-11-1-cube-sugar").decisive_positive_evidence,/total ash/i);
 assert.match(find("11-11-1-misri").decisive_positive_evidence,/total ash/i);
 assert.match(find("11-11-1-dried-glucose-syrup").decisive_positive_evidence,/more than 1%|high-ash/i);
 assert.match(find("06-06-1-quinoa").decisive_positive_evidence,/exclusion|exclude quinoa/i);
 assert.match(find("04-04-1-fruit-cheese").decisive_positive_evidence,/pulp and pulp products/);
 assert.match(find("100-100-royal-jelly").decision_track,/honey\/beeswax/);
});
test("Corruption fails closed",()=>{
 for(const mutate of [
 x=>x.records[0].product_name="Other",
 x=>x.records[1].official_fssai_product_source="https://scribd.com",
 x=>x.records[2].correct_named_contaminant_article_not_yet_evidenced=false,
 x=>x.records[3].separately_linked_fssr_quality_module="BAD",
 x=>x.records.pop(),
 x=>x.full_compliance_approvals=1
 ]){
  const c=ctx();mutate(c.pmsv40DecisiveReviewData);
  assert.equal(c.pmsv40DecisiveReviewValid(),false);
 }
});
test("Prior panels kept, and no compliance PASS in rendered HTML",()=>{
 const c=ctx(),x=d.records[22],h=c.pmsv40DecisiveReviewHtml({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
 assert.match(h,/STILL PENDING/);assert.doesNotMatch(h,/Compliance PASS achieved/);
});
