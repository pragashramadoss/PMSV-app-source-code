"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const rd=name=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",name),"utf8"));
const d=rd("fssai-current40-generic-metal-positive-source-gates-2026-10-13.json");
const q=rd("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const l=rd("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json");
const js=fs.readFileSync(path.join(root,"fssai-current40-positive-metal-fallback-sources-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsv493Valid:()=>true,pmsv40LegalGatesValid:()=>true,pmsv40CtrComparisonsValid:()=>true,
 pmsvReviewSnapshotDigest:digest,pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"Original status remains pending",esc:String};
 vm.createContext(c);vm.runInContext(js,c);c.pmsvCurrent40FallbackData=JSON.parse(JSON.stringify(d));return c;
}
const p=r=>({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs});
test("All forty open identities have individual conditional source branches without first-source status changes",()=>{
 const c=ctx();assert.equal(c.pmsvCurrent40FallbackValid(),true);
 assert.equal(d.catalogue,533);assert.equal(d.partial_named_sources,493);
 assert.equal(d.pending_first_named_sources,40);
 assert.equal(d.reviewed_pending_products.length,40);
 assert.equal(new Set(d.reviewed_pending_products.map(x=>x.catalog_id)).size,40);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,40);
 assert.equal(d.named_ctr_source_promotions,0);
 for(const x of d.reviewed_pending_products){
   assert.ok(q.review_records.some(y=>y.catalog_id===x.catalog_id&&y.product_name===x.product_name));
   assert.equal(x.fallback_fully_adjudicated,false);
   assert.equal(x.numerical_contaminant_limit_auto_applied,false);
   assert.equal(x.complete_contaminant_panel_pass,false);
 }
});
test("Six positive exact official metal rows: named foods-not-specified values and source pages",()=>{
 assert.deepEqual(d.fallback_metal_rows.map(x=>[x.metal,x.limit,x.page0]),
 [["Lead",2.5,3],["Copper",30,6],["Arsenic",1.1,8],["Tin",250,10],["Cadmium",1.5,11],["Mercury",1,11]]);
 assert.equal(d.conditional_candidate_links,240);
 for(const x of d.fallback_metal_rows){
   assert.equal(x.exact_official_article,"Foods not specified");
   assert.equal(x.article_text_verified,true);
   assert.equal(x.numeric_automatically_assigned,false);
   assert.match(x.official_pdf,/Comp_Contaminants_Regulations_03_02_2026_IX\.pdf/);
 }
});
test("Required specificity hierarchy, Indian Pharmacopoeia route and original 40 identity blockers remain separate",()=>{
 for(const x of d.reviewed_pending_products){
  const z=x.named_article_hierarchy;
  assert.equal(z.screen_named_food_article_first,true);
  assert.equal(z.last_resort_fallback_only_if_no_named_metal_article_matches,true);
  assert.equal(z.reject_unverified_raw_ingredient_transfer,true);
  assert.equal(z.check_applicable_fssr_quality_and_ctr_source,true);
  assert.ok(x.positive_article_evidence_to_obtain.length>70);
  assert.ok(x.disambiguation_evidence.length>0);
  assert.equal(x.source_fallback_rows.length,6);
 }
 for(const id of ["11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th","99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc"]){
 const x=d.reviewed_pending_products.find(z=>z.catalog_id===id);
 assert.equal(x.named_article_hierarchy.if_individual_chemical_check_current_indian_pharmacopoeia_monograph,true);
 }
});
test("The legally universal All foods methylmercury line is not a first named article promotion",()=>{
 assert.equal(d.universal_methylmercury.article,"All foods");
 assert.equal(d.universal_methylmercury.limit,0.25);
 assert.equal(d.universal_methylmercury.page0,11);
 assert.equal(d.universal_methylmercury.not_a_named_article_promotion,true);
});
test("All forty products show real positive law, condition-first wording, no assumed PASS",()=>{
 const c=ctx();
 for(const r of d.reviewed_pending_products){
  const h=c.sourcePinned121ResearchProofHtml(p(r));
  assert.match(h,/Official positive source pathway/);
  assert.match(h,/CONDITIONAL ONLY/);
  assert.match(h,/Original status remains pending/);
  assert.match(h,/Methyl Mercury/);
  assert.match(h,/NO limits assigned/);
  assert.ok(!h.includes("COMPLIANCE PASS"));
 }
});
test("Alteration of metadata, numerical source, flags, or pending identity fails closed",()=>{
 for(const flag of ["limit","universal","auto","status","identity","upstream","rows","legal_gate"]){
   const c=ctx();
   if(flag==="limit")c.pmsvCurrent40FallbackData.fallback_metal_rows[0].limit=999;
   if(flag==="universal")c.pmsvCurrent40FallbackData.universal_methylmercury.limit=999;
   if(flag==="auto")c.pmsvCurrent40FallbackData.reviewed_pending_products[0].numerical_contaminant_limit_auto_applied=true;
   if(flag==="status")c.pmsvCurrent40FallbackData.named_ctr_source_promotions=40;
   if(flag==="identity")c.pmsvCurrent40FallbackData.reviewed_pending_products[0].catalog_id="invented";
   if(flag==="upstream")c.pmsv493Valid=()=>false;
   if(flag==="rows")c.pmsvCurrent40FallbackData.reviewed_pending_products[0].source_fallback_rows=[];
   if(flag==="legal_gate")c.pmsvCurrent40FallbackData.reviewed_pending_products[0].named_article_hierarchy.last_resort_fallback_only_if_no_named_metal_article_matches=false;
   assert.equal(c.pmsvCurrent40FallbackValid(),false,flag);
 }
});
test("Script order and checks never modify WordPress",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8"),
 a=h.indexOf("fssai-40-current-named-ctr-comparisons-2026-10-13.js"),
 b=h.indexOf("fssai-current40-positive-metal-fallback-sources-2026-10-13.js"),
 c=h.indexOf("fssai-pending-40-quality-coverage.js");
 assert.ok(a>0&&b>a&&c>b);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
});
