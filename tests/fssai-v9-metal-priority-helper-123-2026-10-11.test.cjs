"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read(base+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const core=read(base+"rules/contaminants-v9-core.json");
const products=read(base+"standard-search-index-v1.json").products;
const unresolved=read(base+"rules/contaminants-v9-unresolved-264-review-v1.json").records;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const begin=html.indexOf("function sourcePriorityMetalFallbackReviewHtml(p){"),end=html.indexOf("function pendingContaminantReviewNotice(p){",begin+30);
assert.ok(begin>0&&end>begin,"source priority UI function missing");
const ctx=vm.createContext({sourcePriorityMetalDb:structuredClone(m),contaminantsDb:structuredClone(core),contaminantsPendingReviewDb:{records:unresolved},
 esc:s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))});
vm.runInContext(html.slice(begin,end),ctx);
const p=id=>products.find(x=>x.id===id),draw=obj=>vm.runInContext("sourcePriorityMetalFallbackReviewHtml("+JSON.stringify(obj)+")",ctx);
test("Exact 121 pending identities—not historic queue—are source review targets",()=>{
 const historical=new Set(unresolved.map(x=>x.catalog_id)),active=new Set(m.unresolved_first_exact_catalog_ids);
 assert.equal(historical.size,126);assert.equal(active.size,121);assert.equal(m.unresolved_first_exact_catalog_id_count,121);
 for(const id of m.unresolved_first_exact_catalog_ids)assert.ok(historical.has(id));
 for(const id of m.historical_queue_products_with_new_partial_evidence)assert.ok(historical.has(id)&&!active.has(id),id);
 assert.deepEqual(new Set(m.historical_queue_products_with_new_partial_evidence),new Set(["11-11-1-cane-jaggery-or-cane-gur","11-11-1-gur-or-jaggery","06-06-3-fruit-vegetable-cereal-flakes"]));
});
test("Every current product-specific pending reference is fail-closed when rendering",()=>{
 for(const id of m.unresolved_first_exact_catalog_ids){
  const item=p(id);assert.ok(item,id);
  const h=draw(item);assert.match(h,/Source article precedence/);assert.match(h,/NOT APPLIED/);
  assert.match(h,/Foods not specified/);assert.match(h,/Methyl Mercury/);
  assert.match(h,/All foods/);assert.match(h,/Lead/);assert.match(h,/Copper/);
  assert.match(h,/Arsenic/);assert.match(h,/Tin/);assert.match(h,/Cadmium/);
  assert.match(h,/Mercury/);
 }
});
test("Product identity mismatches and already partially verified identities receive no fallback panel",()=>{
 const item=p("04-04-2-dried-fungi");assert.ok(item);
 assert.equal(draw({...item,name:"Not Dried Fungi"}),"");
 assert.equal(draw({...item,fssr:"2.2.9"}),"");
 assert.equal(draw({...item,fcs:"99.9"}),"");
 for(const id of m.historical_queue_products_with_new_partial_evidence)assert.equal(draw(p(id)),"");
 assert.equal(draw(p("05-05-1-chocolate")),"");
});
test("Tampered official source master, candidate value or source-gate declaration withholds all numbers",()=>{
 const item=p("04-04-2-dried-fungi");assert.ok(item);
 const originalDb=ctx.contaminantsDb,originalManifest=ctx.sourcePriorityMetalDb;
 const bad=structuredClone(core),lead=bad.metal_article_rules_v9.Lead.find(x=>x.row_type==="default");
 assert.ok(lead);lead.limit=999;
 ctx.contaminantsDb=bad;
 assert.match(draw(item),/withheld due to source mismatch/);
 ctx.contaminantsDb=originalDb;
 const incorrect=structuredClone(m);incorrect.rows.find(x=>x.metal==="Mercury"&&x.row_type==="default").limit=900;
 ctx.sourcePriorityMetalDb=incorrect;
 assert.match(draw(item),/withheld due to source mismatch/);
 const invalid=structuredClone(m);invalid.unresolved_first_exact_before=122;
 ctx.sourcePriorityMetalDb=invalid;
 assert.match(draw(item),/withheld due to source mismatch/);
 ctx.sourcePriorityMetalDb=originalManifest;
});
test("UI loads source policy and never counts all-food or default rows as exact product evidence",()=>{
 assert.match(html,/let sourcePriorityMetalDb=null/);
 assert.match(html,/fssai-v9-metal-fallback-precedence-2026-10-11.json/);
 assert.match(html,/sourcePriorityMetalFallbackReviewHtml\(p\)/);
 assert.match(html,/sourcePriorityMetalDb=await priority.json\(\)/);
 assert.doesNotMatch(html.slice(begin,end),/sourceCompliancePass=true|certified|approveProduct\(/i);
});
test("Every one of 121 research worksheets has all seven rows but zero approved numeric rules",()=>{
 const research=read("audit-output/fssai-next-121-first-exact-source-research-queue.json");
 assert.deepEqual([research.total,research.partial,research.pending,research.full_compliance_passes],[533,412,121,0]);
 assert.deepEqual([research.metal_priority_source_rows,research.metal_default_precedence_reviews,research.all_foods_methyl_mercury_research_references],[7,726,121]);
 assert.equal(research.records.length,121);
 for(const r of research.records){
  assert.ok(m.unresolved_first_exact_catalog_ids.includes(r.catalog_id));
  assert.equal(r.generic_metal_precedence_references_review_only.length,7);
  assert.equal(r.generic_metal_precedence_references_review_only.filter(x=>x.row_type==="default").length,6);
  assert.equal(r.generic_metal_precedence_references_review_only.filter(x=>x.row_type==="all_foods").length,1);
  for(const x of r.generic_metal_precedence_references_review_only){
   assert.equal(x.counts_as_first_exact_product_article,false);
   assert.equal(x.applied_limit,false);assert.equal(x.compliance_pass,false);
  }
 }
});
