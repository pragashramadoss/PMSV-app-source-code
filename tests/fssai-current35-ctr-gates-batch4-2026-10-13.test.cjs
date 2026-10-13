"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const product="fssai-product-helper-preview-01";
const load=p=>JSON.parse(fs.readFileSync(path.join(root,product,"data/rules",p),"utf8"));
const data=load("fssai-current35-exact-ctr-article-gates-batch4-2026-10-13.json");
const queue=load("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=load("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const prior=[
"verification/fssai-finished-product-conditional-research-2026-10-13.json",
"verification/fssai-product-subtype-evidence-batch2-2026-10-13.json",
"verification/fssai-product-subtype-evidence-batch3-2026-10-13.json"
].map(x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8")));

test("35 current gaps exactly match 498/35 authoritative ledger IDs",()=>{
  assert.equal(ledger.catalogue,533);
  assert.equal(ledger.partial_exact,498);
  assert.equal(ledger.first_source_pending,35);
  assert.equal(data.cases.length,35);
  assert.equal(queue.review_records.length,35);
  const active=ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");
  assert.equal(active.length,35);
  assert.deepEqual(data.cases.map(x=>x.catalog_id),queue.review_records.map(x=>x.catalog_id));
  assert.deepEqual(new Set(data.cases.map(x=>x.catalog_id)),new Set(active.map(x=>x.catalog_id)));
  for(let i=0;i<35;i++){
    const row=data.cases[i],q=queue.review_records[i];
    assert.equal(row.product_name,q.product_name);
    assert.equal(String(row.fssr||""),String(q.fssr||""));
    assert.equal(String(row.fcs||""),String(q.fcs||""));
    assert.equal(row.latest_authoritative_status,"FIRST_EXACT_SOURCE_PENDING");
  }
});

test("source review is guarded and does not grant legal clearance",()=>{
  assert.equal(data.current_ctr_scope_checks_completed,35);
  assert.equal(data.required_original_documents,140);
  assert.equal(data.required_positive_evidence_flags,140);
  assert.equal(data.named_finished_ctr_article_promotions,0);
  assert.equal(data.finished_numeric_limits_activated,0);
  assert.equal(data.finished_lab_tests_verified,0);
  assert.equal(data.full_regulatory_passes,0);
  assert.equal(data.master_ledger_mutated,false);
  assert.equal(data.application_ui_mutated,true);
  for(const x of data.cases){
    assert.equal(x.documents_required.length,4);
    assert.equal(Object.keys(x.verification_gates).length,4);
    assert(Object.values(x.verification_gates).every(y=>y===false));
    assert.equal(x.finished_compliance_pass,false);
    assert.equal(x.current_ctr_article_test.limit_assigned,false);
    assert.equal(x.current_ctr_article_test.reference_only,true);
    assert.equal(x.current_ctr_article_test.legal_scope_result,"INSUFFICIENT_EVIDENCE_FOR_DIRECT_FINISHED_ARTICLE_MATCH");
    assert.equal(x.december_2026_amendment.status_as_of_review,"NOT_YET_EFFECTIVE");
    assert.equal(x.december_2026_amendment.automatic_application,false);
    assert.match(x.current_CTR_document,/^https:\/\/fssai\.gov\.in\//);
    assert.match(x.current_FSSR_document,/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//);
  }
});

test("18 history crosslinks point to real earlier research rows only",()=>{
  const sets=prior.map(x=>new Set(x.records.map(r=>r.code||r.id)));
  const x=data.cases.flatMap(r=>r.research_crosslinks);
  assert.equal(x.length,18);
  for(const r of x){
    assert(sets[r.packet_index-1]?.has(r.record_key));
    assert.match(r.reference_status,/not current named CTR evidence/);
  }
});

test("new Helper UI is syntactically valid and loaded after the 498/35 module",()=>{
  const html=fs.readFileSync(path.join(root,product,"index.html"),"utf8");
  const jsName="fssai-current35-ctr-legal-gates-batch4-2026-10-13.js";
  const js=fs.readFileSync(path.join(root,product,jsName),"utf8");
  new vm.Script(js,{filename:jsName});
  assert.equal(html.split(jsName).length-1,1);
  assert(html.indexOf(jsName)>html.indexOf("fssai-current-first-source-498-35.js"));
  assert(html.indexOf(jsName)<html.indexOf("fssai-nutrition-v476.js"));
  assert.match(js,/pmsv498Valid\(\)/);
  assert.match(js,/sourcePinned121ResearchProofHtml=function/);
  assert.match(js,/FIRST EXACT SOURCE STILL PENDING/);
  assert.doesNotMatch(js,/numeric_finished_food_limit_auto_applied\s*=\s*true/);
});
