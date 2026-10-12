"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(path.join(root,base+"data/rules/"+n),"utf8"));
const m=read("fssai-two-whole-egg-shell-free-residue-2026-10-12.json"),
 d=read("fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json"),
 q=read("fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json"),
 w=read("fssai-89-detailed-finished-identity-audit-2026-10-12.json"),
 old=read("fssai-current-first-source-533-live-ledger-442-91-2026-10-12.json"),
 prior=read("fssai-current-91-first-exact-source-proof-worklist-2026-10-12.json"),
 js=fs.readFileSync(path.join(root,base+"fssai-first-source-current-444-89.js"),"utf8"),
 html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const hash=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,contaminantsDb:{source_version:m.source_version,official_sources:[{url:m.official_ctr}]},
 pmsv442Ledger:old,pmsv91Queue:prior,pmsv442Valid:()=>true,pmsvReviewSnapshotDigest:hash,
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv444Manifest=structuredClone(m);c.pmsv444Ledger=structuredClone(d);
 c.pmsv89Queue=structuredClone(q);c.pmsv89Dossier=structuredClone(w);return c;
}
test("533-products, 444 partial named sources and 89 pending; ledger disjoint and complete",()=>{
 assert.equal(ctx().pmsv444Valid(),true);
 assert.equal(d.records.length,533);assert.equal(d.partial_exact,444);assert.equal(d.first_source_pending,89);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,444);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,89);
 assert.equal(q.review_records.length,89);assert.equal(w.remaining_records.length,89);
 assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,89);
 assert.ok(html.includes("fssai-first-source-current-444-89.js"));
});
test("Official FSSR 2.5.3 liquid/frozen WHOLE hen eggs and CTR shell-free Eggs source only",()=>{
 assert.equal(m.products.length,2);assert.equal(m.article_pesticide_serial,13);
 assert.equal(m.source_limit_mgkg,0.1);assert.equal(m.article_basis,"shell free basis");
 assert.ok(m.products.some(x=>x.fssr==="2.5.3(4)"));
 assert.ok(m.products.some(x=>x.fssr==="2.5.3(2)"));
 for(const x of m.products){
 assert.equal(x.actual_lot_whole_egg_identity_confirmed,false);
 assert.equal(x.finished_matrix_processing_equivalence_confirmed,false);
 assert.equal(x.lab_result_and_method_confirmed,false);
 assert.equal(x.processing_factor_confirmed,false);
 assert.equal(x.numeric_limit_auto_applied,false);
 assert.equal(x.compliance_pass,false);
 assert.equal(d.records.find(z=>z.catalog_id===x.catalog_id).sample_lab_pass,false);
 }
});
test("Egg powder/pickled eggs remain pending; no raw eggs carryover",()=>{
 for(const id of m.not_promoted_product_ids){
 assert.ok(q.review_records.some(x=>x.catalog_id===id));
 assert.equal(d.records.find(x=>x.catalog_id===id).source_status,"FIRST_EXACT_SOURCE_PENDING");
 }
 assert.equal(m.not_promoted_product_ids.length,2);
});
test("Large case-by-case audit covers distinct pending product groups",()=>{
 assert.equal(w.audited_records.length,w.audited_count);
 assert.ok(w.audited_count>=30);
 const ids=new Set(w.remaining_records.map(x=>x.catalog_id));
 for(const x of w.audited_records){
 assert.ok(ids.has(x.catalog_id));assert.ok(x.source_qualifier_decision.length>20);
 assert.equal(x.automatic_numeric_limit_allowed,false);assert.equal(x.laboratory_pass,false);
 assert.equal(x.full_regulatory_pass,false);assert.equal(x.actual_finished_matrix_verified,false);
 }
 for(const grp of ["egg","dairy_analogue","vegetable_puree","milled_processing","cocoa_form","fungi","coconut_form"]){
 assert.ok(w.audited_records.some(x=>x.review_group===grp),grp);
 }
});
test("Tampering all digests and forged regulatory/laboratory clearance fails closed",()=>{
 for(const which of ["manifest","ledger","queue","dossier"]){
  const c=ctx(),v=which==="manifest"?c.pmsv444Manifest:which==="ledger"?c.pmsv444Ledger:which==="queue"?c.pmsv89Queue:c.pmsv89Dossier;
  v.unapprovedChange=true;assert.equal(c.pmsv444Valid(),false,which);
 }
 const c=ctx();c.pmsv444Ledger.records.find(x=>x.catalog_id===m.products[0].catalog_id).sample_lab_pass=true;
 assert.equal(c.pmsv444Valid(),false);
});
