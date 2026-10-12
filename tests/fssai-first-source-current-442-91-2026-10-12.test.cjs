"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(path.join(root,base+"data/rules/"+n),"utf8"));
const m=read("fssai-four-sugar-high-ash-conditional-source-2026-10-12.json"),
 d=read("fssai-current-first-source-533-live-ledger-442-91-2026-10-12.json"),
 q=read("fssai-current-91-first-exact-source-proof-worklist-2026-10-12.json"),
 w=read("fssai-91-remaining-sugar-ash-evidence-decisions-2026-10-12.json"),
 old=read("fssai-current-first-source-533-live-ledger-438-95-2026-10-12.json"),
 prev=read("fssai-current-95-first-exact-source-proof-worklist-2026-10-12.json"),
 script=fs.readFileSync(path.join(root,base+"fssai-first-source-current-442-91.js"),"utf8"),
 page=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const h=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,contaminantsDb:{source_version:m.source_version,official_sources:[{url:m.official_ctr}]},
  pmsv2026Current438Ledger:old,pmsv2026Current95Queue:prev,
  pmsv2026Current438Valid:()=>true,pmsvReviewSnapshotDigest:h,
  pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
  pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(script,c);c.pmsv442Source=structuredClone(m);
 c.pmsv442Ledger=structuredClone(d);c.pmsv91Queue=structuredClone(q);c.pmsv91Dossiers=structuredClone(w);
 return c;
}
test("442 partial first sources, 91 pending, all 533 catalogue entries remain disjoint",()=>{
 assert.equal(ctx().pmsv442Valid(),true);
 assert.equal(d.records.length,533);assert.equal(d.partial_exact,442);assert.equal(d.first_source_pending,91);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,442);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,91);
 assert.equal(q.review_records.length,91);assert.equal(w.remaining_records.length,91);
 assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,91);
 assert.ok(page.includes("fssai-first-source-current-442-91.js"));
});
test("Four real FSSR sugar identities have only conditional >1% sulphated ash Pb source, no lot PASS",()=>{
 assert.equal(m.promotions.length,4);assert.equal(m.lead_mgkg,5);
 assert.equal(m.required_sulphated_ash_percent_gt,1);
 for(const key of ["khandsari","bura","plantation-white","golden-syrup"])
  assert.ok(m.promotions.some(x=>x.catalog_id.includes(key)));
 for(const x of m.promotions){
  assert.equal(x.lot_sulphated_ash_assayed,false);assert.equal(x.numeric_limit_auto_applied,false);
  assert.equal(x.lab_pass,false);assert.equal(x.full_compliance_pass,false);
  const r=d.records.find(v=>v.catalog_id===x.catalog_id);
  assert.equal(r.sample_lab_pass,false);assert.equal(r.product_compliance_approval,false);
 }
});
test("Four other sugar identities remain pending and ash methods not interchanged",()=>{
 assert.equal(m.pending_sugar_exclusions.length,4);
 for(const x of m.pending_sugar_exclusions)
  assert.ok(q.review_records.some(y=>y.catalog_id===x.catalog_id));
 assert.match(m.pending_sugar_exclusions.find(x=>x.catalog_id.includes("dried-glucose")).reason,/≤1%/);
 assert.match(m.pending_sugar_exclusions.find(x=>x.catalog_id.includes("cube-sugar")).reason,/total ash/);
});
test("Remaining detailed evidence gate source identities remain pending, no PASS",()=>{
 const ids=new Set(q.review_records.map(x=>x.catalog_id));
 for(const x of w.remaining_records){
  assert.ok(ids.has(x.catalog_id));assert.equal(x.still_first_source_pending,true);
  assert.equal(x.no_new_numeric_product_pass,true);assert.equal(x.laboratory_pass,false);
  assert.equal(x.full_regulatory_compliance_approval,false);
 }
});
test("Tampering and invented sample PASS fail closed",()=>{
 for(const part of ["source","ledger","queue","dossiers"]){
  const c=ctx(),x=part==="source"?c.pmsv442Source:part==="ledger"?c.pmsv442Ledger:part==="queue"?c.pmsv91Queue:c.pmsv91Dossiers;
  x.mutation=true;assert.equal(c.pmsv442Valid(),false);
 }
 const c=ctx();c.pmsv442Ledger.records.find(x=>x.catalog_id===m.promotions[0].catalog_id).sample_lab_pass=true;
 assert.equal(c.pmsv442Valid(),false);
});
