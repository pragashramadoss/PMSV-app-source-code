"use strict";
/* Batch83: original scope and role-filter integrity; reference research cannot confer compliance. */
const assert=require("node:assert/strict"),fs=require("node:fs");
const base="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(base+"data/rules/"+n+".json","utf8"));
const p1=read("fssai-batch82-p1-22-original-evidence-desk-2026-10-19");
const b56=read("fssai-current35-175-proof-reference-triage-batch56-2026-10-16");
const b59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17");
const final35=read("fssai-final35-legal-candidate-audit-2026-10-17");
const html=fs.readFileSync(base+"index.html","utf8");
const script=fs.readFileSync(base+"fssai-batch82-p1-original-evidence-desk-2026-10-19.js","utf8");
const browser=fs.readFileSync("tests/pmsv-batch82-p1-browser.test.cjs","utf8");
assert.equal(p1.rows.length,22);assert.equal(b59.cases.length,35);
assert.equal(b56.cases.length,35);assert.equal(final35.rows.length,35);
assert.equal(p1.totals.catalogue,533);assert.equal(p1.totals.conditional_sources,498);
assert.equal(p1.totals.original_held_cases,35);assert.equal(p1.totals.p1_original_request_ids,110);
assert.equal(p1.totals.all_original_request_ids,175);
const m=new Map(b56.cases.map(c=>[c.catalogue_id,c])),ref=new Map(b59.cases.map(c=>[c.catalogue_id,c]));
const legal=new Map(final35.rows.map(c=>[c.case_id,c]));
const roleList=["FSSAI_QA_DIVISION_AND_LAB_DIRECTOR","MANUFACTURER_OR_SUPPLIER_QA","REGULATORY_AFFAIRS_LEGAL","LABORATORY_TECHNICAL_MANAGER","SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"];
const totals=Object.fromEntries(roleList.map(x=>[x,0]));
const allIDs=new Set(),priority={P0:0,P1:0};
for(const c of b56.cases){
 const x=ref.get(c.catalogue_id);
 assert(x,"Original case absent from CTR reference crosswalk");
 assert(["P0","P1"].includes(x.priority));priority[x.priority]++;
 assert.equal(c.gates.length,5);
 for(const g of c.gates){assert(!allIDs.has(g.request_id),"Duplicate original evidence ID");allIDs.add(g.request_id)}
}
assert.deepEqual(priority,{P0:13,P1:22});assert.equal(allIDs.size,175);
const p1ids=new Set(),families={},identity={named:0,unspecified:0};
for(const c of p1.rows){
 const original=m.get(c.case_id),match=ref.get(c.case_id),f=legal.get(c.case_id);
 assert(original&&match&&f&&match.priority==="P1");
 assert.equal(c.product,f.product);assert.equal(c.analyte,f.analyte);
 assert.equal(c.exact_legal_question,f.exact_source_decision_question);
 assert.equal(c.current_research_url,f.official_source_research_URL);
 assert.equal(c.legal_article_signed,false);assert.equal(c.method_and_nabl_scope_signed,false);
 assert.equal(c.actual_lot_coa_received,false);assert.equal(c.release,"HELD");
 assert.equal(c.documentary_requests.length,5);
 assert.deepEqual(c.documentary_requests.map(g=>g.request_id),original.gates.map(g=>g.request_id));
 assert.deepEqual(c.documentary_requests.map(g=>g.owner_role).sort(),[...roleList].sort());
 families[c.analyte_family]=(families[c.analyte_family]||0)+1;
 if(c.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED")identity.unspecified++;
 else if(c.identity_status==="PUBLISHED_PRODUCT_STANDARD_ONLY_COMMERCIAL_COMPLIANCE_UNVERIFIED")identity.named++;
 else assert.fail("Unexpected P1 identity");
 for(const g of c.documentary_requests){
  assert.equal(g.request_state,"NOT_SENT");assert.equal(g.document_state,"NOT_RECEIVED");
  assert.equal(g.authentication_state,"NOT_AUTHENTICATED");
  assert(allIDs.has(g.request_id));assert(!p1ids.has(g.request_id));p1ids.add(g.request_id);
  totals[g.owner_role]++;
 }
}
assert.equal(p1ids.size,110);
assert.deepEqual(identity,{named:16,unspecified:6});
assert.deepEqual(families,{MYCOTOXINS:3,UNSPECIFIED_RESIDUE:1,TRACE_METALS:15,PESTICIDE_RESIDUES:3});
assert(roleList.every(x=>totals[x]===22));
assert(script.includes('function visibleRequests(x)'));
assert(script.includes('for(const c of cases)for(const g of visibleRequests(c))'));
assert(script.includes("visibleRequestCount"));
assert(browser.includes('el.open=true'));
for(const role of roleList)assert(browser.includes(role));
assert(html.includes("fssai-batch82-p1-original-evidence-desk-2026-10-19.js?v=20261019-b82"));
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|XMLHttpRequest)/.test(script));
assert.equal(p1.totals.requested,0);assert.equal(p1.totals.documents_received,0);
assert.equal(p1.totals.legal_limits_approved,0);assert.equal(p1.totals.laboratory_methods_approved,0);
assert.equal(p1.totals.lot_coas,0);assert.equal(p1.totals.releases,0);
console.log("B83 PASS: 35 HELD/175 immutable IDs, 22 P1/110 IDs, 5 independent owner-role worklists of 22, 0 requests/approvals/releases.");
