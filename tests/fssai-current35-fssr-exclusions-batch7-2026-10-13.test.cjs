"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const load=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=load("fssai-current35-fssr-vs-ctr-exclusion-batch7-2026-10-13.json");
const b6=load("fssai-current35-ctr-explicit-article-crosscheck-batch6-2026-10-13.json");
const q=load("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=load("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const code=fs.readFileSync(path.join(root,"fssai-current35-subtype-exclusions-batch7-2026-10-13.js"),"utf8");
const product=x=>({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
function context(data=structuredClone(d)){
 const c={
   pmsvB6Evidence:b6,pmsv35Queue:q,pmsv498Ledger:ledger,
   pmsvB6Valid:()=>true,pmsvLoadPositiveSourceProof:async()=>{},
   sourcePinned121ResearchProofHtml:()=>"<span>prior reviewed sources</span>"
 };
 vm.createContext(c);vm.runInContext(code,c);
 c.pmsvB7Data=data;
 return c;
}
test("16 exclusion cases belong to actual pending 35 catalogue IDs, not generic identities",()=>{
 const c=context(),pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(c.pmsvB7Valid(),true);
 assert.equal(ledger.catalogue,533);assert.equal(ledger.partial_exact,498);
 assert.equal(ledger.first_source_pending,35);
 assert.equal(d.cases.length,16);
 assert.equal(new Set(d.cases.map(x=>x.catalog_id)).size,16);
 for(const x of d.cases){
  assert(pending.has(x.catalog_id));assert.equal(x.source_status_after_review,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.product_name,q.review_records.find(y=>y.catalog_id===x.catalog_id).product_name);
 }
});
test("two direct FSSR/CTR contradictions are the vending-water and dried-glucose cases",()=>{
 assert.equal(d.classification_totals.DIRECT_CONTRADICTION,2);
 assert.equal(d.classification_totals.DISTINCT_MARKETED_FORM,13);
 assert.equal(d.classification_totals.DEFINITION_ONLY_NO_CANDIDATE,1);
 const hard=d.cases.filter(x=>x.classification==="DIRECT_CONTRADICTION");
 assert.deepEqual(hard.map(x=>x.catalog_id),["purified-vending-water","11-11-1-dried-glucose-syrup"]);
 assert.match(hard[0].identity_evidence,/other than packaged drinking water/);
 assert.match(hard[1].identity_evidence,/at most 1\.0%/);
 assert.match(hard[1].excluded_auto_transfer_reason,/exceeding 1\.0%/);
});
test("all 16 cited FSSR identities preserve exact CTR key mapping without assigning any limits",()=>{
 const c=context(),keys=new Set(b6.named_article_rows.map(x=>x.key));
 for(const x of d.cases){
  assert.match(x.official_fssr_pdf,/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i);
  assert.match(x.official_ctr_pdf,/^https:\/\/fssai\.gov\.in\//);
  assert.ok(Number.isInteger(x.official_fssr_pdf_page_zero_based));
  assert(x.excluded_direct_transfer_article_keys.every(k=>keys.has(k)));
  assert.equal(x.raw_ingredient_limit_automatically_applied,false);
  assert.equal(x.numeric_limit_assigned,false);
  assert.equal(x.finished_lot_lab_pass,false);
  assert.equal(x.regulatory_compliance_approved,false);
  const qrow=q.review_records.find(z=>z.catalog_id===x.catalog_id);
  const html=c.pmsvB7Html(product(qrow));
  assert.match(html,/FIRST EXACT CTR SOURCE STILL PENDING/);
  assert.match(html,/Other CTR provisions still require review/);
 }
});
test("panels are shown only to 16 researched cases and preserve original source displays",()=>{
 const c=context();
 let count=0;
 for(const qrow of q.review_records){
  const html=c.sourcePinned121ResearchProofHtml(product(qrow));
  assert.match(html,/prior reviewed sources/);
  if(html.includes("Batch 7"))count++;
 }
 assert.equal(count,16);
 assert.equal(c.pmsvB7Html({id:"not-real",name:"Not real",fssr:"",fcs:""}),"");
});
test("tampered evidence, altered scope, future-date change or source promotion fails closed",()=>{
 const mutations={
  ctr:r=>r.cases[0].official_ctr_pdf="https://invalid.example",
  amount:r=>r.cases[0].numeric_limit_assigned=true,
  id:r=>r.cases[0].catalog_id="another-product",
  category:r=>r.cases[0].classification="DISTINCT_MARKETED_FORM",
  digest:r=>r.cases[0].identity_evidence="Someone edited the source",
  future:r=>r.later_amendment_effective="2026-10-13",
  approved:r=>r.compliance_approvals=1,
  key:r=>r.cases[0].excluded_direct_transfer_article_keys=["UNVERIFIED"]
 };
 for(const [k,fn] of Object.entries(mutations)){
  const x=structuredClone(d);fn(x);
  assert.equal(context(x).pmsvB7Valid(),false,k);
 }
});
test("Batch7 script appears after Batch6 and is JavaScript syntax-valid",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const name="fssai-current35-subtype-exclusions-batch7-2026-10-13.js";
 assert.ok(h.indexOf(name)>h.indexOf("fssai-current35-ctr-explicit-article-crosscheck-batch6-2026-10-13.js"));
 assert.ok(h.indexOf(name)<h.indexOf("fssai-nutrition-v476.js"));
 assert.equal(h.split(name).length-1,1);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
 new vm.Script(code);
});
