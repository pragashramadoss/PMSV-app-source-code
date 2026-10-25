"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const rows=b56.cases.flatMap(c=>c.gates.map(g=>({
  rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
  case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,
  routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
  original_request_status:g.immutable_request_state,original_document_status:g.immutable_document_state
})));
assert.equal(rows.length,175);
const document={
  readyState:"loading",
  addEventListener(){},
  getElementById(){return null}
};
const window={
 pmsvB58OwnerOutreach:{valid:()=>true,records:()=>rows},
 pmsvB87Catalogue:{
  closureVerified:()=>true,
  closedResearchSummary:()=>({catalogue:533,public_source_desk_research_closed:35,
    external_legal_and_lot_verification_held:35,product_releases:0,
    signed_product_limits:0,validated_lab_lot_pass:0}),
  load:async()=>true
 }
};
const file=root+"pmsv-batch96-method-authority-preflight-2026-10-25.js";
const js=fs.readFileSync(file,"utf8");
vm.runInNewContext(js,{window,document,console,setTimeout});
const api=window.pmsvB96MethodPreflight;
assert(api);
assert.equal(api.valid(),true);
const cases=api.entries();
assert.equal(cases.length,35);
assert.equal(new Set(cases.map(x=>x.id)).size,35);
assert.equal(cases.filter(x=>x.method_family==="METALS").length,27);
assert.equal(cases.filter(x=>x.method_family==="NON_METAL").length,8);
assert.equal(cases.filter(x=>x.analyte==="Lead").length,24);
assert(cases.every(c=>c.release==="HELD"&&c.method_approval==="NO"&&
  c.legal_approval==="NO"&&c.lot_pass==="NO"));
assert.equal(api.sources.consultation.startsWith("https://fssai.gov.in/"),true);
assert.equal(api.sources.trace.startsWith("https://fssai.gov.in/"),true);
(async()=>{
 assert.equal(await api.load(),true);
 const csv=api.csv();
 assert.equal(csv.trim().split("\r\n").length,36);
 assert.match(csv,/consultation_09001_loq_mgkg/);
 assert.match(csv,/AUTHORITY_VERSION_AND_MATRIX_LOQ_UNVERIFIED/);
 const lead=cases.find(x=>x.analyte==="Lead");
 const nonmetal=cases.find(x=>x.analyte==="Ochratoxin A");
 const leadDraft=api.draft(lead),otherDraft=api.draft(nonmetal);
 assert.match(leadDraft,/Different 61-page Trace Elements 09.001 procedure/);
 assert.match(leadDraft,/6 mg\/kg/);
 assert.match(leadDraft,/NOT SENT/);
 assert.match(otherDraft,/NON-METAL analyte/);
 assert.doesNotMatch(otherDraft,/LOQ 6 mg\/kg/);
 assert.doesNotMatch(leadDraft,/compliance approved|lot approved/i);
 // A tampered status fails CLOSED, without publishing a CSV.
 rows[0].original_document_status="RECEIVED";
 assert.equal(api.valid(),false);
 assert.equal(api.csv(),"");
 rows[0].original_document_status="NOT_RECEIVED";
 assert.equal(api.valid(),true);
 // A duplicated immutable request must fail closed.
 rows[1].request_id=rows[0].request_id;
 assert.equal(api.valid(),false);
 console.log("Batch96 PASS: 35 held cases (27 metals/8 nonmetals), 175 unique unsent requests, method source collision/LOQ cautions and fail-closed validation.");
})().catch(e=>{console.error(e);process.exitCode=1;});