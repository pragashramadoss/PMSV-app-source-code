"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=x=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",x),"utf8"));
const data=read("fssai-current35-ctr-explicit-article-crosscheck-batch6-2026-10-13.json");
const b5=read("fssai-current35-proof-intake-batch5-2026-10-13.json");
const queue=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const script=fs.readFileSync(path.join(root,"fssai-current35-ctr-explicit-article-crosscheck-batch6-2026-10-13.js"),"utf8");
function ctx(current=structuredClone(data)){
  const c={
    pmsvB5Data:b5,pmsv498Ledger:ledger,pmsv35Queue:queue,
    pmsvB5Valid:()=>true,pmsvLoadPositiveSourceProof:async()=>{},
    sourcePinned121ResearchProofHtml:()=>"<span>prior</span>"
  };
  vm.createContext(c);
  vm.runInContext(script,c);
  c.pmsvB6Evidence=current;
  return c;
}
const product=x=>({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
test("exactly the 35 current pending catalogue identities are covered",()=>{
  const c=ctx(),ids=data.product_cases.map(x=>x.catalog_id);
  const pending=ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");
  assert.equal(c.pmsvB6Valid(),true);
  assert.equal(data.current_source_ledger.catalogue,533);
  assert.equal(data.current_source_ledger.partial_exact,498);
  assert.equal(data.current_source_ledger.first_exact_source_pending,35);
  assert.equal(ids.length,35);assert.equal(new Set(ids).size,35);
  assert.deepEqual(ids,queue.review_records.map(x=>x.catalog_id));
  assert.deepEqual(new Set(ids),new Set(pending.map(x=>x.catalog_id)));
  for(let i=0;i<35;i++){
    const a=data.product_cases[i],p=queue.review_records[i],z=b5.cases[i];
    assert.equal(a.catalog_id,p.catalog_id);assert.equal(a.catalog_id,z.catalog_id);
    assert.equal(a.primary_blocker,z.primary_blocker);
    assert.equal(a.pending_source_status,"FIRST_EXACT_SOURCE_PENDING");
    assert.equal(a.product_compliance_pass,false);
  }
});
test("31 exact CTR reference rows produce 45 unassigned comparisons, seven explicit no-candidate cases",()=>{
  assert.equal(data.named_article_rows.length,31);
  assert.equal(new Set(data.named_article_rows.map(x=>x.key)).size,31);
  assert.equal(data.case_comparisons_count,45);
  assert.equal(data.product_cases.reduce((n,x)=>n+x.compared_article_keys.length,0),45);
  assert.equal(data.case_comparisons_coverage.with_comparisons,28);
  assert.equal(data.case_comparisons_coverage.no_comparisons,7);
  assert.equal(data.product_cases.filter(x=>x.compared_article_keys.length===0).length,7);
  for(const r of data.named_article_rows){
    assert.equal(r.official_source,data.official_ctr);
    assert.equal(r.reference_only_not_assigned,true);
    assert.equal(r.legal_finished_scope_confirmed,false);
    assert.equal(r.lab_result_verified,false);
    assert.equal(typeof r.published_limit,"number");
  }
});
test("all 35 visible cards are research-only and no product or source is approved",()=>{
  const c=ctx();
  assert.equal(data.official_legal_scope_adjudications,0);
  assert.equal(data.first_exact_source_promotions,0);
  assert.equal(data.finished_numeric_limit_assignments,0);
  assert.equal(data.lot_test_verifications,0);
  assert.equal(data.product_compliance_approvals,0);
  for(const p of queue.review_records){
    const html=c.pmsvB6Html(product(p));
    assert.match(html,/Batch 6/);
    assert.match(html,/FIRST EXACT SOURCE STILL PENDING/);
    assert.match(html,/None has been applied as a finished-product threshold/);
    assert.doesNotMatch(html,/product compliant|regulatory PASS granted/i);
  }
  const other=c.pmsvB6Html({id:"outside-35",name:"Other",fssr:"",fcs:""});
  assert.equal(other,"");
});
test("changed numeric source, article, official document, catalogue ID and date fail closed",()=>{
  const edits={
    value:x=>x.named_article_rows[0].published_limit=999,
    description:x=>x.named_article_rows[0].exact_ctr_article="Wrong food",
    CTR:x=>x.official_ctr="https://not-official.example",
    identity:x=>x.product_cases[0].catalog_id="fake-id",
    page:x=>x.named_article_rows[0].pdf_page_zero_based=50,
    effective:x=>x.may_amendment_effective="2026-10-13",
    approved:x=>x.product_compliance_approvals=1,
    case:x=>x.product_cases[0].product_compliance_pass=true
  };
  for(const [name,change] of Object.entries(edits)){
    const x=structuredClone(data);change(x);
    const c=ctx(x);
    assert.equal(c.pmsvB6Valid(),false,name);
    assert.match(c.pmsvB6Html(product(queue.review_records[0])),/comparison unavailable/);
  }
});
test("cocoa-powder comparisons preserve the distinct Pb and Cu fat-free bases",()=>{
 const p=data.product_cases.find(x=>x.catalog_id==="04-04-2-cocoa-beans");
 assert.deepEqual(p.compared_article_keys,["PB_COCOA_POWDER","CU_COCOA_POWDER"]);
 const rows=new Map(data.named_article_rows.map(x=>[x.key,x]));
 assert.equal(rows.get("PB_COCOA_POWDER").published_limit,5);
 assert.equal(rows.get("PB_COCOA_POWDER").pdf_page_zero_based,2);
 assert.match(rows.get("PB_COCOA_POWDER").scope_boundary,/dry fat-free/);
 assert.equal(rows.get("CU_COCOA_POWDER").published_limit,70);
 assert.equal(rows.get("CU_COCOA_POWDER").pdf_page_zero_based,6);
 assert.match(rows.get("CU_COCOA_POWDER").scope_boundary,/fat-free/);
 assert.equal(p.standalone_named_article_confirmed,false);
});
test("new panel follows batch5 and 498/35 ledger without duplicate module script",()=>{
  const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const name="fssai-current35-ctr-explicit-article-crosscheck-batch6-2026-10-13.js";
  assert.ok(h.indexOf("fssai-current-first-source-498-35.js")<h.indexOf(name));
  assert.ok(h.indexOf("fssai-current35-proof-intake-batch5-2026-10-13.js")<h.indexOf(name));
  assert.equal(h.split(name).length-1,1);
  assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
  new vm.Script(script);
});
