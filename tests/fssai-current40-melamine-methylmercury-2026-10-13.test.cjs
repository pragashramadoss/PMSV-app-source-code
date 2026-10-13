"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",f),"utf8"));
const d=read("fssai-current40-melamine-methylmercury-2026-10-13.json");
const q=read("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const l=read("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json");
const js=fs.readFileSync(path.join(root,"fssai-current40-melamine-methylmercury-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function context(){
 const c={console,pmsv493Valid:()=>true,pmsvCurrent40FallbackValid:()=>true,pmsvReviewSnapshotDigest:digest,
 pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"Existing source decisions preserved",esc:String};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv40MelamineUniversalData=JSON.parse(JSON.stringify(d));return c;
}
test("40 source identity crosschecks preserve every pending named-article case",()=>{
 const c=context();assert.equal(c.pmsv40MelamineUniversalValid(),true);
 assert.equal(d.reviewed_identities,40);assert.equal(d.source_article_comparisons,80);
 assert.equal(d.infant_formula_exclusions_reviewed,80);
 assert.equal(d.named_article_promotions,0);assert.equal(d.auto_numeric_limit_assignments,0);assert.equal(d.lab_passes,0);
 assert.equal(new Set(d.identity_specific_crosschecks.map(x=>x.catalog_id)).size,40);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,40);
 for(const x of d.identity_specific_crosschecks){
  assert.equal(x.named_finished_article_promoted,false);assert.equal(x.regulatory_compliance_pass,false);
  assert.equal(x.laboratory_melamine_result_verified,false);assert.equal(x.laboratory_methylmercury_result_verified,false);
 }
});
test("Official IX paragraph 2.5.1 has three DIFFERENT melamine legal scopes; total mercury not confused with methylmercury",()=>{
 assert.deepEqual(d.official_crosscutting_rows.map(x=>[x.id,x.article,x.limit,x.page0]),[
 ["melamine-powdered-infant","Powdered infant formula",1,50],
 ["melamine-liquid-infant","Liquid infant formula",0.15,50],
 ["melamine-other-foods","Other foods",2.5,50],
 ["methylmercury-all-foods","All foods",0.25,11]]);
 assert.equal(d.source_url,"https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");
 const c=context(),child=d.identity_specific_crosschecks.find(x=>x.catalog_id==="formulated-supplements-children");
 assert.equal(child.legal_scope_track,"CHILD_PRODUCT_INFANT_FORMULA_DISTINCTION");
 assert.match(child.infant_formula_evidence_required,/above 24 to 36 months/);
 const h=c.pmsv40MelamineUniversalHtml({id:child.catalog_id,name:child.product_name,fssr:child.fssr,fcs:child.fcs});
 assert.match(h,/2.5/);assert.match(h,/0.15/);assert.match(h,/total mercury/);
 assert.match(h,/PENDING/);assert.doesNotMatch(h,/laboratory PASS achieved/);
});
test("Tampering any official number, category, status, identity or proof fails closed",()=>{
 for(const mod of [
  c=>c.pmsv40MelamineUniversalData.official_crosscutting_rows[2].limit=3,
  c=>c.pmsv40MelamineUniversalData.official_crosscutting_rows[0].article="Other foods",
  c=>c.pmsv40MelamineUniversalData.identity_specific_crosschecks[0].named_finished_article_promoted=true,
  c=>c.pmsv40MelamineUniversalData.identity_specific_crosschecks[3].product_name="Other product",
  c=>c.pmsv40MelamineUniversalData.identity_specific_crosschecks[2].regulatory_compliance_pass=true,
  c=>c.pmsv40MelamineUniversalData.source_url="https://unofficial.example",
  c=>c.pmsv40MelamineUniversalData.identity_specific_crosschecks.splice(20,1),
 ]){
  const c=context();mod(c);assert.equal(c.pmsv40MelamineUniversalValid(),false);
 }
});
test("Preview HTML script order and no WordPress changes",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const a=html.indexOf("fssai-current40-positive-metal-fallback-sources-2026-10-13.js");
 const b=html.indexOf("fssai-current40-melamine-methylmercury-2026-10-13.js");
 const c=html.indexOf("fssai-pending-40-quality-coverage.js");
 assert.ok(a>0&&b>a&&c>b);assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
});
