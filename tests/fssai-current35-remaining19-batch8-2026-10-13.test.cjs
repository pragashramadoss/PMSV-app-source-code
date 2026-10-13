"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",name),"utf8"));
const d=read("fssai-remaining19-product-identity-gates-batch8-2026-10-13.json");
const b7=read("fssai-current35-fssr-vs-ctr-exclusion-batch7-2026-10-13.json");
const b5=read("fssai-current35-proof-intake-batch5-2026-10-13.json");
const q=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const code=fs.readFileSync(path.join(root,"fssai-current35-remaining19-batch8-2026-10-13.js"),"utf8");
function context(evidence=structuredClone(d)){
 const c={pmsvB7Data:b7,pmsvB5Data:b5,pmsv35Queue:q,pmsv498Ledger:ledger,
  pmsvB7Valid:()=>true,pmsvLoadPositiveSourceProof:async()=>{},
  sourcePinned121ResearchProofHtml:()=>"<span>previous data retained</span>"};
 vm.createContext(c);vm.runInContext(code,c);c.pmsvB8Data=evidence;return c;
}
const product=x=>({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
test("actual remaining 19 IDs are complementary to batch7's 16 and cover all 35 current cases",()=>{
 const ctx=context();
 assert.equal(ctx.pmsvB8Valid(),true);
 assert.equal(ledger.catalogue,533);assert.equal(ledger.partial_exact,498);
 assert.equal(ledger.first_source_pending,35);
 assert.equal(d.cases.length,19);assert.equal(b7.cases.length,16);
 const ids=d.cases.map(x=>x.catalog_id),prev=b7.cases.map(x=>x.catalog_id);
 assert.equal(new Set([...ids,...prev]).size,35);
 assert.deepEqual(new Set([...ids,...prev]),new Set(q.review_records.map(x=>x.catalog_id)));
 for(const x of d.cases){
  const old=ledger.records.find(z=>z.catalog_id===x.catalog_id);
  assert.equal(old.source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.current_first_source_status,"FIRST_EXACT_SOURCE_PENDING");
 }
});
test("nine FSSR identities and ten FoSCoS catalogue-class entries are distinguished",()=>{
 assert.deepEqual(d.by_evidence_class,{EXACT_FSSR_DEFINED:9,FOSCOS_CATEGORY_ONLY:10});
 assert.equal(d.cases.filter(x=>x.identity_pdf_page_zero_based!==null).length,9);
 assert.equal(d.cases.filter(x=>x.identity_pdf_page_zero_based===null).length,10);
 assert.equal(d.cases.find(x=>x.catalog_id==="formulated-supplements-children").identity_pdf_page_zero_based,11);
 assert.match(d.cases.find(x=>x.catalog_id==="10-10-2-egg-powder").source_positive_finding,/hens/);
 assert.match(d.cases.find(x=>x.catalog_id==="10-10-3-pickled-eggs").source_positive_finding,/quail/);
 assert.match(d.cases.find(x=>x.catalog_id==="11-11-1-misri").excluded_unproved_source_transfer,/sulphated ash/);
});
test("every reviewed product keeps pending status, official source and zero compliance or lab PASS",()=>{
 const c=context();
 for(const r of d.cases){
  assert.match(r.official_identity_source,/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i);
  assert.equal(r.regulatory_contaminant_source,d.ctr_primary_source);
  assert.equal(r.legal_named_CTR_source_proven,false);
  assert.equal(r.numeric_limit_assigned,false);
  assert.equal(r.product_compliance_pass,false);
  assert.equal(r.lot_lab_pass,false);
  const source=q.review_records.find(x=>x.catalog_id===r.catalog_id);
  const h=c.pmsvB8Html(product(source));
  assert.match(h,/Batch 8/);
  assert.match(h,/FIRST EXACT NAMED CTR ARTICLE STILL PENDING/);
  assert.match(h,/No numerical limit, lot laboratory pass or product compliance approval/);
 }
 assert.equal(d.source_promotions,0);assert.equal(d.product_compliance_approvals,0);
});
test("all 35 results preserve historical panels; only 19 gain new batch cards",()=>{
 const c=context();
 let rendered=0;
 for(const x of q.review_records){
  const h=c.sourcePinned121ResearchProofHtml(product(x));
  assert.match(h,/previous data retained/);
  if(h.includes("Batch 8"))rendered++;
 }
 assert.equal(rendered,19);
 assert.equal(c.pmsvB8Html({id:"outside",name:"Outside",fssr:"",fcs:""}),"");
});
test("source tampering, wrong product ID, legal-PASS flag or changed composition rule fails closed",()=>{
 for(const k of ["id","source","positive","limit","approval","status","tier","count","page"]){
  const fake=structuredClone(d);
  if(k==="id")fake.cases[0].catalog_id="invalid";
  if(k==="source")fake.cases[0].official_identity_source="https://example.com";
  if(k==="positive")fake.cases[0].source_positive_finding="rewritten";
  if(k==="limit")fake.cases[0].numeric_limit_assigned=true;
  if(k==="approval")fake.product_compliance_approvals=1;
  if(k==="status")fake.cases[1].current_first_source_status="PARTIAL_EXACT_SOURCE_MATCH";
  if(k==="tier")fake.cases[1].identity_evidence_tier="FOSCOS_CATEGORY_ONLY";
  if(k==="count")fake.cases_count=18;
  if(k==="page")fake.cases[0].identity_pdf_page_zero_based=null;
  assert.equal(context(fake).pmsvB8Valid(),false,k);
 }
});
test("batch8 is ordered after batch7, contains one script, and is valid JS",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const newName="fssai-current35-remaining19-batch8-2026-10-13.js";
 assert.ok(html.indexOf(newName)>html.indexOf("fssai-current35-subtype-exclusions-batch7-2026-10-13.js"));
 assert.ok(html.indexOf(newName)<html.indexOf("fssai-nutrition-v476.js"));
 assert.equal(html.split(newName).length-1,1);
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
 new vm.Script(code);
});
