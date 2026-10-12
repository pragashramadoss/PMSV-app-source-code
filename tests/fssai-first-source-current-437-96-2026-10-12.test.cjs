"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),data="fssai-product-helper-preview-01/data/rules/";
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,data+n),"utf8"));
const m=rd("fssai-nine-mushroom-containing-exact-named-subroutes-2026-10-12.json"),
 old=rd("fssai-current-first-source-533-live-ledger-428-105-2026-10-12.json"),
 d=rd("fssai-current-first-source-533-live-ledger-437-96-2026-10-12.json"),
 oldQ=rd("fssai-current-105-first-exact-source-proof-worklist-2026-10-12.json"),
 q=rd("fssai-current-96-first-exact-source-proof-worklist-2026-10-12.json"),
 cross=rd("fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json"),
 js=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/fssai-first-source-current-437-96.js"),"utf8"),
 page=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const hash=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,contaminantsDb:{official_sources:[{url:m.official_ctr}],source_version:m.date_source_version},
 pmsv2026Current428Ledger:old,pmsv2026Current105Queue:oldQ,
 pmsv2026Current428Valid:()=>true,pmsvReviewSnapshotDigest:hash,
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv2026Current437Manifest=structuredClone(m);
 c.pmsv2026Current437Ledger=structuredClone(d);
 c.pmsv2026Current96Queue=structuredClone(q);
 c.pmsv2026Current437SourceCrosswalk=structuredClone(cross);
 return c;
}
test("Nine source-only conditional mushroom subtypes move 428/105 to 437/96",()=>{
 const c=ctx();assert.equal(c.pmsv2026Current437Valid(),true);
 assert.equal(d.records.length,533);assert.equal(d.partial_exact,437);assert.equal(d.first_source_pending,96);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,437);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,96);
 assert.equal(q.review_records.length,96);assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,96);
 assert.equal(m.promotions.length,9);assert.equal(m.latest.full_approvals,0);
 assert.ok(page.includes("fssai-first-source-current-437-96.js"));
});
test("Exact official article Agaric acid 100 ppm is linked to verified FSSR 2.3.62 and 2.3.43 ONLY",()=>{
 const row=cross.source_articles.find(x=>x.key==="agaric_mushroom");
 assert.deepEqual([row.metal,row.article,row.value,row.unit],["Agaric acid","Food containing mushrooms",100,"ppm"]);
 assert.equal(m.promotions.filter(x=>x.fssr==="2.3.62").length,7);
 assert.equal(m.promotions.filter(x=>x.fssr==="2.3.43").length,2);
 for(const p of m.promotions){
  assert.equal(p.substance,"Agaric acid");assert.equal(p.maximum,100);assert.equal(p.unit,"ppm");
  assert.equal(p.actual_lot_mushroom_species_confirmed,false);
  assert.equal(p.actual_finished_product_mushroom_content_confirmed,false);
  assert.equal(p.source_limit_numeric_auto_application,false);assert.equal(p.laboratory_pass,false);
  assert.equal(p.full_regulatory_compliance_pass,false);
  const x=d.records.find(x=>x.catalog_id===p.catalog_id);assert.equal(x.sample_lab_pass,false);
  assert.equal(x.complete_contaminant_panel,false);assert.equal(x.product_compliance_approval,false);
 }
});
test("Fungal extracts and concentrates remain first-exact-source PENDING; no banned carryover",()=>{
 for(const id of m.excluded_still_pending){
   assert.ok(q.review_records.some(x=>x.catalog_id===id));
   assert.equal(d.records.find(x=>x.catalog_id===id)?.source_status,"FIRST_EXACT_SOURCE_PENDING");
 }
 assert.ok(m.promotions.every(x=>!m.excluded_still_pending.includes(x.catalog_id)));
});
test("Source evidence, manifest, queue and lot-PASS tampering all fail closed",()=>{
 for(const part of ["manifest","ledger","queue","source"]){
  const c=ctx(),x=part==="manifest"?c.pmsv2026Current437Manifest:
    part==="ledger"?c.pmsv2026Current437Ledger:
    part==="queue"?c.pmsv2026Current96Queue:c.pmsv2026Current437SourceCrosswalk;
  if(part==="source")x.source_articles.find(x=>x.key==="agaric_mushroom").value=101;
  else x.tamper=true;
  assert.equal(c.pmsv2026Current437Valid(),false,part);
 }
 const c=ctx();c.pmsv2026Current437Ledger.records.find(x=>x.catalog_id===m.promotions[0].catalog_id).product_compliance_approval=true;
 assert.equal(c.pmsv2026Current437Valid(),false);
});
