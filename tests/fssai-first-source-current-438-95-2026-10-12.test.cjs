"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),data="fssai-product-helper-preview-01/data/rules/";
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,data+n),"utf8"));
const m=rd("fssai-fat-spread-nickel-first-source-2026-10-12.json"),d=rd("fssai-current-first-source-533-live-ledger-438-95-2026-10-12.json"),
 q=rd("fssai-current-95-first-exact-source-proof-worklist-2026-10-12.json"),
 w=rd("fssai-95-current-pending-finished-food-evidence-dossiers-2026-10-12.json"),
 old=rd("fssai-current-first-source-533-live-ledger-437-96-2026-10-12.json"),
 prior=rd("fssai-current-96-first-exact-source-proof-worklist-2026-10-12.json"),
 js=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/fssai-first-source-current-438-95.js"),"utf8"),
 html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const hash=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,contaminantsDb:{source_version:"Version IX (03.02.2026)",official_sources:[{url:m.promotion.ctr_source}]},
 pmsv2026Current437Ledger:old,pmsv2026Current96Queue:prior,pmsv2026Current437Valid:()=>true,
 pmsvReviewSnapshotDigest:hash,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"",pmsvCurrent116ProofChecklistHtml:()=>"",esc:s=>String(s)};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv2026Current438Manifest=structuredClone(m);
 c.pmsv2026Current438Ledger=structuredClone(d);
 c.pmsv2026Current95Queue=structuredClone(q);
 c.pmsv2026Current95Dossiers=structuredClone(w);
 return c;
}
test("Complete 533/438/95 source ledger, 95 individual evidence dossiers and single fat source promotion",()=>{
 const c=ctx();assert.equal(c.pmsv2026Current438Valid(),true);
 assert.equal(d.records.length,533);assert.equal(d.partial_exact,438);assert.equal(d.first_source_pending,95);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,438);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,95);
 assert.equal(q.review_records.length,95);assert.equal(w.records.length,95);
 assert.equal(w.high_priority_count,w.records.filter(x=>x.priority==="HIGH").length);
 assert.ok(w.high_priority_count>=40);assert.equal(m.current.full_approvals,0);
 assert.ok(html.includes('fssai-first-source-current-438-95.js?v=20261012-43895'));
});
test("Process qualified Nickel source 1.5 mg/kg is never applied to all milk fat/vegetable fat spreads",()=>{
 const f=m.promotion;
 assert.equal(f.contaminant,"Nickel");assert.equal(f.maximum,1.5);assert.equal(f.unit,"mg/kg");
 assert.match(f.ctr_article,/hydrogenated/i);assert.match(f.ctr_article,/fat spread/i);
 assert.equal(f.fssr,"2.2.5(3)");
 assert.ok(f.excluded.some(x=>x.includes("milk-fat")));
 assert.ok(f.excluded.some(x=>x.includes("unhydrogenated")));
 assert.equal(f.confirmed_qualifying_actual_lot,false);
 assert.equal(f.processing_qualifier_confirmed,false);
 assert.equal(f.lab_result_available,false);
 assert.equal(f.full_legal_compliance_pass,false);
 const n=d.records.find(x=>x.catalog_id===f.catalog_id);
 assert.equal(n.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
 assert.equal(n.sample_lab_pass,false);assert.equal(n.product_compliance_approval,false);
});
test("95 independent unresolved legal decision dossiers preserve nontransfer and no PASS",()=>{
 const oldIds=new Set(prior.review_records.map(x=>x.catalog_id)),a=new Set();
 for(const x of w.records){
  assert.ok(oldIds.has(x.catalog_id));assert.ok(!a.has(x.catalog_id));a.add(x.catalog_id);
  assert.equal(x.first_positive_finished_article_proof_missing,true);
  assert.equal(x.post_compendium_amendments_current_effectivity_not_cleared,true);
  assert.equal(x.actual_lot_identity_verified,false);assert.equal(x.laboratory_pass,false);
  assert.equal(x.numeric_finished_food_limit_auto_applied,false);
  assert.ok(x.recorded_required_evidence.length>0);assert.ok(x.specialist_identity_gate.length>0);
 }
 assert.ok(!a.has(m.promotion.catalog_id));
 assert.ok(w.records.filter(x=>x.review_type==="egg").length===4);
 assert.ok(w.records.filter(x=>x.review_type==="sugar").length===8);
 assert.ok(w.records.filter(x=>x.review_type==="vegetable_puree").length===3);
 assert.ok(w.records.filter(x=>x.review_type==="dairy_analogue").length===8);
});
test("Digest tampering, fake numerical PASS and prior source mutation fail closed",()=>{
 for(const which of ["manifest","ledger","queue","dossier"]){
  const c=ctx(),o=which==="manifest"?c.pmsv2026Current438Manifest:which==="ledger"?c.pmsv2026Current438Ledger:which==="queue"?c.pmsv2026Current95Queue:c.pmsv2026Current95Dossiers;
  o.testTamper=true;assert.equal(c.pmsv2026Current438Valid(),false,which);
 }
 const c=ctx();c.pmsv2026Current438Ledger.records.find(x=>x.catalog_id===m.promotion.catalog_id).sample_lab_pass=true;
 assert.equal(c.pmsv2026Current438Valid(),false);
});
test("All current Helper external script tags are closed; no swallowing dependency scripts",()=>{
 for(const file of ["fssai-65-current-111-finished-source-decision-matrix.js","fssai-final-46-current-111-source-boundary.js","fssai-first-source-current-423-110.js",
  "fssai-first-source-current-428-105.js","fssai-first-source-current-437-96.js","fssai-first-source-current-438-95.js"]){
  const re=new RegExp('<script src="./'+file.replaceAll('.','\\.')+'[^"]*"><\\/script>');
  assert.match(html,re,file);
 }
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
});
